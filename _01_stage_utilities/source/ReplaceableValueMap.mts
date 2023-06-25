// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Class<T extends object, Arguments extends unknown[] = any[]> = {
  prototype: T;
  new(...parameters: Arguments): T
};

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

  readonly #contextGenerator: Class<UserContext, []>;

  constructor(
    contextGenerator: Class<UserContext, []>
  )
  {
    this.#contextGenerator = contextGenerator;
  }

  public getDefault(
    source: Replaceable,
    replacer: (source: Replaceable) => Replaceable
  ): ReplaceableValueType<Replaceable, UserContext>
  {
    source = this.#replacedMap.get(source) ?? source;

    if (this.#contextMap.has(source)) {
      return {
        source,
        userContext: this.#contextMap.get(source) as UserContext,
      };
    }

    const userContext = new this.#contextGenerator();
    const newSource = replacer(source);
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
