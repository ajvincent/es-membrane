export class StringCounter<BasePrefix extends string, OtherPrefix extends string>
implements Iterator<`${BasePrefix | OtherPrefix}:${number}`, never, OtherPrefix>
{
  readonly #basePrefix: BasePrefix;
  #counter = 0;

  constructor(
    basePrefix: BasePrefix
  )
  {
    this.#basePrefix = basePrefix;
  }

  next(
    ...[otherPrefix]: [] | [OtherPrefix]
  ): IteratorYieldResult<`${BasePrefix}:${number}` | `${OtherPrefix}:${number}`>
  {
    const nextCount = this.#counter++;
    const prefix = typeof otherPrefix === "string" ? otherPrefix : this.#basePrefix;
    return {
      value: `${prefix}:${nextCount}`
    };
  }
}
