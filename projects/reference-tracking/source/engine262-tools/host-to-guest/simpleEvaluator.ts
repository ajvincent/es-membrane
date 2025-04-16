import { GuestEngine } from "./GuestEngine.js";

// eslint-disable-next-line require-yield
export function * simpleEvaluator<T>(
  arg: T
): GuestEngine.Evaluator<T>
{
  return arg;
}
