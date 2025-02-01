import {
  CreateBuiltinFunction,
  CreateDataProperty,
  GetV,
  JSStringValue,
  LengthOfArrayLike,
  ManagedRealm,
  Throw,
  UndefinedValue,
  Value,
  inspect,
  isArrayExoticObject,
} from '@engine262/engine262';

import {
  runInRealm,
} from "./runInRealm.js";

import {
  GuestRealmInputs,
  GuestRealmOutputs
} from './types/Virtualization262.js';

export async function directInvoke(
  realmInputs: GuestRealmInputs,
  reportFn: (guestValues: Value[]) => void,
): Promise<GuestRealmOutputs>
{
  return await runInRealm({
    absolutePathToFile: realmInputs.absolutePathToFile,
    defineBuiltIns: (realm: ManagedRealm) => {
      // Add print function from host
      const print = CreateBuiltinFunction((args: Value[]): UndefinedValue => {
        console.log(...args.map((tmp) => inspect(tmp)));
        return Value(undefined);
      }, 1, Value('print'), []);
      CreateDataProperty(realm.GlobalObject, Value('print'), print);

      const report = CreateBuiltinFunction(
        (guestArguments: Value[], thisAndNewValue: { thisValue: Value, newTarget: Value} ): UndefinedValue | void => {
          void(thisAndNewValue);

          const guestReportedValues = guestArguments[0];
          const guestValues: Value[] = [];
          if (guestReportedValues.type !== "Object") {
            Throw('TypeError', "NotAnObject", guestReportedValues);
            return;
          }
          if (!isArrayExoticObject(guestReportedValues)) {
            Throw('TypeError', "NotATypeObject", guestReportedValues, "Array");
            return;
          }

          const length: number = LengthOfArrayLike(guestReportedValues);
          for (let index = 0; index < length; index++) {
            const key: JSStringValue = Value(index.toString());
            guestValues.push(GetV(guestReportedValues, key));
          }

          reportFn(guestValues);
          return Value(undefined);
        }, 1, Value('report'), []);
      CreateDataProperty(realm.GlobalObject, Value('report'), report);

      if (realmInputs.defineBuiltIns)
        realmInputs.defineBuiltIns(realm);
    }
  });
}
