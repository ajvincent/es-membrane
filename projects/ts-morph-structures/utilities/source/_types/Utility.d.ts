/* Just some utilities I may use some day. */

import type {Class} from "type-fest";

// #region booleans
export type And<Left extends boolean, Right extends boolean> = Left extends true ? Right extends true ? true : false : false;
export type Or<Left extends boolean, Right extends boolean> = Left extends false ? Right extends false ? false : true : true;
export type Not<T extends boolean> = T extends false ? true : false;

export type All<T extends boolean[]> = T extends true[] ? true : false;
export type None<T extends boolean[]> = T extends false[] ? true : false;
export type AllOrNone<T extends boolean[]> = T extends (true[] | false[]) ? true : false;
export type Any<T extends boolean[]> = T extends false[] ? false : true;
// #endregion booleans

export type DoesExtend<Left, Right> = Left extends Right ? true : false;
export type LeftExtendsRight<Left, Right> = Left extends Right ? Left : never;
export type RightExtendsLeft<Left, Right> = Right extends Left ? Right : never;

// #region arrays
export type ShiftArrayElement<Elements extends readonly T[], T = unknown> =
  Elements extends [infer Element, ...infer Tail] ?
  { element: Element, tail: Tail } :
  never;

export type IsEmptyArray<Elements extends readonly unknown[]> =
  [] extends Elements ? true : false;

export type HasHead<Elements extends readonly unknown[]> =
  [] extends Elements ? false : true;

export type HasTail<Elements extends readonly unknown[]> =
  [] extends Elements ? false :
  Elements extends [unknown] ? false :
  true;

export type Head<Elements extends readonly T[], T = unknown> =
  HasHead<Elements> extends true ? ShiftArrayElement<Elements, T>["element"] : never;

export type Tail<Elements extends readonly T[], T = unknown> =
  HasTail<Elements> extends true ? ShiftArrayElement<Elements, T>["tail"] : never;

export type IndexUnion<T extends readonly unknown[]> = Exclude<keyof T, keyof unknown[]>;

export type PushableArray<T> = readonly T[] & Pick<T[], "push">;
export type UnshiftableArray<T> = readonly T[] & Pick<T[], "unshift">;

// #endregion arrays

export type CtorParamsAndArgs<
  X extends Class<object>
> = { args: ConstructorParameters<X>, creates: InstanceType<X> };
