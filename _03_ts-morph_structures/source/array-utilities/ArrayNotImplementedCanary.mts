/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/array-type */

/**
 * @remarks
 *
 * This file is specifically for catching new methods of arrays when they appear in the ECMAScript language.
 * When this file fails to compile, it means `ReadonlyArrayProxyHandler.#safeMembers` may need updating.
 */
const ArrayNotImplementedCanary: Omit<Array<unknown>, number> = {
  [Symbol.iterator]: function (): IterableIterator<unknown> {
    throw new Error("Function not implemented.");
  },
  get [Symbol.unscopables]():
    {
      [K in keyof any[]]?: boolean;
    }
  {
    throw new Error("not implemented");
  },
  length: 0,
  pop: function (): unknown {
    throw new Error("Function not implemented.");
  },
  push: function (...items: unknown[]): number {
    throw new Error("Function not implemented.");
  },
  concat: function (...items: ConcatArray<unknown>[]): unknown[] {
    throw new Error("Function not implemented.");
  },
  join: function (separator?: string | undefined): string {
    throw new Error("Function not implemented.");
  },
  reverse: function (): unknown[] {
    throw new Error("Function not implemented.");
  },
  shift: function (): unknown {
    throw new Error("Function not implemented.");
  },
  slice: function (start?: number | undefined, end?: number | undefined): unknown[] {
    throw new Error("Function not implemented.");
  },
  sort: function (compareFn?: ((a: unknown, b: unknown) => number) | undefined): unknown[] {
    throw new Error("Function not implemented.");
  },
  splice: function (start: number, deleteCount?: number | undefined): unknown[] {
    throw new Error("Function not implemented.");
  },
  unshift: function (...items: unknown[]): number {
    throw new Error("Function not implemented.");
  },
  indexOf: function (searchElement: unknown, fromIndex?: number | undefined): number {
    throw new Error("Function not implemented.");
  },
  lastIndexOf: function (searchElement: unknown, fromIndex?: number | undefined): number {
    throw new Error("Function not implemented.");
  },
  every: function <S>(predicate: (value: unknown, index: number, array: unknown[]) => value is S, thisArg?: any): boolean {
    throw new Error("Function not implemented.");
  },
  some: function (predicate: (value: unknown, index: number, array: unknown[]) => unknown, thisArg?: any): boolean {
    throw new Error("Function not implemented.");
  },
  forEach: function (callbackfn: (value: unknown, index: number, array: unknown[]) => void, thisArg?: any): void {
    throw new Error("Function not implemented.");
  },
  map: function <U>(callbackfn: (value: unknown, index: number, array: unknown[]) => U, thisArg?: any): U[] {
    throw new Error("Function not implemented.");
  },
  filter: function <S>(predicate: (value: unknown, index: number, array: unknown[]) => value is S, thisArg?: any): S[] {
    throw new Error("Function not implemented.");
  },
  reduce: function (callbackfn: (previousValue: unknown, currentValue: unknown, currentIndex: number, array: unknown[]) => unknown): unknown {
    throw new Error("Function not implemented.");
  },
  reduceRight: function (callbackfn: (previousValue: unknown, currentValue: unknown, currentIndex: number, array: unknown[]) => unknown): unknown {
    throw new Error("Function not implemented.");
  },
  find: function <S>(predicate: (value: unknown, index: number, obj: unknown[]) => value is S, thisArg?: any): S | undefined {
    throw new Error("Function not implemented.");
  },
  findIndex: function (predicate: (value: unknown, index: number, obj: unknown[]) => unknown, thisArg?: any): number {
    throw new Error("Function not implemented.");
  },
  fill: function (value: unknown, start?: number | undefined, end?: number | undefined): unknown[] {
    throw new Error("Function not implemented.");
  },
  copyWithin: function (target: number, start?: number | undefined, end?: number | undefined): unknown[] {
    throw new Error("Function not implemented.");
  },
  entries: function (): IterableIterator<[number, unknown]> {
    throw new Error("Function not implemented.");
  },
  keys: function (): IterableIterator<number> {
    throw new Error("Function not implemented.");
  },
  values: function (): IterableIterator<unknown> {
    throw new Error("Function not implemented.");
  },
  includes: function (searchElement: unknown, fromIndex?: number | undefined): boolean {
    throw new Error("Function not implemented.");
  },
  flatMap: function <U, This = undefined>(callback: (this: This, value: unknown, index: number, array: unknown[]) => U | readonly U[], thisArg?: This | undefined): U[] {
    throw new Error("Function not implemented.");
  },
  flat: function <A, D extends number = 1>(this: A, depth?: D | undefined): FlatArray<A, D>[] {
    throw new Error("Function not implemented.");
  },
  at: function (index: number): unknown {
    throw new Error("Function not implemented.");
  },
  findLast: function <S>(predicate: (value: unknown, index: number, array: unknown[]) => value is S, thisArg?: any): S | undefined {
    throw new Error("Function not implemented.");
  },
  findLastIndex: function (predicate: (value: unknown, index: number, array: unknown[]) => unknown, thisArg?: any): number {
    throw new Error("Function not implemented.");
  }
}
void(ArrayNotImplementedCanary);
