import fs from "node:fs/promises";

import {
  pathToFileURL,
  fileURLToPath,
} from "node:url";

import {
  resolve as ImportMetaResolve,
} from 'import-meta-resolve'

import {
  Deferred
} from "../utilities/PromiseTypes.js";

import {
  GuestEngine,
  type ThrowOr
} from "./GuestEngine.js";

import {
  RealmHostDefined
} from "./RealmHostDefined.js";

import {
  convertGuestPromiseToVoidHostPromise
} from "./built-ins/HostPromiseForGuestPromise.js";

import type {
  GuestRealmInputs,
  GuestRealmOutputs,
} from "./types/Virtualization262.js";

export async function runInRealm(
  inputs: GuestRealmInputs
): Promise<GuestRealmOutputs>
{
  const contents = await fs.readFile(inputs.absolutePathToFile, { "encoding": "utf-8" });
  const realmDriver = new RealmDriver;

  const agent = new GuestEngine.Agent({
    onDebugger() {
      // eslint-disable-next-line no-debugger
      debugger;
    },
    // ensureCanCompileStrings() {},
    // hasSourceTextAvailable() {},

    async loadImportedModule(
      referrer: GuestEngine.SourceTextModuleRecord,
      specifier: string,
      hostDefined: object,
      finish: (res: ThrowOr<GuestEngine.SourceTextModuleRecord/* | GuestEngine.SyntheticModuleRecord*/>) => void
    )
    {
      const moduleOrThrow: ThrowOr<GuestEngine.SourceTextModuleRecord> = await realmDriver.resolveModule(specifier, referrer);
      finish(moduleOrThrow);
    },

    // onNodeEvaluation() {},
    // features: [],
  });
  GuestEngine.setSurroundingAgent(agent);

  const realm = new GuestEngine.ManagedRealm(realmDriver.hostDefined);

  realm.scope(() => {
    if (inputs.defineBuiltIns) {
      inputs.defineBuiltIns(realm);
    }

    realmDriver.loadModule(inputs.absolutePathToFile, contents, realm);
  });

  while (realmDriver.loadRequestResult!.PromiseState === "pending") {
    await Promise.all(realmDriver.resolveModulePromises);
  }

  realm.scope(() => {
    realmDriver.runModule(realm);
  });

  const evalResult: GuestEngine.PromiseObjectValue | undefined = realmDriver.evalResult;
  GuestEngine.Assert(evalResult !== undefined);

  do {
    await Promise.resolve(true);
    realm.scope(() => realmDriver.flushPendingPromises());
  } while (realmDriver.hostDefined.hasPendingPromises());

  await realmDriver.moduleCompleted;
  return realmDriver.finalizeResults();
}

export class RealmDriver {
  #exceptionThrown = false;
  readonly #results = new RealmResults;

  readonly resolverCache = new Map<unknown, unknown>;
  readonly #specifierToModuleRecordMap = new Map<string, GuestEngine.SourceTextModuleRecord>;
  readonly #moduleRecordToSpecifierMap = new WeakMap<GuestEngine.SourceTextModuleRecord, string>;
  readonly trackedPromises = new Set<GuestEngine.PromiseObjectValue>;

  readonly hostDefined = new RealmHostDefined(this);

  readonly resolveModulePromises = new Set<Promise<unknown>>;

  readonly #moduleCompletedDeferred = new Deferred<void>;
  readonly moduleCompleted: Promise<void> = this.#moduleCompletedDeferred.promise;

  #mainModule?: GuestEngine.SourceTextModuleRecord;
  loadRequestResult?: GuestEngine.PromiseObjectValue;
  evalResult?: GuestEngine.PromiseObjectValue;

  public async resolveModule(
    targetSpecifier: string,
    referrer: GuestEngine.SourceTextModuleRecord,
  ): Promise<ThrowOr<GuestEngine.SourceTextModuleRecord>>
  {
    const promise = this.#resolveModule(targetSpecifier, referrer);
    this.resolveModulePromises.add(promise);
    return await promise.finally(() => this.resolveModulePromises.delete(promise));
  }

  async #resolveModule(
    targetSpecifier: string,
    referrer: GuestEngine.SourceTextModuleRecord,
  ): Promise<ThrowOr<GuestEngine.SourceTextModuleRecord>>
  {
    GuestEngine.Assert(referrer.Realm instanceof GuestEngine.ManagedRealm);

    const sourceSpecifier = this.#moduleRecordToSpecifierMap.get(referrer)!;
    const resolvedSpecifier = ImportMetaResolve(targetSpecifier, sourceSpecifier);

    const cachedModule: ThrowOr<GuestEngine.SourceTextModuleRecord> | undefined = this.#specifierToModuleRecordMap.get(resolvedSpecifier);
    if (cachedModule)
      return cachedModule;

    if (!resolvedSpecifier.startsWith("file://"))
      return GuestEngine.Throw("Error", "CouldNotResolveModule", targetSpecifier);

    const absolutePathToFile = fileURLToPath(resolvedSpecifier);
    const contents = await fs.readFile(absolutePathToFile, { "encoding": "utf-8" });

    const module = referrer.Realm.createSourceTextModule(
      resolvedSpecifier,
      contents
    );

    if (module instanceof GuestEngine.SourceTextModuleRecord) {
      this.#specifierToModuleRecordMap.set(resolvedSpecifier, module);
      this.#moduleRecordToSpecifierMap.set(module, resolvedSpecifier);
    }

    return module;
  }

  public loadModule(
    absolutePathToFile: string,
    contents: string,
    realm: GuestEngine.ManagedRealm
  ): void
  {
    const specifier = pathToFileURL(absolutePathToFile).href;
    const createSourceResult: GuestEngine.ThrowCompletion | GuestEngine.SourceTextModuleRecord = realm.createSourceTextModule(
      pathToFileURL(absolutePathToFile).href, contents
    );

    if (createSourceResult instanceof GuestEngine.ThrowCompletion) {
      this.#processAbruptCompletion(createSourceResult);
      return;
    }

    this.#mainModule = createSourceResult;
    this.#specifierToModuleRecordMap.set(specifier, this.#mainModule);
    this.#moduleRecordToSpecifierMap.set(this.#mainModule, specifier);

    this.loadRequestResult = this.#mainModule.LoadRequestedModules();
    if (this.loadRequestResult instanceof GuestEngine.AbruptCompletion) {
      //@ts-expect-error ReturnType<LoadRequestedModule> says this shouldn't happen.
      this.#processAbruptCompletion(this.loadRequestResult);
      return;
    }
  }

  public runModule(
    realm: GuestEngine.ManagedRealm
  ): void
  {
    const linkResult = this.#mainModule!.Link();
    if (linkResult instanceof GuestEngine.ThrowCompletion) {
      this.#processAbruptCompletion(linkResult);
      return;
    }

    this.evalResult = this.#mainModule!.Evaluate();

    const hostPromise: Promise<void> = convertGuestPromiseToVoidHostPromise(this.evalResult);
    hostPromise.then(
      () => this.#moduleCompletedDeferred.resolve(),
      () => {
        realm.scope(() => {
          this.#processAbruptCompletion(GuestEngine.Throw(
            "Error", "Raw", GuestEngine.inspect(this.evalResult!.PromiseResult!)
          ));
        });
        this.#moduleCompletedDeferred.resolve();
      }
    );
  }

  #processAbruptCompletion(result: GuestEngine.AbruptCompletion): void {
    const inspected = GuestEngine.inspect(result as unknown as GuestEngine.Value);
    void(inspected);

    if (result.Type === "throw")
      this.#exceptionThrown = true;
  }

  flushPendingPromises(): void {
    GuestEngine.Assert(this.#mainModule !== undefined);
    GuestEngine.Assert(this.evalResult !== undefined);

    this.#mainModule.Evaluate();
  }

  finalizeResults(): RealmResults {
    if (this.trackedPromises.size) {
      this.#results.unhandledPromises.push(...this.trackedPromises);
      /*
      const unhandledRejects: readonly PromiseObjectValue[] = Array.from(this.trackedPromises);
      const unhandledErrors: readonly Error[] = unhandledRejects.map(value => new Error(inspect(value)));
      throw new AggregateError(unhandledErrors);
      */
      this.#results.succeeded = false;
    }
    else {
      this.#results.succeeded = !this.#exceptionThrown;
    }
    return this.#results;
  }
}

export class RealmResults implements GuestRealmOutputs
{
  readonly unhandledPromises: GuestEngine.PromiseObjectValue[] = [];
  succeeded = false;
}
