/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * @remarks
 *
 * This file is specifically for catching new methods of arrays when they appear in the ECMAScript language.
 * When this file fails to compile, it means `ReadonlyArrayProxyHandler.#safeMembers` may need updating.
 */
class ArrayNotImplementedCanary implements Omit<Array<unknown>, number> {
  [Symbol.iterator](): ArrayIterator<unknown> {
    throw new Error("Function not implemented.");
  }
  get [Symbol.unscopables](): {
    [K in keyof any[]]?: boolean;
  } {
    throw new Error("not implemented");
  }
  get length(): number {
    throw new Error("Getter not implemented");
  }
  pop(): unknown {
    throw new Error("Function not implemented.");
  }
  push(...items: unknown[]): number {
    throw new Error("Function not implemented.");
  }
  concat(...items: ConcatArray<unknown>[]): unknown[] {
    throw new Error("Function not implemented.");
  }
  join(separator?: string | undefined): string {
    throw new Error("Function not implemented.");
  }
  reverse(): unknown[] {
    throw new Error("Function not implemented.");
  }
  shift(): unknown {
    throw new Error("Function not implemented.");
  }
  slice(start?: number | undefined, end?: number | undefined): unknown[] {
    throw new Error("Function not implemented.");
  }
  sort(
    compareFn?: ((a: unknown, b: unknown) => number) | undefined,
  ): unknown[] {
    throw new Error("Function not implemented.");
  }
  splice(start: number, deleteCount?: number | undefined): unknown[] {
    throw new Error("Function not implemented.");
  }
  unshift(...items: unknown[]): number {
    throw new Error("Function not implemented.");
  }
  indexOf(searchElement: unknown, fromIndex?: number | undefined): number {
    throw new Error("Function not implemented.");
  }
  lastIndexOf(searchElement: unknown, fromIndex?: number | undefined): number {
    throw new Error("Function not implemented.");
  }
  every<S>(
    predicate: (value: unknown, index: number, array: unknown[]) => value is S,
    thisArg?: any,
  ): this is S[] {
    throw new Error("Function not implemented.");
  }
  some(
    predicate: (value: unknown, index: number, array: unknown[]) => unknown,
    thisArg?: any,
  ): boolean {
    throw new Error("Function not implemented.");
  }
  forEach(
    callbackfn: (value: unknown, index: number, array: unknown[]) => void,
    thisArg?: any,
  ): void {
    throw new Error("Function not implemented.");
  }
  map<U>(
    callbackfn: (value: unknown, index: number, array: unknown[]) => U,
    thisArg?: any,
  ): U[] {
    throw new Error("Function not implemented.");
  }
  filter<S>(
    predicate: (value: unknown, index: number, array: unknown[]) => value is S,
    thisArg?: any,
  ): S[] {
    throw new Error("Function not implemented.");
  }
  reduce(
    callbackfn: (
      previousValue: unknown,
      currentValue: unknown,
      currentIndex: number,
      array: unknown[],
    ) => unknown,
  ): unknown {
    throw new Error("Function not implemented.");
  }
  reduceRight(
    callbackfn: (
      previousValue: unknown,
      currentValue: unknown,
      currentIndex: number,
      array: unknown[],
    ) => unknown,
  ): unknown {
    throw new Error("Function not implemented.");
  }
  find<S>(
    predicate: (value: unknown, index: number, obj: unknown[]) => value is S,
    thisArg?: any,
  ): S | undefined {
    throw new Error("Function not implemented.");
  }
  findIndex(
    predicate: (value: unknown, index: number, obj: unknown[]) => unknown,
    thisArg?: any,
  ): number {
    throw new Error("Function not implemented.");
  }
  fill(
    value: unknown,
    start?: number | undefined,
    end?: number | undefined,
  ): unknown[] {
    throw new Error("Function not implemented.");
  }
  copyWithin(
    target: number,
    start?: number | undefined,
    end?: number | undefined,
  ): unknown[] {
    throw new Error("Function not implemented.");
  }
  entries(): ArrayIterator<[number, unknown]> {
    throw new Error("Function not implemented.");
  }
  keys(): ArrayIterator<number> {
    throw new Error("Function not implemented.");
  }
  values(): ArrayIterator<unknown> {
    throw new Error("Function not implemented.");
  }
  includes(searchElement: unknown, fromIndex?: number | undefined): boolean {
    throw new Error("Function not implemented.");
  }
  flatMap<U, This = undefined>(
    callback: (
      this: This,
      value: unknown,
      index: number,
      array: unknown[],
    ) => U | readonly U[],
    thisArg?: This | undefined,
  ): U[] {
    throw new Error("Function not implemented.");
  }
  flat<A, D extends number = 1>(
    this: A,
    depth?: D | undefined,
  ): FlatArray<A, D>[] {
    throw new Error("Function not implemented.");
  }
  at(index: number): unknown {
    throw new Error("Function not implemented.");
  }
  findLast<S>(
    predicate: (value: unknown, index: number, array: unknown[]) => value is S,
    thisArg?: any,
  ): S | undefined {
    throw new Error("Function not implemented.");
  }
  findLastIndex(
    predicate: (value: unknown, index: number, array: unknown[]) => unknown,
    thisArg?: any,
  ): number {
    throw new Error("Function not implemented.");
  }
  toReversed(): unknown[] {
    throw new Error("Function not implemented.");
  }
  toSorted(
    compareFn?: ((a: unknown, b: unknown) => number) | undefined,
  ): unknown[] {
    throw new Error("Function not implemented.");
  }
  toSpliced(
    start: number,
    deleteCount: number,
    ...items: unknown[]
  ): unknown[] {
    throw new Error("Function not implemented.");
  }
  with(index: number, value: unknown): unknown[] {
    throw new Error("Function not implemented.");
  }
}

export default ArrayNotImplementedCanary;
