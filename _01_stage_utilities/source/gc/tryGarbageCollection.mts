declare function gc(): void;

import {
  setImmediate as setImmediatePromise
} from "timers/promises";

/**
 *
 * @param holdingPromise - something which may hold a value through several gc() calls.
 * @param maxTries - the number of times to cycle.
 * @returns true if the JavaScript engine still holds any references.
 *
 * @internal
 */
export default async function tryGarbageCollection(
  holdingPromise: Promise<void>,
  maxTries: number
): Promise<boolean>
{
  let stillHoldsReference = true;
  holdingPromise = holdingPromise.then(() => {
    stillHoldsReference = false;
    return;
  });

  for (let gcCount = 0; stillHoldsReference && gcCount < maxTries; gcCount++) {
    gc();
    await Promise.race([
      setImmediatePromise(),
      holdingPromise
    ]);
  }

  return stillHoldsReference;
}
