import {
  GuestEngine,
  ThrowOr
} from "../../host-to-guest/GuestEngine.js";

import {
  defineBuiltInFunction
} from "../defineBuiltInFunction.js";

import {
  convertHostPromiseToGuestPromise
} from "../../host-to-guest/GuestPromiseForHostPromise.js";

export function defineAsyncPlusOneFunction(
  realm: GuestEngine.ManagedRealm
): void
{
  defineBuiltInFunction(
    realm,
    "asyncPlusOne",
    function asyncPlusOne(
      guestThisArg: GuestEngine.Value,
      guestArguments: readonly GuestEngine.Value[],
      guestNewTarget: GuestEngine.Value
    ): ThrowOr<GuestEngine.PromiseObject>
    {
      void(guestThisArg);
      void(guestNewTarget);

      const [incomingNumber] = guestArguments;
      if (incomingNumber?.type !== "Number")
        return GuestEngine.Throw("TypeError", "Raw", `incomingNumber is not a number`);

      const guestPromise = convertHostPromiseToGuestPromise<number, undefined>(
        realm, Promise.resolve(incomingNumber.numberValue() + 1)
      );
      return guestPromise;
    }
  )
}