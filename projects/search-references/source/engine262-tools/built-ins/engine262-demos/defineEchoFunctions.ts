import { simpleEvaluator } from "../../host-to-guest/simpleEvaluator.js";
import {
  GuestEngine
} from "../../host-to-guest/GuestEngine.js";

import {
  defineBuiltInFunction
} from "../defineBuiltInFunction.js";

export function * defineEchoFunctions(realm: GuestEngine.ManagedRealm): GuestEngine.Evaluator<void> {
  yield* defineBuiltInFunction(realm, "echoNull", function * () {
    return yield* simpleEvaluator(GuestEngine.Value.null);
  });

  yield* defineBuiltInFunction(
    realm,
    "echoNegate",
    function * echoNegate(
      guestThisArg: GuestEngine.Value,
      guestArguments: readonly GuestEngine.Value[],
      guestNewTarget: GuestEngine.Value
    ): GuestEngine.Evaluator<GuestEngine.BooleanValue>
    {
      void(guestThisArg);
      void(guestNewTarget);
      const [guestInput] = guestArguments;
      if (guestInput?.type !== "Boolean")
        throw new Error("first argument to echoNegate must be a boolean");

      const negate = guestInput.booleanValue() === true ? GuestEngine.Value.false : GuestEngine.Value.true;
      return yield* simpleEvaluator(negate);
    }
  );

  yield* defineBuiltInFunction(
    realm,
    "echoPlusOne",
    function * echoPlusOne(
      guestThisArg: GuestEngine.Value,
      guestArguments: readonly GuestEngine.Value[],
      guestNewTarget: GuestEngine.Value
    ): GuestEngine.Evaluator<GuestEngine.NumberValue>
    {
      void(guestThisArg);
      void(guestNewTarget);
      const [guestInput] = guestArguments;
      if (guestInput?.type !== "Number")
        throw new Error("first argument to echoNegate must be a number");

      return yield* simpleEvaluator(GuestEngine.Value(guestInput.numberValue() + 1));
    }
  );

  yield* defineBuiltInFunction(
    realm,
    "echoAppendUnderscore",
    function * echoAppendUnderscore(
      guestThisArg: GuestEngine.Value,
      guestArguments: readonly GuestEngine.Value[],
      guestNewTarget: GuestEngine.Value
    ): GuestEngine.Evaluator<GuestEngine.JSStringValue>
    {
      void(guestThisArg);
      void(guestNewTarget);
      const [guestInput] = guestArguments;
      if (guestInput?.type !== "String")
        throw new Error("first argument to echoAppendUnderscore must be a string");

      return yield* simpleEvaluator(
        GuestEngine.Value(guestInput.stringValue() + "_")
      );
    }
  );

  yield* defineBuiltInFunction(
    realm,
    "echoMinusOne",
    function * echoMinusOne(
      guestThisArg: GuestEngine.Value,
      guestArguments: readonly GuestEngine.Value[],
      guestNewTarget: GuestEngine.Value
    ): GuestEngine.Evaluator<GuestEngine.BigIntValue>
    {
      void(guestThisArg);
      void(guestNewTarget);
      const [guestInput] = guestArguments;
      if (guestInput?.type !== "BigInt")
        throw new Error("first argument to echoMinusOne must be a bigint");

      return yield* simpleEvaluator(
        GuestEngine.Value(guestInput.bigintValue() - BigInt(1))
      );
    }
  );
}
