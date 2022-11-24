// Imported type
import type { NumberStringType } from "./NumberStringType.mjs";

// extends
export interface NumberStringFoo extends NumberStringType
{
  repeatFoo(n: number) : string;
}

export type IsTypedNST = {
  type: string;
};

// never type
type neverProperty = {
  illegal: never;
}

export type NumberStringAndIllegal = NumberStringType & neverProperty;

// Referenced type
export type HasTypeAttribute = IsTypedNST;

// Second type for an integrated class
export type Bar = {
  repeatBar(n: number): string;
}

// Renamed type
export type StringNumberType = NumberStringType;

// Referenced type, intersection
export type NumberStringAndType = NumberStringType & IsTypedNST;
export type NumberStringAndBar = NumberStringType & Bar;

// Referenced type, union
export type NumberStringOrBar = NumberStringType | Bar;

export type UnionArgument = {
  doSomething(x: number | string): void
};

// Conditional (and parameterized) type
type ObjectType<T> = T extends object ? T : never;
export type NumberStringConditional = ObjectType<NumberStringType>;

// Mapped type
export type NST_Keys = {
  [P in keyof NumberStringType]: P
}

// Built-in parameterized types
export type RepeatForwardType = Pick<NumberStringType, "repeatForward">;

export type NumberStringExcludesBar = Exclude<NumberStringOrBar, Bar>;

// symbol key
export const SymbolTypeKey = Symbol("type");

export type NumberStringAndSymbol = NumberStringType & {
  [SymbolTypeKey]: boolean;
}
