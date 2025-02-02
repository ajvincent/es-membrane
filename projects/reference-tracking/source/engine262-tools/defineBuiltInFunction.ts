import * as GuestEngine from "@engine262/engine262";

export function defineBuiltInFunction(
  realm: GuestEngine.ManagedRealm,
  name: string,
  callback: (
    guestThisArg: GuestEngine.Value,
    guestArguments: readonly GuestEngine.Value[],
    guestNewTarget: GuestEngine.Value
  ) => GuestEngine.Value,
): void
{
  function builtInConverter(
    guestArguments: readonly GuestEngine.Value[],
    thisAndNewValue: { thisValue: GuestEngine.Value, newTarget: GuestEngine.Value }
  ): GuestEngine.Value
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

    return callback(thisAndNewValue.thisValue, guestArguments, thisAndNewValue.newTarget);
  }

  const builtInName = GuestEngine.Value(name);

  const builtInCallback = GuestEngine.CreateBuiltinFunction(builtInConverter, callback.length, builtInName, []);
  GuestEngine.CreateDataProperty(realm.GlobalObject, builtInName, builtInCallback);
}
