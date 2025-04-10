export function skipGenerator<T>(iterator: Generator<unknown, T, unknown>): T {
  while (true) {
    const { done, value } = iterator.next();
    if (!done)
      continue;
    return value;
  }
}

export function wrapSpyInGenerator(
  spy: jasmine.Spy
): () => Generator<unknown, ReturnType<typeof spy>, unknown>
{
  // eslint-disable-next-line require-yield
  return function * (
    this: unknown,
    ...args: unknown[]
  ): Generator<unknown, ReturnType<typeof spy>, unknown>
  {
    spy.apply(this, args)
  }
}
