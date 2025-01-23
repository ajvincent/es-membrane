import holdsReturn from "./holdsReturn.js";

/**
 * Report if a callback function holds references to any values.
 * @param objectCount - the number of objects to store.
 * @param maxTries - the number of times to cycle.
 * @param maybeHoldsArgument - the function we're testing for strong or weak references
 * @param runAfterMaybeHold - a callback to run after all iterations of the holding function have finished
 * @returns true if `maybeHoldsArgument` held any values.
 */
export default async function holdsArgument(
  objectCount: number,
  maxTries: number,
  maybeHoldsArgument: (key: object) => void,
  runAfterMaybeHold?: () => Promise<void>,
): Promise<boolean>
{
  function maybeHoldsReturn(): object {
    const key = {};
    maybeHoldsArgument(key);
    return key;
  }

  return holdsReturn(objectCount, maxTries, maybeHoldsReturn, runAfterMaybeHold);
}
