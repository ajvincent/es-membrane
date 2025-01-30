import fs from "fs/promises";
import {
  Agent,
  setSurroundingAgent,
  ManagedRealm,
  Value,
  CreateDataProperty,
  inspect,
  CreateBuiltinFunction,
  type Completion,
} from '@engine262/engine262';

export async function directInvoke(absolutePathToFile: string, printFn: (...args: string[]) => void): Promise<void> {
  const contents = await fs.readFile(absolutePathToFile, { "encoding": "utf-8"});

  const agent = new Agent({
    // onDebugger() {},
    // ensureCanCompileStrings() {},
    // hasSourceTextAvailable() {},
    // loadImportedModule() {},
    // onNodeEvaluation() {},
    // features: [],
  });
  setSurroundingAgent(agent);

  const realm = new ManagedRealm({
    // promiseRejectionTracker() {},
    // getImportMetaProperties() {},
    // finalizeImportMeta() {},
    // randomSeed() {},
  });

  realm.scope(() => {
    // Add print function from host
    const print = CreateBuiltinFunction((args: Value[]) => {
      const argSequence: readonly string[] = args.map((tmp) => inspect(tmp));
      console.log(...argSequence);
      printFn(...argSequence);
      return Value.undefined;
    }, 1, Value('print'), []);
    CreateDataProperty(realm.GlobalObject, Value('print'), print);
  });

  const result: Completion = await realm.evaluateScript(contents);

  // eslint-disable-next-line no-debugger
  debugger;
  if (result.Type === "throw") {
    throw new Error("script failed to execute");
  }

  // a stream of numbers fills your console. it fills you with determination.
}
