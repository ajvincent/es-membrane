import {
  BooleanValue,
  CreateBuiltinFunction,
  CreateDataProperty,
  type ManagedRealm,
  NumberValue,
  JSStringValue,
  Value,
  BigIntValue,
} from "@engine262/engine262"

export function defineEchoFunctions(realm: ManagedRealm): void {
  {
    const echoNull = CreateBuiltinFunction(() => Value(null), 0, Value("echoNull"), []);
    CreateDataProperty(realm.GlobalObject, Value("echoNull"), echoNull);
  }

  {
    const echoNegate = CreateBuiltinFunction((guestInput: BooleanValue): BooleanValue => {
      return (guestInput.booleanValue() === true) ? Value(false) : Value(true);
    }, 1, Value("echoNegate"), []);
    CreateDataProperty(realm.GlobalObject, Value("echoNegate"), echoNegate);
  }

  {
    const echoPlusOne = CreateBuiltinFunction((guestInput: NumberValue): NumberValue => {
      const input: number = guestInput.numberValue();
      return Value(input + 1);
    }, 1, Value("echoPlusOne"), []);
    CreateDataProperty(realm.GlobalObject, Value("echoPlusOne"), echoPlusOne);
  }

  {
    const echoAppendUnderscore = CreateBuiltinFunction((guestInput: JSStringValue): JSStringValue => {
      const input: string = guestInput.stringValue();
      return Value(input + "_");
    }, 1, Value("echoAppendUnderscore"), []);
    CreateDataProperty(realm.GlobalObject, Value("echoAppendUnderscore"), echoAppendUnderscore);
  }

  {
    const echoMinusOne = CreateBuiltinFunction((guestInput: BigIntValue): BigIntValue => {
      const input: bigint = guestInput.bigintValue();
      return Value(input - BigInt(1));
    }, 1, Value("echoMinusOne"), []);
    CreateDataProperty(realm.GlobalObject, Value("echoMinusOne"), echoMinusOne);
  }
}
