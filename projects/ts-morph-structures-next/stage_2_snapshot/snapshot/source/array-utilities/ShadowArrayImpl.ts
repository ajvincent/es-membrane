import type { InnerTypeElement } from "./_types/InnerTypeElements.js";

import {
  BUILD_ARRAY_WRAPPER,
  CONVERT_OUTER_TO_INNER,
  GET_OUTER_TYPE,
} from "./symbols.js";

import { ArrayPrototypeProxyHandler } from "./ArrayPrototypeProxyHandler.js";

import type { WritableArrayLike } from "./_types/WritableArrayLike.js";

import { ArrayElementsProxyHandler } from "./ArrayElementsProxyHandler.js";

/**
 * This is a helper for implementing methods of an array, so the proxy can report the correct results.
 *
 * Subclass methods you must implement:
 *
 * - static createProxy (returns new ShadowArrayImpl(innerElements).proxy)
 * - [BUILD_ARRAY_WRAPPER]
 * - [CONVERT_OUTER_TO_INNER]
 *
 * Your constructor should be protected, not public.
 */
export abstract class ShadowArrayImpl<
  OuterType,
  InnerType extends InnerTypeElement<OuterType>,
> implements Omit<OuterType[], number | "length"> {
  static readonly #arrayElementsHandler = new ArrayElementsProxyHandler();

  /**
   * @param innerElements {InnerTypeElement<OuterType>[]} the elements implementing the native type
   *
   * @returns {OuterType[]} the proxy defining the wrapped type array.
   */
  public static createProxy(
    innerElements: InnerTypeElement<unknown>[],
  ): unknown[] {
    // return new ShadowArrayImpl(innerElements).proxy;

    void innerElements;
    throw new Error("override this method");
  }

  /**
   * Utility to get a range of indexes for a given length.
   *
   * @internal
   */
  public static indexRange(length: number): number[] {
    const indexes: number[] = [];
    for (let i = 0; i < length; i++) {
      indexes.push(i);
    }
    return indexes;
  }

  /** Our proxy to implement the array. */
  readonly proxy: OuterType[];

  /** The _actual_ values we're reflecting.  This is a live pointer to the array, not a slice. */
  readonly #innerElements: InnerType[];

  /** Convenience function to avoid binding over and over again. */
  readonly #convertOuterTypeToInner = (outerType: OuterType): InnerType =>
    this[CONVERT_OUTER_TO_INNER](outerType);

  /** The shadow target. */
  readonly #shadow: WritableArrayLike<OuterType>;

  protected constructor(innerElements: InnerType[]) {
    /* You should have come here via ShadowArrayImpl::createProxy, which you should have overridden. */

    this.#innerElements = innerElements;
    this.#shadow = {
      length: 0,
    };
    Reflect.defineProperty(this.#shadow, "length", {
      configurable: false,
      enumerable: false,
    });
    Reflect.setPrototypeOf(this.#shadow, ArrayPrototypeProxyHandler.proto);

    this.proxy = new Proxy(
      this.#shadow as OuterType[],
      ShadowArrayImpl.#arrayElementsHandler,
    ) as OuterType[];

    ShadowArrayImpl.#arrayElementsHandler.assignShadowToArrayImpl(
      this.#shadow,
      this as ShadowArrayImpl<unknown, InnerTypeElement<unknown>>,
    );
    ArrayPrototypeProxyHandler.assignProxyToArrayImpl(this.proxy, this);
  }

  /** abstract to preserve subclass types */
  protected abstract [BUILD_ARRAY_WRAPPER](
    innerElements: InnerType[],
  ): ShadowArrayImpl<OuterType, InnerType>;

  /** attempt no caching: InnerType provides the OuterType. */
  protected abstract [CONVERT_OUTER_TO_INNER](outerType: OuterType): InnerType;

  /** proxy access to get length() */
  public getLength(): number {
    // proxy invariant technically only applies for NWNC descriptors, but in our implementation we're not likely to care
    return this.#innerElements.length;
  }

  /** proxy access to set length() */
  public setLength(newLength: number): void {
    this.#innerElements.length = newLength;
  }

  /** proxy prototype helper to set [index] */
  public replaceAt(index: number, value: OuterType): void {
    this.#innerElements[index] = this.#convertOuterTypeToInner(value);
  }

  // OuterType[]
  at(index: number): OuterType | undefined {
    const innerElement = this.#innerElements.at(index);

    // proxy invariant technically only applies for NWNC descriptors, but in our implementation we're not likely to care
    return innerElement?.[GET_OUTER_TYPE]();
  }

  // OuterType[]
  [Symbol.iterator](): ArrayIterator<OuterType> {
    throw new Error("not yet implemented");
  }

  // OuterType[]
  get [Symbol.unscopables](): {
    [K in keyof unknown[]]?: boolean;
  } {
    throw new Error("not yet implemented");
  }

  // OuterType[]
  pop(): OuterType | undefined {
    throw new Error("not yet implemented");
  }

  // OuterType[]
  push(...items: OuterType[]): number {
    void items;
    throw new Error("not yet implemented");
  }

  // OuterType[]
  concat(...items: unknown[]): OuterType[] {
    void items;
    throw new Error("not yet implemented");
  }

  // OuterType[]
  join(separator?: string): string {
    void separator;
    throw new Error("not yet implemented");
  }

  // OuterType[]
  reverse(): OuterType[] {
    throw new Error("not yet implemented");
  }

  // OuterType[]
  shift(): OuterType | undefined {
    throw new Error("not yet implemented");
  }

  // OuterType[]
  slice(start?: number, end?: number): OuterType[] {
    void start;
    void end;
    throw new Error("not yet implemented");
  }

  // OuterType[]
  sort(
    compareFn?: ((a: OuterType, b: OuterType) => number) | undefined,
  ): OuterType[] {
    void compareFn;
    throw new Error("not yet implemented");
  }

  // OuterType[]
  splice(
    start: unknown,
    deleteCount?: unknown,
    ...rest: unknown[]
  ): OuterType[] {
    void start;
    void deleteCount;
    void rest;
    throw new Error("not yet implemented");
  }

  // OuterType[]
  unshift(...items: OuterType[]): number {
    void items;
    throw new Error("not yet implemented");
  }

  // OuterType[]
  indexOf(searchElement: OuterType, fromIndex?: number): number {
    void searchElement;
    void fromIndex;
    throw new Error("not yet implemented");
  }

  // OuterType[]
  lastIndexOf(searchElement: OuterType, fromIndex?: number): number {
    void searchElement;
    void fromIndex;
    throw new Error("not yet implemented");
  }

  // OuterType[]
  every<S extends OuterType>(
    predicate: unknown,
    thisArg?: unknown,
  ): this is S[] {
    void predicate;
    void thisArg;
    throw new Error("not yet implemented");
  }

  // OuterType[]
  some(
    predicate: (value: OuterType, index: number, array: OuterType[]) => unknown,
    thisArg?: unknown,
  ): boolean {
    void predicate;
    void thisArg;
    throw new Error("not yet implemented");
  }

  // OuterType[]
  forEach(
    callbackfn: (value: OuterType, index: number, array: OuterType[]) => void,
    thisArg?: unknown,
  ): void {
    void callbackfn;
    void thisArg;
    throw new Error("not yet implemented");
  }

  // OuterType[]
  map<U>(
    callbackfn: (value: OuterType, index: number, array: OuterType[]) => U,
    thisArg?: unknown,
  ): U[] {
    void callbackfn;
    void thisArg;
    throw new Error("not yet implemented");
  }

  // OuterType[]
  filter<S extends OuterType>(predicate: unknown, thisArg?: unknown): S[] {
    void predicate;
    void thisArg;
    throw new Error("not yet implemented");
  }

  // OuterType[]
  reduce(callbackfn: unknown, initialValue?: unknown): OuterType {
    void callbackfn;
    void initialValue;
    throw new Error("not yet implemented");
  }

  // OuterType[]
  reduceRight(callbackfn: unknown, initialValue?: unknown): OuterType {
    void callbackfn;
    void initialValue;
    throw new Error("not yet implemented");
  }

  // OuterType[]
  find<S extends OuterType>(
    predicate: unknown,
    thisArg?: unknown,
  ): S | undefined {
    void predicate;
    void thisArg;
    throw new Error("not yet implemented");
  }

  // OuterType[]
  findIndex(
    predicate: (value: OuterType, index: number, obj: OuterType[]) => unknown,
    thisArg?: unknown,
  ): number {
    void predicate;
    void thisArg;
    throw new Error("not yet implemented");
  }

  // OuterType[]
  fill(value: OuterType, start?: number, end?: number): OuterType[] {
    void value;
    void start;
    void end;
    throw new Error("not yet implemented");
  }

  // OuterType[]
  copyWithin(target: number, start: number, end?: number): OuterType[] {
    void target;
    void start;
    void end;
    throw new Error("not yet implemented");
  }

  // OuterType[]
  entries(): ArrayIterator<[number, OuterType]> {
    throw new Error("not yet implemented");
  }

  // OuterType[]
  keys(): ArrayIterator<number> {
    throw new Error("not yet implemented");
  }

  // OuterType[]
  values(): ArrayIterator<OuterType> {
    throw new Error("not yet implemented");
  }

  // OuterType[]
  includes(searchElement: OuterType, fromIndex?: number): boolean {
    void searchElement;
    void fromIndex;
    throw new Error("not yet implemented");
  }

  // OuterType[]
  flatMap<U, This = undefined>(
    callback: (
      this: This,
      value: OuterType,
      index: number,
      array: OuterType[],
    ) => U | readonly U[],
    thisArg?: This | undefined,
  ): U[] {
    void callback;
    void thisArg;
    throw new Error("not yet implemented");
  }

  // OuterType[]
  flat<A, D extends number = 1>(
    this: A,
    depth?: D | undefined,
  ): FlatArray<A, D>[] {
    void depth;
    throw new Error("not yet implemented");
  }

  // OuterType[]
  findLast<S extends OuterType>(
    predicate: unknown,
    thisArg?: unknown,
  ): OuterType | S | undefined {
    void predicate;
    void thisArg;
    throw new Error("not yet implemented");
  }

  // OuterType[]
  findLastIndex(
    predicate: (value: OuterType, index: number, array: OuterType[]) => unknown,
    thisArg?: unknown,
  ): number {
    void predicate;
    void thisArg;
    throw new Error("not yet implemented");
  }

  // OuterType[]
  toReversed(): OuterType[] {
    throw new Error("not yet implemented");
  }

  // OuterType[]
  toSorted(
    compareFn?: ((a: OuterType, b: OuterType) => number) | undefined,
  ): OuterType[] {
    void compareFn;
    throw new Error("not yet implemented");
  }

  // OuterType[]
  toSpliced(
    start: unknown,
    deleteCount?: unknown,
    ...items: unknown[]
  ): OuterType[] {
    void start;
    void deleteCount;
    void items;
    throw new Error("not yet implemented");
  }

  // OuterType[]
  with(index: number, value: OuterType): OuterType[] {
    void index;
    void value;
    throw new Error("not yet implemented");
  }
}
