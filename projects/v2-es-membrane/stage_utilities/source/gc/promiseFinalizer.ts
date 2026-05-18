export type PromiseResolver<T> = (value: T | PromiseLike<T>) => unknown;

/** @internal  */
export default function PromiseFinalizer(): FinalizationRegistry<PromiseResolver<void>>
{
  return new FinalizationRegistry<PromiseResolver<void>>(
    resolver => resolver()
  );
}
