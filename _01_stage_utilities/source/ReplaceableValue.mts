export type ReplaceableValueType<Replaceable extends object, Context> = {
  source: Replaceable,
  context: Context
};

export default class ReplaceableValue<Replaceable extends object, Context>
{
  readonly #contextMap = new WeakMap<Replaceable, Context>;
  readonly #replacedMap = new WeakMap<Replaceable, Replaceable>;

  public get(
    source: Replaceable,
    generator: () => ReplaceableValueType<Replaceable, Context>
  ): ReplaceableValueType<Replaceable, Context>
  {
    source = this.#replacedMap.get(source) ?? source;

    if (this.#contextMap.has(source)) {
      return {
        source,
        context: this.#contextMap.get(source) as Context,
      };
    }

    const result = generator();
    this.#replacedMap.set(source, result.source);
    this.#contextMap.set(result.source, result.context);
    return result;
  }
}
