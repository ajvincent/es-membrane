import {
  EnsureTypeOrThrow
} from "../../host-to-guest/EnsureTypeOrThrow.js";

import {
  GuestEngine,
} from "../../host-to-guest/GuestEngine.js";

import { convertArrayValueToArrayOfValues } from "../../host-to-guest/convertArrayValueToArrayOfValues.js";
import { defineBuiltInFunction } from "../defineBuiltInFunction.js";

type ReporterFunction = (
  guestValues: readonly GuestEngine.Value[]
) => GuestEngine.Evaluator<GuestEngine.Value>;

export function * defineReportFunction(
  realm: GuestEngine.ManagedRealm,
  reportFn: ReporterFunction
): GuestEngine.Evaluator<void>
{
  yield * defineBuiltInFunction(realm, "report", function * (
    guestThisArg: GuestEngine.Value,
    guestArguments: readonly GuestEngine.Value[],
    guestNewTarget: GuestEngine.Value,
  ): GuestEngine.Evaluator<GuestEngine.Value>
  {
    void (guestThisArg);
    void (guestNewTarget);

    const arrayOfValues: GuestEngine.Value[] = yield* EnsureTypeOrThrow<GuestEngine.Value[]>(
      convertArrayValueToArrayOfValues(guestArguments[0])
    );
    return yield* reportFn(arrayOfValues);
  });
}
