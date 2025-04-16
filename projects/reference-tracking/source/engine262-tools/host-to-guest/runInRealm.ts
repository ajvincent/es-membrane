import fs from "node:fs";

import {
  pathToFileURL,
  fileURLToPath,
} from "node:url";

import {
  resolve as ImportMetaResolve,
} from 'import-meta-resolve'

import type {
  GuestRealmInputs,
  GuestRealmOutputs,
} from "../types/Virtualization262.js";

import {
  Deferred
} from "../../utilities/PromiseTypes.js";

import {
  GuestEngine,
  type PlainCompletion,
  type ThrowOr
} from "./GuestEngine.js";

import {
  RealmHostDefined
} from "./RealmHostDefined.js";

/*
import {
  convertGuestPromiseToVoidHostPromise
} from "./HostPromiseForGuestPromise.js";
*/

export async function runInRealm(
  inputs: GuestRealmInputs
): Promise<GuestRealmOutputs>
{
  const contents = await fs.promises.readFile(inputs.absolutePathToFile, { "encoding": "utf-8" });
  const realmDriver = new RealmDriver;

  const agent = new GuestEngine.Agent({
    onDebugger() {
      // eslint-disable-next-line no-debugger
      debugger;
    },
    // ensureCanCompileStrings() {},
    // hasSourceTextAvailable() {},

    loadImportedModule(
      referrer: GuestEngine.SourceTextModuleRecord,
      specifier: string,
      hostDefined: object,
      finish: (res: ThrowOr<GuestEngine.SourceTextModuleRecord/* | GuestEngine.SyntheticModuleRecord*/>) => void
    )
    {
      const moduleOrThrow: ThrowOr<GuestEngine.SourceTextModuleRecord> = realmDriver.resolveModule(specifier, referrer);
      finish(moduleOrThrow);
    },

    // onNodeEvaluation() {},
    // features: [],
  });
  GuestEngine.setSurroundingAgent(agent);

  const realm = new GuestEngine.ManagedRealm(realmDriver.hostDefined);

  realm.scope(function () {
    if (inputs.defineBuiltIns) {
      GuestEngine.skipDebugger(inputs.defineBuiltIns(realm));
    }

    const specifier = pathToFileURL(inputs.absolutePathToFile).href;
    let module: PlainCompletion<GuestEngine.SourceTextModuleRecord> = realm.compileModule(contents, { specifier });
    if (module instanceof GuestEngine.NormalCompletion)
      module = module.Value;

    if (module instanceof GuestEngine.SourceTextModuleRecord) {
      realmDriver.registerMainModule(specifier, module);
      return realm.evaluateModule(module, specifier);
    }
  });

  //await realmDriver.moduleCompleted;
  return realm.scope(() => realmDriver.finalizeResults());
}

export class RealmDriver {
  #exceptionThrown = false;
  readonly #results = new RealmResults;

  readonly resolverCache = new Map<unknown, unknown>;
  readonly #specifierToModuleRecordMap = new Map<string, GuestEngine.SourceTextModuleRecord>;
  readonly #moduleRecordToSpecifierMap = new WeakMap<GuestEngine.SourceTextModuleRecord, string>;
  readonly trackedPromises = new Set<GuestEngine.PromiseObject>;

  readonly hostDefined = new RealmHostDefined(this);

  readonly resolveModulePromises = new Set<Promise<unknown>>;

  readonly #moduleCompletedDeferred = new Deferred<void>;
  readonly moduleCompleted: Promise<void> = this.#moduleCompletedDeferred.promise;

  #mainModule?: GuestEngine.SourceTextModuleRecord;
  loadRequestResult?: GuestEngine.PromiseObject;
  evalResult?: GuestEngine.PromiseObject;

  public registerMainModule(specifier: string, module: GuestEngine.SourceTextModuleRecord): void {
    this.#specifierToModuleRecordMap.set(specifier, module);
    this.#moduleRecordToSpecifierMap.set(module, specifier);
  }

  public resolveModule(
    targetSpecifier: string,
    referrer: GuestEngine.SourceTextModuleRecord,
  ): ThrowOr<GuestEngine.SourceTextModuleRecord>
  {
    return this.#resolveModule(targetSpecifier, referrer);
  }

  #resolveModule(
    targetSpecifier: string,
    referrer: GuestEngine.SourceTextModuleRecord,
  ): ThrowOr<GuestEngine.SourceTextModuleRecord>
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
    const contents = fs.readFileSync(absolutePathToFile, { "encoding": "utf-8" });

    let module: PlainCompletion<GuestEngine.SourceTextModuleRecord> = referrer.Realm.compileModule(
      contents, { specifier: resolvedSpecifier }
    );

    if (module instanceof GuestEngine.NormalCompletion)
      module = module.Value;

    if (module instanceof GuestEngine.SourceTextModuleRecord) {
      this.#specifierToModuleRecordMap.set(resolvedSpecifier, module);
      this.#moduleRecordToSpecifierMap.set(module, resolvedSpecifier);
    }

    return module;
  }

  flushPendingPromises(): void {
    GuestEngine.Assert(this.#mainModule !== undefined);
    GuestEngine.Assert(this.evalResult !== undefined);

    this.#mainModule.Evaluate();
  }

  finalizeResults(): RealmResults {
    if (this.trackedPromises.size) {
      this.#results.unhandledPromises.push(...this.trackedPromises);
      const unhandledRejects: readonly GuestEngine.PromiseObject[] = Array.from(this.trackedPromises);
      const unhandledErrors: readonly Error[] = unhandledRejects.map(value => new Error(GuestEngine.inspect(value)));

      this.#results.unhandledErrors.push(...unhandledErrors);
      this.#exceptionThrown = true;
    }

    this.#results.succeeded = !this.#exceptionThrown;
    return this.#results;
  }
}

export class RealmResults implements GuestRealmOutputs
{
  readonly unhandledPromises: GuestEngine.PromiseObject[] = [];
  readonly unhandledErrors: Error[] = [];
  succeeded = false;
}
