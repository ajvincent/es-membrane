import fs from "node:fs/promises";

import {
  pathToFileURL,
} from "node:url";

import {
  Agent,
  setSurroundingAgent,
  ManagedRealm,
  Value,
  inspect,
  SourceTextModuleRecord,
  AbruptCompletion,
  ThrowCompletion,
  PromiseObjectValue,
  Throw,
} from '@engine262/engine262';

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

  const agent = new Agent({
    // onDebugger() {},
    // ensureCanCompileStrings() {},
    // hasSourceTextAvailable() {},
    // loadImportedModule() {},
    // onNodeEvaluation() {},
    // features: [],
  });
  setSurroundingAgent(agent);

  const realm = new ManagedRealm(realmDriver.hostDefined);

  realm.scope(() => {
    if (inputs.defineBuiltIns) {
      inputs.defineBuiltIns(realm);
    }

    realmDriver.runModule(inputs.absolutePathToFile, contents, realm);
  });

  return realmDriver.finalizeResults();
}

class RealmDriver {
  #exceptionThrown = false;
  readonly #results = new RealmResults;

  readonly resolverCache = new Map<unknown, unknown>;
  readonly trackedPromises = new Set<PromiseObjectValue>;

  readonly hostDefined = new RealmHostDefined(this);

  processAbruptCompletion(result: AbruptCompletion): void {
    //eslint-disable-next-line no-debugger
    debugger;
    const inspected = inspect(result as unknown as Value);
    void(inspected);

    if (result.Type === "throw")
      this.#exceptionThrown = true;
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

  runModule(
    absolutePathToFile: string,
    contents: string,
    realm: ManagedRealm
  ): void
  {
    const createSourceResult: ThrowCompletion | SourceTextModuleRecord = realm.createSourceTextModule(
      pathToFileURL(absolutePathToFile).href, contents
    );
  
    if (createSourceResult instanceof ThrowCompletion) {
      this.processAbruptCompletion(createSourceResult);
      return;
    }

    const module = createSourceResult;
    this.resolverCache.set(absolutePathToFile, createSourceResult);
    const loadRequestResult: PromiseObjectValue = module.LoadRequestedModules();
    if (loadRequestResult instanceof AbruptCompletion) {
      //@ts-expect-error ReturnType<LoadRequestedModule> says this shouldn't happen.
      hostDefined.processAbruptCompletion(loadRequestResult);
      return;
    }
  
    const linkResult = module.Link();
    if (linkResult instanceof ThrowCompletion) {
      this.processAbruptCompletion(linkResult);
      return;
    }
  
    const evalResult: PromiseObjectValue = module.Evaluate();
    if (evalResult.PromiseState === "rejected") {
      // @ts-expect-error messages aren't exposed from api.d.mts, and besides, there's no obvious message to use.
      this.processAbruptCompletion(Throw(evalResult.PromiseResult!));
      return;
    }
  }
}

class RealmHostDefined {
  readonly #driver: RealmDriver;

  constructor(outer: RealmDriver) {
    this.#driver = outer;
  }

  public promiseRejectionTracker(
    promise: PromiseObjectValue,
    operation: "reject" | "handle"
  ): void
  {
    switch (operation) {
      case 'reject':
        this.#driver.trackedPromises.add(promise);
        break;
      case 'handle':
        this.#driver.trackedPromises.delete(promise);
        break;
    }
  }
}

export class RealmResults implements GuestRealmOutputs
{
  readonly unhandledPromises: PromiseObjectValue[] = [];
  succeeded = false;
}
