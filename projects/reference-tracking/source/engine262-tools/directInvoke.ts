import {
  ManagedRealm,
  Value,
  inspect,
} from '@engine262/engine262';

import {
  defineBuiltInFunction,
} from "./defineBuiltInFunction.js";

import {
  runInRealm,
} from "./runInRealm.js";

import {
  GuestRealmInputs,
  GuestRealmOutputs
} from './types/Virtualization262.js';

export async function directInvoke(
  realmInputs: GuestRealmInputs,
  reportFn: (
    guestThisArg: Value,
    guestArguments: readonly Value[],
    guestNewTarget: Value,
  ) => Value,
): Promise<GuestRealmOutputs>
{
  return await runInRealm({
    absolutePathToFile: realmInputs.absolutePathToFile,
    defineBuiltIns: (realm: ManagedRealm) => {
      defineBuiltInFunction(realm, "print", function print(
        guestThisArg: Value,
        guestArguments: readonly Value[],
        guestNewTarget: Value,
      ): Value
      {
        void(guestThisArg);
        void(guestNewTarget);
        console.log(guestArguments.map((tmp) => inspect(tmp)));
        return Value(undefined);
      });

      defineBuiltInFunction(realm, "report", reportFn);
      if (realmInputs.defineBuiltIns)
        realmInputs.defineBuiltIns(realm);
    }
  });
}
