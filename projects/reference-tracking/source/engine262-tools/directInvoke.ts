import {
  ManagedRealm,
  Value,
  CreateDataProperty,
  inspect,
  CreateBuiltinFunction,
} from '@engine262/engine262';

import {
  runInRealm
} from "./runInRealm.js";

import {
  GuestRealmOutputs
} from './types/Virtualization262.js';

export async function directInvoke(
  absolutePathToFile: string,
  reportFn: (...args: string[]) => void,
): Promise<GuestRealmOutputs>
{
  return await runInRealm({
    absolutePathToFile,
    defineBuiltIns: (realm: ManagedRealm) => {
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
    }
  });
}
