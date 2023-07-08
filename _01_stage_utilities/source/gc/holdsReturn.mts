import tryGarbageCollection from "./tryGarbageCollection.mjs";
import PromiseFinalizer, {
  type PromiseResolver
} from "./promiseFinalizer.mjs";

type MaybeHoldReturn = () => object;

/**
 * @param objectCount - the number of objects to store.
 * @param maybeHoldsReturn - the function we're testing for strong or weak references
 * @param finalizer - a promise resolver for garbage collection.
 * @returns a promise for garbage collection of several values.
 *
 * @internal
 */
function HoldsReturnPromise(
  objectCount: number,
  maybeHoldsReturn: MaybeHoldReturn,
  finalizer: FinalizationRegistry<PromiseResolver<void>>
): Promise<void>
{
  const useReturnPromiseArray: Promise<void>[] = [];

  for (let i = 0; i < objectCount; i++) {
    const key = maybeHoldsReturn();
    useReturnPromiseArray.push(new Promise(
      resolve => finalizer.register(key, resolve)
    ));
  }

  return Promise.all(useReturnPromiseArray).then(() => { return; });
}

/**
 * Report if a callback function holds references to any return values.
 * @param objectCount - the number of objects to store.
 * @param maxTries - the number of times to cycle.
 * @param maybeHoldsReturn - the function we're testing for strong or weak references
 * @returns true if `maybeHoldsReturn` held any values.
 */
export default async function holdsReturn(
  objectCount: number,
  maxTries: number,
  maybeHoldsReturn: MaybeHoldReturn
): Promise<boolean>
{
  // the finalizer is here, with the await below, to make sure we collect the finalizer only when this function exits.
  const finalizer = PromiseFinalizer();
  const holdingPromise = HoldsReturnPromise(objectCount, maybeHoldsReturn, finalizer);
  return await tryGarbageCollection(holdingPromise, maxTries);
}
