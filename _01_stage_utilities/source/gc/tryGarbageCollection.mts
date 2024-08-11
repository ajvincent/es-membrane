// https://source.chromium.org/chromium/chromium/src/+/main:v8/src/extensions/gc-extension.cc;l=121;drc=41374c974d98f8cf67134f9ddb8d96d398154dfe?q=gc-extension.cc&ss=chromium%2Fchromium%2Fsrc
// credit to Seth Brenith, Microsoft
type GCOptionsArg = {
  "execution": "async",
};
declare function gc(obj: GCOptionsArg): Promise<void>;

import {
  setImmediate as setImmediatePromise
} from "timers/promises";

const GCOptions: GCOptionsArg = {
  "execution": "async",
};

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
    await gc(GCOptions);
    await Promise.race([
      setImmediatePromise(),
      holdingPromise
    ]);
  }

  return stillHoldsReference;
}
