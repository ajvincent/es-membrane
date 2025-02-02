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
    /*
    const guestReportedValues = guestArguments[0];
    const guestValues: GuestEngine.Value[] = [];
    if (guestReportedValues.type !== "Object") {
      GuestEngine.Throw('TypeError', "NotAnObject", guestReportedValues);
      return GuestEngine.Value.undefined;
    }
    if (!GuestEngine.isArrayExoticObject(guestReportedValues)) {
      GuestEngine.Throw('TypeError', "NotATypeObject", guestReportedValues, "Array");
      return GuestEngine.Value.undefined;
    }

    const length: number = GuestEngine.LengthOfArrayLike(guestArguments);
    for (let index = 0; index < length; index++) {
      const key: GuestEngine.JSStringValue = GuestEngine.Value(index.toString());
      guestValues.push(GuestEngine.GetV(guestReportedValues, key));
    }
    */

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
