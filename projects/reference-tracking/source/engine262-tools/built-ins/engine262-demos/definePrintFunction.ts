import {
  GuestEngine
} from "../../host-to-guest/GuestEngine.js";

import { defineBuiltInFunction } from "../defineBuiltInFunction.js";

export function definePrintFunction(realm: GuestEngine.ManagedRealm) {
  // eslint-disable-next-line require-yield
  defineBuiltInFunction(realm, "print", function * print(
    guestThisArg: GuestEngine.Value,
    guestArguments: readonly GuestEngine.Value[],
    guestNewTarget: GuestEngine.Value
  ): GuestEngine.Evaluator<GuestEngine.Value> {
    void (guestThisArg);
    void (guestNewTarget);
    console.log(guestArguments.map((tmp) => GuestEngine.inspect(tmp)));
    return GuestEngine.Value(undefined);
  });
}
