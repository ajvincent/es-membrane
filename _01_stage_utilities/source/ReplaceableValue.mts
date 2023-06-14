export type ReplaceableValueType<Replaceable extends object, UserContext> = {
  source: Replaceable,
  userContext: UserContext
};

export default class ReplaceableValue<Replaceable extends object, UserContext>
{
  readonly #contextMap = new WeakMap<Replaceable, UserContext>;
  readonly #replacedMap = new WeakMap<Replaceable, Replaceable>;

  readonly #generator: () => ReplaceableValueType<Replaceable, UserContext>;

  constructor(generator: () => ReplaceableValueType<Replaceable, UserContext>) {
    this.#generator = generator;
  }

  public get(
    source: Replaceable,
  ): ReplaceableValueType<Replaceable, UserContext>
  {
    source = this.#replacedMap.get(source) ?? source;

    if (this.#contextMap.has(source)) {
      return {
        source,
        userContext: this.#contextMap.get(source) as UserContext,
      };
    }

    const result = this.#generator();
    this.#replacedMap.set(source, result.source);
    this.#contextMap.set(result.source, result.userContext);
    return result;
  }
}
