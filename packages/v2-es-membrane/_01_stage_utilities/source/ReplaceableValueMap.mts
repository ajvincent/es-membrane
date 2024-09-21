export type ReplaceableValueType<
  Replaceable extends object,
  UserContext extends object
> = {
  source: Replaceable,
  userContext: UserContext
};

export default class ReplaceableValueMap<
  Replaceable extends object,
  UserContext extends object,
>
{
  readonly #contextMap = new WeakMap<Replaceable, UserContext>;
  readonly #replacedMap = new WeakMap<Replaceable, Replaceable>;

  readonly #contextGenerator: () => UserContext;

  constructor(
    contextGenerator: () => UserContext
  )
  {
    this.#contextGenerator = contextGenerator;
  }

  public getDefault(
    source: Replaceable,
    replacer: (source: Replaceable, userContext: UserContext) => Replaceable
  ): ReplaceableValueType<Replaceable, UserContext>
  {
    source = this.#replacedMap.get(source) ?? source;

    if (this.#contextMap.has(source)) {
      return {
        source,
        userContext: this.#contextMap.get(source)!,
      };
    }

    const userContext = this.#contextGenerator();
    const newSource = replacer(source, userContext);
    this.#replacedMap.set(source, newSource);
    this.#contextMap.set(newSource, userContext);
    return {
      source: newSource,
      userContext
    }
  }

  public get(
    source: Replaceable
  ): ReplaceableValueType<Replaceable, UserContext>
  {
    source = this.#replacedMap.get(source) ?? source;
    const userContext = this.#contextMap.get(source);
    if (!userContext)
      throw new Error("no replacement defined!");
    return { source, userContext };
  }

  public has(
    source: Replaceable
  ): boolean
  {
    source = this.#replacedMap.get(source) ?? source;
    return this.#contextMap.has(source);
  }
}
