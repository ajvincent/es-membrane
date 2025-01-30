import fs from "node:fs/promises";

import {
  pathToFileURL,
} from "node:url";

import {
  Agent,
  setSurroundingAgent,
  ManagedRealm,
  Value,
  CreateDataProperty,
  inspect,
  CreateBuiltinFunction,
  SourceTextModuleRecord,
  AbruptCompletion,
  ThrowCompletion,
  PromiseObjectValue,
  Throw,
} from '@engine262/engine262';

export async function directInvoke(
  absolutePathToFile: string,
  reportFn: (...args: string[]) => void
): Promise<void>
{
  const contents = await fs.readFile(absolutePathToFile, { "encoding": "utf-8" });

  const agent = new Agent({
    // onDebugger() {},
    // ensureCanCompileStrings() {},
    // hasSourceTextAvailable() {},
    // loadImportedModule() {},
    // onNodeEvaluation() {},
    // features: [],
  });
  setSurroundingAgent(agent);
  const resolverCache = new Map;

  const trackedPromises = new Set;
  const realm = new ManagedRealm({
    // getImportMetaProperties() {},
    // finalizeImportMeta() {},
    // randomSeed() {},

    promiseRejectionTracker(promise: unknown, operation: unknown) {
      switch (operation) {
        case 'reject':
          trackedPromises.add(promise);
          break;
        case 'handle':
          trackedPromises.delete(promise);
          break;
        /* c8 ignore next */
        default:
          break;
      }
    },
    resolverCache,
  });

  await realm.scope(() => {
    // Add print function from host
    const print = CreateBuiltinFunction((args: Value[]) => {
      console.log(...args.map((tmp) => inspect(tmp)));
      return Value.undefined;
    }, 1, Value('print'), []);
    CreateDataProperty(realm.GlobalObject, Value('print'), print);

    const report = CreateBuiltinFunction((args: Value[]) => {
      const argSequence: readonly string[] = args.map((tmp) => inspect(tmp));
      reportFn(...argSequence);
      return Value.undefined;
    }, 1, Value('report'), []);
    CreateDataProperty(realm.GlobalObject, Value('report'), report);

    const createSourceResult: unknown = realm.createSourceTextModule(
      pathToFileURL(absolutePathToFile).href, contents
    );

    function processAbruptCompletion(result: AbruptCompletion): void {
      //eslint-disable-next-line no-debugger
      debugger;
      const inspected = inspect(result as unknown as Value);
      void(inspected);
    }

    if (createSourceResult instanceof ThrowCompletion) {
      processAbruptCompletion(createSourceResult);
      return;
    }

    const module = createSourceResult as SourceTextModuleRecord;
    resolverCache.set(absolutePathToFile, createSourceResult);
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
  });
}
