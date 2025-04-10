import {
  GuestEngine
} from "./GuestEngine.js";

export function * convertArrayValueToArrayOfValues (
  arrayValue: GuestEngine.Value
): GuestEngine.PlainEvaluator<GuestEngine.Value[]>
{
  if (arrayValue.type !== "Object") {
    throw GuestEngine.Throw('TypeError', "Raw", "Expected an Array object");
  }

  if (!GuestEngine.isArrayExoticObject(arrayValue)) {
    throw GuestEngine.Throw('TypeError', "Raw", "Expected an Array exotic object");
  }

  return yield* GuestEngine.CreateListFromArrayLike(arrayValue, undefined);
}
