import {
  GuestEngine
} from "./GuestEngine.js";

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
): Promise<GuestRealmOutputs>
{
  return await runInRealm({
    absolutePathToFile: realmInputs.absolutePathToFile,
    defineBuiltIns: (realm: GuestEngine.ManagedRealm) => {
      defineBuiltInFunction(realm, "print", function print(
        guestThisArg: GuestEngine.Value,
        guestArguments: readonly GuestEngine.Value[],
        guestNewTarget: GuestEngine.Value,
      ): GuestEngine.Value
      {
        void(guestThisArg);
        void(guestNewTarget);
        console.log(guestArguments.map((tmp) => GuestEngine.inspect(tmp)));
        return GuestEngine.Value(undefined);
      });

      if (realmInputs.defineBuiltIns)
        realmInputs.defineBuiltIns(realm);
    }
  });
}
