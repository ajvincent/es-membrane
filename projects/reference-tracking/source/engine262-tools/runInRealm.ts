import fs from "node:fs/promises";

import {
  pathToFileURL,
} from "node:url";

import {
  Deferred
} from "../utilities/PromiseTypes.js";

import {
  GuestEngine
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
    // loadImportedModule() {},
    // onNodeEvaluation() {},
    // features: [],
  });
  GuestEngine.setSurroundingAgent(agent);

  const realm = new GuestEngine.ManagedRealm(realmDriver.hostDefined);

  realm.scope(() => {
    if (inputs.defineBuiltIns) {
      inputs.defineBuiltIns(realm);
    }

    realmDriver.runModule(inputs.absolutePathToFile, contents, realm);
  });

  const evalResult: GuestEngine.PromiseObjectValue | undefined = realmDriver.evalResult;
  GuestEngine.Assert(evalResult !== undefined);

  do {
    await Promise.resolve(true);
    realm.scope(() => realmDriver.flushPendingPromises());
  } while (realmDriver.hostDefined.pendingHostPromises.size > 0);

  await realmDriver.moduleCompleted;
  return realmDriver.finalizeResults();
}

export class RealmDriver {
  #exceptionThrown = false;
  readonly #results = new RealmResults;

  readonly resolverCache = new Map<unknown, unknown>;
  readonly trackedPromises = new Set<GuestEngine.PromiseObjectValue>;

  readonly hostDefined = new RealmHostDefined(this);

  readonly #moduleCompletedDeferred = new Deferred<void>;
  readonly moduleCompleted: Promise<void> = this.#moduleCompletedDeferred.promise;

  #module?: GuestEngine.SourceTextModuleRecord;
  evalResult?: GuestEngine.PromiseObjectValue;

  runModule(
    absolutePathToFile: string,
    contents: string,
    realm: GuestEngine.ManagedRealm
  ): void
  {
    const createSourceResult: GuestEngine.ThrowCompletion | GuestEngine.SourceTextModuleRecord = realm.createSourceTextModule(
      pathToFileURL(absolutePathToFile).href, contents
    );

    if (createSourceResult instanceof GuestEngine.ThrowCompletion) {
      this.#processAbruptCompletion(createSourceResult);
      return;
    }

    this.#module = createSourceResult;
    this.resolverCache.set(absolutePathToFile, createSourceResult);

    const loadRequestResult: GuestEngine.PromiseObjectValue = this.#module.LoadRequestedModules();
    if (loadRequestResult instanceof GuestEngine.AbruptCompletion) {
      //@ts-expect-error ReturnType<LoadRequestedModule> says this shouldn't happen.
      this.#processAbruptCompletion(loadRequestResult);
      return;
    }
  
    const linkResult = this.#module.Link();
    if (linkResult instanceof GuestEngine.ThrowCompletion) {
      this.#processAbruptCompletion(linkResult);
      return;
    }

    this.evalResult = this.#module.Evaluate();

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
    GuestEngine.Assert(this.#module !== undefined);
    GuestEngine.Assert(this.evalResult !== undefined);

    this.#module.Evaluate();
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
