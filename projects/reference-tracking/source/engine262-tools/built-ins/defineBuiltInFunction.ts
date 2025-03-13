import {
  GuestEngine
} from "../host-to-guest/GuestEngine.js";

export function defineBuiltInFunction(
  realm: GuestEngine.ManagedRealm,
  name: string,
  /* argumentsLength: number */
  callback: (
    guestThisArg: GuestEngine.Value,
    guestArguments: readonly GuestEngine.Value[],
    guestNewTarget: GuestEngine.Value
  ) => GuestEngine.Value | GuestEngine.ThrowCompletion,
): void
{
  const argumentsLength = 1;
  function builtInConverter(
    guestArguments: readonly GuestEngine.Value[],
    thisAndNewValue: { thisValue: GuestEngine.Value, NewTarget: GuestEngine.Value }
  ): GuestEngine.Value | GuestEngine.ThrowCompletion
  {
    try {
      return callback(thisAndNewValue.thisValue, guestArguments, thisAndNewValue.NewTarget);
    }
    catch (ex: unknown) {
      if (ex instanceof GuestEngine.ThrowCompletion)
        return ex;
      return GuestEngine.Throw(
        "Error", "Raw", "HostDefinedError: " + String(ex)
      );
    }
  }

  const builtInName = GuestEngine.Value(name);

  const builtInCallback = GuestEngine.CreateBuiltinFunction(builtInConverter, argumentsLength, builtInName, []);
  GuestEngine.CreateDataProperty(realm.GlobalObject, builtInName, builtInCallback);
}
