import {
  BooleanValue,
  type ManagedRealm,
  NumberValue,
  JSStringValue,
  Value,
  BigIntValue,
} from "@engine262/engine262";

import {
  defineBuiltInFunction
} from "./defineBuiltInFunction.js";

export function defineEchoFunctions(realm: ManagedRealm): void {
  defineBuiltInFunction(realm, "echoNull", () => Value.null);
  defineBuiltInFunction(
    realm,
    "echoNegate",
    function echoNegate(
      guestThisArg: Value,
      guestArguments: readonly Value[],
      guestNewTarget: Value
    ): BooleanValue {
      void(guestThisArg);
      void(guestNewTarget);
      const [guestInput] = guestArguments;
      if (guestInput.type !== "Boolean")
        return BooleanValue.false;
      return (guestInput.booleanValue() === true) ? Value(false) : Value(true);
    }
  );

  defineBuiltInFunction(
    realm,
    "echoPlusOne",
    function echoPlusOne(
      guestThisArg: Value,
      guestArguments: readonly Value[],
      guestNewTarget: Value
    ): NumberValue
    {
      void(guestThisArg);
      void(guestNewTarget);
      const [guestInput] = guestArguments;
      if (guestInput?.type !== "Number")
        return Value(NaN);

      return Value(guestInput.numberValue() + 1);
    }
  );

  defineBuiltInFunction(
    realm,
    "echoAppendUnderscore",
    function echoAppendUnderscore(
      guestThisArg: Value,
      guestArguments: readonly Value[],
      guestNewTarget: Value
    ): JSStringValue
    {
      void(guestThisArg);
      void(guestNewTarget);
      const [guestInput] = guestArguments;
      if (guestInput?.type !== "String")
        return Value("");

      return Value(guestInput.stringValue() + "_");
    }
  );

  defineBuiltInFunction(
    realm,
    "echoMinusOne",
    function echoMinusOne(
      guestThisArg: Value,
      guestArguments: readonly Value[],
      guestNewTarget: Value
    ): BigIntValue
    {
      void(guestThisArg);
      void(guestNewTarget);
      const [guestInput] = guestArguments;
      if (guestInput?.type !== "BigInt")
        throw new Error('oops');

      return Value(guestInput.bigintValue() - BigInt(1));
    }
  );
}
