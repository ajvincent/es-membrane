export type PrefixedNumber<Prefix extends string> = `${Prefix}:${number}`;

export class StringCounter<BasePrefix extends string, OtherPrefix extends string>
{
  readonly #basePrefix: BasePrefix;
  #counter = 0;

  constructor(
    basePrefix: BasePrefix
  )
  {
    this.#basePrefix = basePrefix;
  }

  base(): PrefixedNumber<BasePrefix>
  {
    return `${this.#basePrefix}:${this.#counter++}`;
  }

  other(prefix: OtherPrefix): PrefixedNumber<OtherPrefix>
  {
    return `${prefix}:${this.#counter++}`;
  }
}
