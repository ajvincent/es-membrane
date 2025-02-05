import {
  GuestEngine,
  type ThrowOr,
} from "./GuestEngine.js";
import { convertArrayValueToArrayOfValues } from "./convertArrayValueToArrayOfValues.js";
import { defineBuiltInFunction } from "./defineBuiltInFunction.js";

export function defineReportFunction(
  realm: GuestEngine.ManagedRealm,
  reportFn: (guestValues: readonly GuestEngine.Value[]) => ThrowOr<GuestEngine.Value>
)
{
  defineBuiltInFunction(realm, "report", (
    guestThisArg, guestArguments, guestNewTarget
  ) => {
    void (guestThisArg);
    void (guestNewTarget);

    const arrayOfValues: ThrowOr<GuestEngine.Value[]> = convertArrayValueToArrayOfValues(guestArguments[0]);
    if (Array.isArray(arrayOfValues) === false)
      return arrayOfValues;

    return reportFn(arrayOfValues);
  });
}
