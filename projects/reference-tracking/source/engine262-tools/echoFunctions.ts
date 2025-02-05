import {
  GuestEngine
} from "./GuestEngine.js";

import {
  defineBuiltInFunction
} from "./built-ins/defineBuiltInFunction.js";

export function defineEchoFunctions(realm: GuestEngine.ManagedRealm): void {
  defineBuiltInFunction(realm, "echoNull", () => GuestEngine.Value.null);
  defineBuiltInFunction(
    realm,
    "echoNegate",
    function echoNegate(
      guestThisArg: GuestEngine.Value,
      guestArguments: readonly GuestEngine.Value[],
      guestNewTarget: GuestEngine.Value
    ): GuestEngine.BooleanValue
    {
      void(guestThisArg);
      void(guestNewTarget);
      const [guestInput] = guestArguments;
      if (guestInput?.type !== "Boolean")
        throw new Error("first argument to echoNegate must be a boolean");
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
        throw new Error("first argument to echoNegate must be a number");

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
        throw new Error("first argument to echoAppendUnderscore must be a string");

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
        throw new Error("first argument to echoMinusOne must be a bigint");

      return GuestEngine.Value(guestInput.bigintValue() - BigInt(1));
    }
  );
}
