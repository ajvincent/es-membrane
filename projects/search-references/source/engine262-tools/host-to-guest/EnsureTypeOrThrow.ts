import {
  GuestEngine,
} from "./GuestEngine.js";

export function * EnsureTypeOrThrow<T>(
  guestEvaluator: GuestEngine.PlainEvaluator<T>
): GuestEngine.Evaluator<T>
{
  const guestType: GuestEngine.PlainCompletion<T> = yield* guestEvaluator;
  if (guestType instanceof GuestEngine.ThrowCompletion)
    throw guestType;
  if (guestType instanceof GuestEngine.NormalCompletion)
    return guestType.Value;
  return guestType;
}
