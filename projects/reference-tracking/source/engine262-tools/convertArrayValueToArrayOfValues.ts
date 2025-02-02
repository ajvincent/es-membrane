import * as GuestEngine from "@engine262/engine262";

export function convertArrayValueToArrayOfValues(
  arrayValue: GuestEngine.Value
): GuestEngine.Value[] | GuestEngine.ThrowCompletion
{
  if (arrayValue.type !== "Object") {
    return GuestEngine.Throw('TypeError', "NotAnObject", arrayValue);
  }

  if (!GuestEngine.isArrayExoticObject(arrayValue)) {
    return GuestEngine.Throw('TypeError', "NotATypeObject", arrayValue, "Array");
  }

  const guestValues: GuestEngine.Value[] = [];
  const length: number = GuestEngine.LengthOfArrayLike(arrayValue);
  for (let index = 0; index < length; index++) {
    const key: GuestEngine.JSStringValue = GuestEngine.Value(index.toString());
    guestValues.push(GuestEngine.GetV(arrayValue, key));
  }

  return guestValues;
}
