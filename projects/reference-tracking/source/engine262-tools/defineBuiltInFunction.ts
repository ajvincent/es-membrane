import * as GuestEngine from "@engine262/engine262";

export function defineBuiltInFunction(
  realm: GuestEngine.ManagedRealm,
  name: string,
  callback: (
    guestThisArg: GuestEngine.Value,
    guestArguments: readonly GuestEngine.Value[],
    guestNewTarget: GuestEngine.Value
  ) => GuestEngine.Value | GuestEngine.ThrowCompletion,
): void
{
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

  const builtInCallback = GuestEngine.CreateBuiltinFunction(builtInConverter, callback.length, builtInName, []);
  GuestEngine.CreateDataProperty(realm.GlobalObject, builtInName, builtInCallback);
}
