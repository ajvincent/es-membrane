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
   *
   * @remarks `return new ShadowArrayImplSubclass(innerElements).proxy;`
   */
  public static createProxy(
    innerElements: InnerTypeElement<unknown>[],
  ): unknown[] {
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

  /**
   * abstract to preserve subclass types
   *
   * `return new ShadowArrayImplSubclass(innerElements).proxy`
   */
  protected abstract [BUILD_ARRAY_WRAPPER](
    ...innerElements: InnerType[]
  ): OuterType[];

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
  *[Symbol.iterator](): ArrayIterator<OuterType> {
    for (const innerValue of this.#innerElements)
      yield innerValue[GET_OUTER_TYPE]();
  }

  // OuterType[]
  get [Symbol.unscopables](): {
    [K in keyof unknown[]]?: boolean;
  } {
    throw new Error("not yet implemented");
  }

  // OuterType[]
  pop(): OuterType | undefined {
    return this.#innerElements.pop()?.[GET_OUTER_TYPE]();
  }

  // OuterType[]
  push(...outerItems: OuterType[]): number {
    const innerItems = outerItems.map(this.#convertOuterTypeToInner);
    return this.#innerElements.push(...innerItems);
  }

  // OuterType[]
  concat(...items: readonly ConcatArray<OuterType>[]): OuterType[] {
    const newOuterItems: OuterType[] = items.flatMap((item) => item.slice());
    return this[BUILD_ARRAY_WRAPPER](
      ...this.#innerElements,
      ...newOuterItems.map(this.#convertOuterTypeToInner),
    );
  }

  // OuterType[]
  join(separator?: string): string {
    return this.#innerElements
      .map((element) => element[GET_OUTER_TYPE]())
      .join(separator);
  }

  // OuterType[]
  reverse(): OuterType[] {
    this.#innerElements.reverse();
    return this.proxy;
  }

  // OuterType[]
  shift(): OuterType | undefined {
    return this.#innerElements.shift()?.[GET_OUTER_TYPE]();
  }

  // OuterType[]
  slice(start?: number, end?: number): OuterType[] {
    return this[BUILD_ARRAY_WRAPPER](...this.#innerElements.slice(start, end));
  }

  // OuterType[]
  sort(
    compareFn?: ((a: OuterType, b: OuterType) => number) | undefined,
  ): OuterType[] {
    const outerElements: OuterType[] = this.#innerElements.map((element) =>
      element[GET_OUTER_TYPE](),
    );
    const sortOrder: number[] = ShadowArrayImpl.indexRange(
      outerElements.length,
    );

    if (compareFn) {
      sortOrder.sort((a, b) => compareFn(outerElements[a], outerElements[b]));
    } else {
      const stringifiedOuter: readonly string[] = outerElements.map(String);
      sortOrder.sort((a, b) =>
        stringifiedOuter[a].localeCompare(stringifiedOuter[b]),
      );
    }

    const innerSlice: InnerType[] = this.#innerElements.slice();
    for (let i = 0; i < this.#innerElements.length; i++) {
      this.#innerElements[i] = innerSlice[sortOrder[i]];
    }

    return this.proxy;
  }

  // OuterType[]
  splice(
    start: number,
    deleteCount?: number | undefined,
    ...outerItems: OuterType[]
  ): OuterType[] {
    const newInnerItems: InnerType[] = outerItems.map(
      this.#convertOuterTypeToInner,
    );
    const extractedInnerItems: InnerType[] = this.#innerElements.splice(
      start,
      deleteCount ?? 0,
      ...newInnerItems,
    );
    return this[BUILD_ARRAY_WRAPPER](...extractedInnerItems);
  }
  // OuterType[]
  unshift(...outerItems: OuterType[]): number {
    const innerItems = outerItems.map(this.#convertOuterTypeToInner);
    return this.#innerElements.unshift(...innerItems);
  }

  // OuterType[]
  indexOf(searchElement: OuterType, fromIndex?: number | undefined): number {
    return this.#innerElements.findIndex(
      this.#innerFinder.bind(this, searchElement),
      fromIndex,
    );
  }

  #innerFinder(searchElement: OuterType, inner: InnerType): boolean {
    return inner[GET_OUTER_TYPE]() === searchElement;
  }

  // OuterType[]
  lastIndexOf(searchElement: OuterType, fromIndex?: number): number {
    return this.#innerElements.findLastIndex(
      this.#innerFinder.bind(this, searchElement),
      fromIndex,
    );
  }

  // OuterType[]
  every<S extends OuterType>(
    predicate: (
      value: OuterType,
      index: number,
      array: OuterType[],
    ) => value is S,
    thisArg?: unknown,
  ): this is S[] {
    return this.#innerElements.every(
      this.#innerPredicate.bind(this, predicate),
      thisArg,
    );
  }

  #innerPredicate<S extends OuterType>(
    predicate: (
      value: OuterType,
      index: number,
      array: OuterType[],
    ) => value is S,
    innerElement: InnerType,
    index: number,
  ): boolean {
    return predicate(innerElement[GET_OUTER_TYPE](), index, this.proxy);
  }

  // OuterType[]
  some<S extends OuterType>(
    predicate: (
      value: OuterType,
      index: number,
      array: OuterType[],
    ) => value is S,
    thisArg?: unknown,
  ): boolean {
    return this.#innerElements.some(
      this.#innerPredicate.bind(this, predicate),
      thisArg,
    );
  }

  // OuterType[]
  forEach(
    callbackfn: (value: OuterType, index: number, array: OuterType[]) => void,
    thisArg?: unknown,
  ): void {
    this.#innerElements.forEach(
      (innerValue: InnerType, index: number) =>
        callbackfn(innerValue[GET_OUTER_TYPE](), index, this.proxy),
      thisArg,
    );
  }

  // OuterType[]
  map<U>(
    callbackfn: (value: OuterType, index: number, array: OuterType[]) => U,
    thisArg?: unknown,
  ): U[] {
    return this.#innerElements.map<U>(
      (innerValue, index) =>
        callbackfn(innerValue[GET_OUTER_TYPE](), index, this.proxy),
      thisArg,
    );
  }

  // OuterType[]

  filter<S extends OuterType>(
    predicate: (
      value: OuterType,
      index: number,
      array: OuterType[],
    ) => value is S,
    thisArg?: unknown,
  ): S[] {
    const newElements: InnerType[] = this.#innerElements.filter(
      (innerValue: InnerType, index: number) =>
        predicate(innerValue[GET_OUTER_TYPE](), index, this.proxy),
      thisArg,
    );
    return this[BUILD_ARRAY_WRAPPER](...newElements) as S[];
  }

  // OuterType[]
  reduce(
    callbackfn: (
      previousValue: OuterType,
      currentValue: OuterType,
      currentIndex: number,
      array: OuterType[],
    ) => OuterType,
  ): OuterType {
    return this.#innerElements
      .reduce(this.#reducer.bind(this, callbackfn))
      [GET_OUTER_TYPE]();
  }

  // OuterType[]
  reduceRight(
    callbackfn: (
      previousValue: OuterType,
      currentValue: OuterType,
      currentIndex: number,
      array: OuterType[],
    ) => OuterType,
  ): OuterType {
    return this.#innerElements
      .reduceRight(this.#reducer.bind(this, callbackfn))
      [GET_OUTER_TYPE]();
  }

  #reducer(
    callbackfn: (
      previousValue: OuterType,
      currentValue: OuterType,
      currentIndex: number,
      array: OuterType[],
    ) => OuterType,
    previousInner: InnerType,
    currentInner: InnerType,
    currentIndex: number,
  ): InnerType {
    const previousOuter: OuterType = previousInner[GET_OUTER_TYPE]();
    const currentOuter: OuterType = currentInner[GET_OUTER_TYPE]();

    const newOuterType: OuterType = callbackfn(
      previousOuter,
      currentOuter,
      currentIndex,
      this.proxy,
    );
    return this[CONVERT_OUTER_TO_INNER](newOuterType);
  }

  // OuterType[]
  find<S extends OuterType>(
    predicate: (
      value: OuterType,
      index: number,
      obj: OuterType[],
    ) => value is S,
    thisArg?: unknown,
  ): S | undefined {
    return this.#innerElements
      .find(this.#finder.bind(this, predicate), thisArg)
      ?.[GET_OUTER_TYPE]() as S | undefined;
  }

  // OuterType[]
  findIndex(
    predicate: (value: OuterType, index: number, obj: OuterType[]) => unknown,
    thisArg?: unknown,
  ): number {
    return this.#innerElements.findIndex(
      this.#finder.bind(this, predicate),
      thisArg,
    );
  }

  #finder<RT>(
    outerPredicate: (value: OuterType, index: number, obj: OuterType[]) => RT,
    innerValue: InnerType,
    index: number,
  ): RT {
    return outerPredicate(innerValue[GET_OUTER_TYPE](), index, this.proxy);
  }

  // OuterType[]
  fill(
    outerValue: OuterType,
    start?: number | undefined,
    end?: number | undefined,
  ): OuterType[] {
    const innerValue: InnerType = this.#convertOuterTypeToInner(outerValue);
    this.#innerElements.fill(innerValue, start, end);
    return this.proxy;
  }

  // OuterType[]
  copyWithin(
    target: number,
    start: number,
    end?: number | undefined,
  ): OuterType[] {
    this.#innerElements.copyWithin(target, start, end);
    return this.proxy;
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
