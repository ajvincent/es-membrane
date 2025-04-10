import {
  GuestEngine,
} from "../../host-to-guest/GuestEngine.js";

import {
  defineBuiltInFunction
} from "../defineBuiltInFunction.js";

import {
  convertHostPromiseToGuestPromise
} from "../../host-to-guest/GuestPromiseForHostPromise.js";

import {
  simpleEvaluator
} from "../../host-to-guest/simpleEvaluator.js";

export function * defineAsyncPlusOneFunction(
  realm: GuestEngine.ManagedRealm
): GuestEngine.Evaluator<void>
{
  yield * defineBuiltInFunction(
    realm,
    "asyncPlusOne",
    function * asyncPlusOne(
      guestThisArg: GuestEngine.Value,
      guestArguments: readonly GuestEngine.Value[],
      guestNewTarget: GuestEngine.Value
    ): GuestEngine.Evaluator<GuestEngine.PromiseObject>
    {
      void(guestThisArg);
      void(guestNewTarget);

      const [incomingNumber] = guestArguments;
      if (incomingNumber?.type !== "Number")
        throw GuestEngine.Throw("TypeError", "Raw", `incomingNumber is not a number`);

      const guestPromise: GuestEngine.PromiseObject = convertHostPromiseToGuestPromise<number, undefined>(
        realm, Promise.resolve(incomingNumber.numberValue() + 1)
      );
      return yield* simpleEvaluator(guestPromise);
    }
  )
}