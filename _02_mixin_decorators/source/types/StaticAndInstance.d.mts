import type {
  TupleToUnion,
} from "type-fest";

/**
 * An utility type for declaring mixin class static and instance fields.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes}
 * @see {@link https://www.typescriptlang.org/docs/handbook/2/classes.html}
 */
export interface StaticAndInstance<UniqueSymbol extends symbol> {
  /** The static fields of the class. */
  readonly staticFields: object;

  /** The instance fields of the class. */
  readonly instanceFields: object;

  /** A key to keep every StaticAndInstance type unique. */
  readonly symbolKey: UniqueSymbol;
}

// #region StaticAndInstanceArray helpers

type HeadSymbol<
  Elements extends readonly symbol[]
> = Elements extends [
  infer Head,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ...infer Tail
] ? Head : never;

type TailSymbols<
  Elements extends readonly symbol[]
> = Elements extends [
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  infer Head,
  ...infer Tail
] ? Tail : never;
type TailSymbolsAsArray<
  Elements extends readonly symbol[]
> = Elements extends [
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  infer Head,
  ...infer Tail extends readonly symbol[]
] ? Tail : never;

type FirstSymbolAppearsTwice<Elements extends readonly symbol[]> =
  HeadSymbol<Elements> extends TupleToUnion<TailSymbols<Elements>> ? true : false;

type IsUniqueSymbolArray<Elements extends readonly symbol[]> =
  Elements extends [] ? true :
  FirstSymbolAppearsTwice<Elements> extends true ? false :
  IsUniqueSymbolArray<TailSymbolsAsArray<Elements>>;

type SymbolKeyArray<
  Elements extends readonly StaticAndInstance<symbol>[]
> = {
  [key in keyof Elements]: Elements[key]["symbolKey"];
}
// #endregion StaticAndInstanceArray helpers

export type StaticAndInstanceArray<
  Elements extends readonly StaticAndInstance<symbol>[]
> = IsUniqueSymbolArray<SymbolKeyArray<Elements>> extends true ? Elements : never;
