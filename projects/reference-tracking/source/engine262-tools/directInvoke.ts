import * as GuestEngine from '@engine262/engine262';

import {
  convertArrayValueToArrayOfValues
} from './convertArrayValueToArrayOfValues.js';

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
    guestValues: readonly GuestEngine.Value[],
  ) => GuestEngine.Value | GuestEngine.ThrowCompletion,
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

      defineBuiltInFunction(realm, "report", (
        guestThisArg, guestArguments, guestNewTarget
      ) => {
        void(guestThisArg);
        void(guestNewTarget);

        const arrayOfValues: GuestEngine.Value[] | GuestEngine.ThrowCompletion = convertArrayValueToArrayOfValues(guestArguments[0]);
        if (Array.isArray(arrayOfValues) === false)
          return arrayOfValues;

        return reportFn(arrayOfValues);
      });

      if (realmInputs.defineBuiltIns)
        realmInputs.defineBuiltIns(realm);
    }
  });
}
