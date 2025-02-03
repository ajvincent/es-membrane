import {
  GuestEngine
} from "./GuestEngine.js";

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

  return GuestEngine.CreateListFromArrayLike(arrayValue, undefined);
}
