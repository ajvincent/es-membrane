import {
  GuestEngine,
  ThrowCompletion,
} from "./GuestEngine.js";

export function EnsureValueOrThrow<T extends GuestEngine.Value>
(
  guestValue: GuestEngine.ExpressionCompletion<T>
): T
{
  if (guestValue instanceof GuestEngine.NormalCompletion)
    return guestValue.Value;
  if (guestValue instanceof ThrowCompletion)
    throw guestValue;
  return guestValue;
}
