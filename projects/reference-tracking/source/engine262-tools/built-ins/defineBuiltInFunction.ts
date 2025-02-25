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
    thisAndNewValue: { thisValue: GuestEngine.Value, newTarget: GuestEngine.Value }
  ): GuestEngine.Value | GuestEngine.ThrowCompletion
  {
    try {
      return callback(thisAndNewValue.thisValue, guestArguments, thisAndNewValue.newTarget);
    }
    catch (ex: unknown) {
      return GuestEngine.Throw(
        "Error", "Raw", "HostDefinedError: " + String(ex)
      );
    }
  }

  const builtInName = GuestEngine.Value(name);

  const builtInCallback = GuestEngine.CreateBuiltinFunction(builtInConverter, argumentsLength, builtInName, []);
  GuestEngine.CreateDataProperty(realm.GlobalObject, builtInName, builtInCallback);
}
