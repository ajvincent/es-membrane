import * as GuestEngine from "@engine262/engine262";

import {
  defineBuiltInFunction
} from "./defineBuiltInFunction.js";

export function defineEchoFunctions(realm: GuestEngine.ManagedRealm): void {
  defineBuiltInFunction(realm, "echoNull", () => GuestEngine.Value.null);
  defineBuiltInFunction(
    realm,
    "echoNegate",
    function echoNegate(
      guestThisArg: GuestEngine.Value,
      guestArguments: readonly GuestEngine.Value[],
      guestNewTarget: GuestEngine.Value
    ): GuestEngine.BooleanValue {
      void(guestThisArg);
      void(guestNewTarget);
      const [guestInput] = guestArguments;
      if (guestInput.type !== "Boolean")
        return GuestEngine.BooleanValue.false;
      return (guestInput.booleanValue() === true) ? GuestEngine.Value.false : GuestEngine.Value.true;
    }
  );

  defineBuiltInFunction(
    realm,
    "echoPlusOne",
    function echoPlusOne(
      guestThisArg: GuestEngine.Value,
      guestArguments: readonly GuestEngine.Value[],
      guestNewTarget: GuestEngine.Value
    ): GuestEngine.NumberValue
    {
      void(guestThisArg);
      void(guestNewTarget);
      const [guestInput] = guestArguments;
      if (guestInput?.type !== "Number")
        return GuestEngine.Value(NaN);

      return GuestEngine.Value(guestInput.numberValue() + 1);
    }
  );

  defineBuiltInFunction(
    realm,
    "echoAppendUnderscore",
    function echoAppendUnderscore(
      guestThisArg: GuestEngine.Value,
      guestArguments: readonly GuestEngine.Value[],
      guestNewTarget: GuestEngine.Value
    ): GuestEngine.JSStringValue
    {
      void(guestThisArg);
      void(guestNewTarget);
      const [guestInput] = guestArguments;
      if (guestInput?.type !== "String")
        return GuestEngine.Value("");

      return GuestEngine.Value(guestInput.stringValue() + "_");
    }
  );

  defineBuiltInFunction(
    realm,
    "echoMinusOne",
    function echoMinusOne(
      guestThisArg: GuestEngine.Value,
      guestArguments: readonly GuestEngine.Value[],
      guestNewTarget: GuestEngine.Value
    ): GuestEngine.BigIntValue
    {
      void(guestThisArg);
      void(guestNewTarget);
      const [guestInput] = guestArguments;
      if (guestInput?.type !== "BigInt")
        throw new Error('oops');

      return GuestEngine.Value(guestInput.bigintValue() - BigInt(1));
    }
  );
}
