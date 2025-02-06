import {
  GuestEngine
} from "./GuestEngine.js";

export function convertArrayValueToArrayOfValues(
  arrayValue: GuestEngine.Value
): GuestEngine.Value[] | GuestEngine.ThrowCompletion
{
  if (arrayValue.type !== "Object") {
    return GuestEngine.Throw('TypeError', "Raw", "Expected an Array object");
  }

  if (!GuestEngine.isArrayExoticObject(arrayValue)) {
    return GuestEngine.Throw('TypeError', "Raw", "Expected an Array exotic object");
  }

  return GuestEngine.CreateListFromArrayLike(arrayValue, undefined);
}
