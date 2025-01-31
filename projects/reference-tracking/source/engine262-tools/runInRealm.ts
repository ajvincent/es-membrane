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
  GuestRealmInputs
} from "./types/Virtualization262.js";

export async function runInRealm(
  inputs: GuestRealmInputs
): Promise<void>
{
  const contents = await fs.readFile(inputs.absolutePathToFile, { "encoding": "utf-8" });

  const agent = new Agent({
    // onDebugger() {},
    // ensureCanCompileStrings() {},
    // hasSourceTextAvailable() {},
    // loadImportedModule() {},
    // onNodeEvaluation() {},
    // features: [],
  });
  setSurroundingAgent(agent);

  const hostDefined = new RealmHostDefined;
  const realm = new ManagedRealm(hostDefined);

  realm.scope(() => {
    if (inputs.defineBuiltIns) {
      inputs.defineBuiltIns(realm);
    }

    runModule(inputs.absolutePathToFile, contents, hostDefined, realm);
  });

  if (hostDefined.trackedPromises.size) {
    const unhandledRejects: readonly PromiseObjectValue[] = Array.from(hostDefined.trackedPromises);
    const unhandledErrors: readonly Error[] = unhandledRejects.map(value => new Error(inspect(value)));
    throw new AggregateError(unhandledErrors);
  }
}

class RealmHostDefined {
  readonly resolverCache = new Map<unknown, unknown>;
  readonly trackedPromises = new Set<PromiseObjectValue>;

  public promiseRejectionTracker(
    promise: PromiseObjectValue,
    operation: "reject" | "handle"
  ): void
  {
    switch (operation) {
      case 'reject':
        this.trackedPromises.add(promise);
        break;
      case 'handle':
        this.trackedPromises.delete(promise);
        break;
      /* c8 ignore next */
      default:
        break;
    }
  }
}

function runModule(
  absolutePathToFile: string,
  contents: string,
  hostDefined: RealmHostDefined,
  realm: ManagedRealm
): void
{
  const createSourceResult: ThrowCompletion | SourceTextModuleRecord = realm.createSourceTextModule(
    pathToFileURL(absolutePathToFile).href, contents
  );

  if (createSourceResult instanceof ThrowCompletion) {
    processAbruptCompletion(createSourceResult);
    return;
  }

  const module = createSourceResult;
  hostDefined.resolverCache.set(absolutePathToFile, createSourceResult);
  const loadRequestResult: PromiseObjectValue = module.LoadRequestedModules();
  if (loadRequestResult instanceof AbruptCompletion) {
    //@ts-expect-error ReturnType<LoadRequestedModule> says this shouldn't happen.
    processAbruptCompletion(loadRequestResult);
    return;
  }

  const linkResult = module.Link();
  if (linkResult instanceof ThrowCompletion) {
    processAbruptCompletion(linkResult);
    return;
  }

  const evalResult: PromiseObjectValue = module.Evaluate();
  if (evalResult.PromiseState === "rejected") {
    // @ts-expect-error messages aren't exposed from api.d.mts, and besides, there's no obvious message to use.
    processAbruptCompletion(Throw(evalResult.PromiseResult!));
    return;
  }
}

function processAbruptCompletion(result: AbruptCompletion): void {
  //eslint-disable-next-line no-debugger
  debugger;
  const inspected = inspect(result as unknown as Value);
  void(inspected);
}
