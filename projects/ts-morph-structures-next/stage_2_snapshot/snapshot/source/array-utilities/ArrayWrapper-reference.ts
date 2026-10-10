const BUILD_ARRAY_WRAPPER = Symbol("build new array");
const GET_OUTER_TYPE = Symbol("get outer type");
const GET_PROXY = Symbol("get proxy for arrayWrapper");
const CONVERT_OUTER_TO_INNER = Symbol("convert outer type to inner type");

export { BUILD_ARRAY_WRAPPER, GET_PROXY, CONVERT_OUTER_TO_INNER };

export interface InnerTypeElement<OuterType> {
  [GET_OUTER_TYPE](): OuterType;
}

interface WritableArrayLike<T> {
  get length(): number;
  set length(newLength: number);
  [n: number]: T;
}

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy#handler_functions}
 */

export class WritableArrayProxyHandler<OuterType> implements ProxyHandler<
  ArrayWrapper<OuterType, InnerTypeElement<OuterType>>
> {
  /*
  apply(target: ArrayWrapper<OuterType, InnerTypeElement<OuterType>>, thisArg: unknown, argArray: unknown[]) {
    throw new Error("Method not implemented.");
  }
  construct(target: ArrayWrapper<OuterType, InnerTypeElement<OuterType>>, argArray: unknown[], newTarget: Function): object {
    throw new Error("Method not implemented.");
  }
  */
  defineProperty(
    target: ArrayWrapper<OuterType, InnerTypeElement<OuterType>>,
    property: string | symbol,
    attributes: PropertyDescriptor,
  ): boolean {
    void target;
    void property;
    void attributes;
    return false;
  }

  deleteProperty(
    target: ArrayWrapper<OuterType, InnerTypeElement<OuterType>>,
    p: string | symbol,
  ): boolean {
    void target;
    void p;
    return false;
  }

  get(
    target: ArrayWrapper<OuterType, InnerTypeElement<OuterType>>,
    p: string | symbol,
    receiver: unknown,
  ) {
    void target;
    void p;
    void receiver;
    throw new Error("Method not implemented.");
  }

  getOwnPropertyDescriptor(
    target: ArrayWrapper<OuterType, InnerTypeElement<OuterType>>,
    p: string | symbol,
  ): PropertyDescriptor | undefined {
    void target;
    void p;
    throw new Error("Method not implemented.");
  }
  /*
  getPrototypeOf(target: ArrayWrapper<OuterType, InnerTypeElement<OuterType>>): object | null {
    throw new Error("Method not implemented.");
  }
  */
  has(
    target: ArrayWrapper<OuterType, InnerTypeElement<OuterType>>,
    p: string | symbol,
  ): boolean {
    void target;
    void p;
    throw new Error("Method not implemented.");
  }
  /*
  isExtensible(target: ArrayWrapper<OuterType, InnerTypeElement<OuterType>>): boolean {
    throw new Error("Method not implemented.");
  }
  ownKeys(target: ArrayWrapper<OuterType, InnerTypeElement<OuterType>>): (string | symbol)[] {
    throw new Error("Method not implemented.");
  }
  preventExtensions(target: ArrayWrapper<OuterType, InnerTypeElement<OuterType>>): boolean {
    throw new Error("Method not implemented.");
  }

  set(target: ArrayWrapper<OuterType, InnerTypeElement<OuterType>>, p: string | symbol, newValue: unknown, receiver: unknown): boolean {
    throw new Error("Method not implemented.");
  }
  */
  setPrototypeOf(
    target: ArrayWrapper<OuterType, InnerTypeElement<OuterType>>,
    v: object | null,
  ): boolean {
    void target;
    void v;
    return false;
  }
}

export abstract class ArrayWrapper<
  OuterType,
  InnerType extends InnerTypeElement<OuterType>,
>
  implements
    WritableArrayLike<OuterType>,
    Omit<Array<OuterType>, number | "flat">
{
  static readonly #proxyHandler = new WritableArrayProxyHandler<unknown>();
  static readonly #shadowToProxyMap = new WeakMap<
    ArrayWrapper<unknown, InnerTypeElement<unknown>>,
    unknown[]
  >();

  static *#range(length: number): Iterable<number> {
    for (let i = 0; i < length; i++) yield i;
  }

  static indexRange(length: number): number[] {
    return Array.from(this.#range(length));
  }

  public static [GET_PROXY]<
    OuterType,
    InnerType extends InnerTypeElement<OuterType>,
  >(shadowTarget: ArrayWrapper<OuterType, InnerType>): OuterType[] {
    return ArrayWrapper.#shadowToProxyMap.get(
      shadowTarget as ArrayWrapper<unknown, InnerTypeElement<unknown>>,
    ) as OuterType[];
  }

  [n: number]: OuterType;
  readonly #innerElements: InnerType[];
  readonly #convertOuterTypeToInner = (outerType: OuterType): InnerType =>
    this[CONVERT_OUTER_TO_INNER](outerType);
  readonly #proxy: OuterType[];

  constructor(innerElements: InnerType[]) {
    this.#innerElements = innerElements;
    const proxy = new Proxy(
      this,
      ArrayWrapper.#proxyHandler as WritableArrayProxyHandler<OuterType>,
    ) as OuterType[];
    this.#proxy = proxy;
    (
      ArrayWrapper.#shadowToProxyMap as WeakMap<
        ArrayWrapper<OuterType, InnerType>,
        OuterType[]
      >
    ).set(this, proxy);
  }

  /** abstract to preserve subclass types */
  protected abstract [BUILD_ARRAY_WRAPPER](
    this: void,
    innerElements: InnerType[],
  ): ArrayWrapper<OuterType, InnerType>;

  /** attempt no caching: InnerType provides the OuterType. */
  protected abstract [CONVERT_OUTER_TO_INNER](
    this: void,
    outerType: OuterType,
  ): InnerType;

  #buildNewArray(...innerElements: InnerType[]): OuterType[] {
    const newArrayWrapper: ArrayWrapper<OuterType, InnerType> =
      this[BUILD_ARRAY_WRAPPER](innerElements);
    return ArrayWrapper[GET_PROXY]<OuterType, InnerType>(newArrayWrapper);
  }

  *[Symbol.iterator](): ArrayIterator<OuterType> {
    for (const innerValue of this.#innerElements)
      yield innerValue[GET_OUTER_TYPE]();
  }

  get [Symbol.unscopables](): {
    [K in keyof unknown[]]?: boolean;
  } {
    return this.#innerElements[Symbol.unscopables];
  }

  get length(): number {
    return this.#innerElements.length;
  }

  set length(newLength: number) {
    this.#innerElements.length = newLength;
  }

  pop(): OuterType | undefined {
    return this.#innerElements.pop()?.[GET_OUTER_TYPE]();
  }

  push(...outerItems: OuterType[]): number {
    const innerItems = outerItems.map(this.#convertOuterTypeToInner);
    return this.#innerElements.push(...innerItems);
  }

  concat(...items: readonly ConcatArray<OuterType>[]): OuterType[] {
    const newOuterItems: OuterType[] = items.flatMap((item) => item.slice());
    return this.#buildNewArray(
      ...this.#innerElements,
      ...newOuterItems.map(this.#convertOuterTypeToInner),
    );
  }

  join(separator?: string | undefined): string {
    return this.#innerElements
      .map((element) => element[GET_OUTER_TYPE]())
      .join(separator);
  }

  reverse(): OuterType[] {
    this.#innerElements.reverse();
    return this.#proxy;
  }

  shift(): OuterType | undefined {
    return this.#innerElements.shift()?.[GET_OUTER_TYPE]();
  }

  slice(start?: number | undefined, end?: number | undefined): OuterType[] {
    return this.#buildNewArray(...this.#innerElements.slice(start, end));
  }

  sort(
    compareFn: ((a: OuterType, b: OuterType) => number) | undefined,
  ): OuterType[] {
    const outerElements: OuterType[] = this.#innerElements.map((element) =>
      element[GET_OUTER_TYPE](),
    );

    const sortOrder: number[] = Array.from(
      ArrayWrapper.#range(this.#innerElements.length),
    );
    if (compareFn) {
      sortOrder.sort((a, b) => compareFn(outerElements[a], outerElements[b]));
    } else {
      const stringifiedOuter: readonly string[] = outerElements.map(String);
      sortOrder.sort((a, b) =>
        stringifiedOuter[a].localeCompare(stringifiedOuter[b]),
      );
    }

    const innerSlice = this.#innerElements.slice();
    for (let i = 0; i < this.#innerElements.length; i++) {
      this.#innerElements[i] = innerSlice[sortOrder[i]];
    }

    return this.#proxy;
  }

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
    return this.#buildNewArray(...extractedInnerItems);
  }

  unshift(...outerItems: OuterType[]): number {
    const innerItems = outerItems.map(this.#convertOuterTypeToInner);
    return this.#innerElements.unshift(...innerItems);
  }

  indexOf(searchElement: OuterType, fromIndex?: number | undefined): number {
    return this.#innerElements.findIndex(
      this.#innerFinder.bind(this, searchElement),
      fromIndex,
    );
  }

  #innerFinder(searchElement: OuterType, inner: InnerType): boolean {
    return inner[GET_OUTER_TYPE]() === searchElement;
  }

  lastIndexOf(
    searchElement: OuterType,
    fromIndex?: number | undefined,
  ): number {
    return this.#innerElements.findLastIndex(
      this.#innerFinder.bind(this, searchElement),
      fromIndex,
    );
  }

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
    return predicate(innerElement[GET_OUTER_TYPE](), index, this.#proxy);
  }

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

  forEach(
    callbackfn: (value: OuterType, index: number, array: OuterType[]) => void,
    thisArg?: unknown,
  ): void {
    this.#innerElements.forEach(
      (innerValue: InnerType, index: number) =>
        callbackfn(innerValue[GET_OUTER_TYPE](), index, this.#proxy),
      thisArg,
    );
  }

  map<U>(
    callbackfn: (value: OuterType, index: number, array: OuterType[]) => U,
    thisArg?: unknown,
  ): U[] {
    return this.#innerElements.map<U>(
      (innerValue, index) =>
        callbackfn(innerValue[GET_OUTER_TYPE](), index, this.#proxy),
      thisArg,
    );
  }

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
        predicate(innerValue[GET_OUTER_TYPE](), index, this.#proxy),
      thisArg,
    );
    return this.#buildNewArray(...newElements) as S[];
  }

  reduce(
    callbackfn: (
      previousValue: OuterType,
      currentValue: OuterType,
      currentIndex: number,
      array: OuterType[],
    ) => OuterType,
  ): OuterType {
    const innerElement = this.#innerElements.reduce(
      (previousInner: InnerType, currentInner: InnerType, currentIndex) =>
        this[CONVERT_OUTER_TO_INNER](
          callbackfn(
            previousInner[GET_OUTER_TYPE](),
            currentInner[GET_OUTER_TYPE](),
            currentIndex,
            this.#proxy,
          ),
        ),
    );
    return innerElement[GET_OUTER_TYPE]();
  }

  reduceRight(
    callbackfn: (
      previousValue: OuterType,
      currentValue: OuterType,
      currentIndex: number,
      array: OuterType[],
    ) => OuterType,
  ): OuterType {
    const innerElement = this.#innerElements.reduceRight(
      (previousInner: InnerType, currentInner: InnerType, currentIndex) =>
        this[CONVERT_OUTER_TO_INNER](
          callbackfn(
            previousInner[GET_OUTER_TYPE](),
            currentInner[GET_OUTER_TYPE](),
            currentIndex,
            this.#proxy,
          ),
        ),
    );
    return innerElement[GET_OUTER_TYPE]();
  }

  find<S extends OuterType>(
    predicate: (
      value: OuterType,
      index: number,
      obj: OuterType[],
    ) => value is S,
    thisArg?: unknown,
  ): S | undefined {
    return this.#innerElements
      .find(
        (innerValue: InnerType, index) =>
          predicate(innerValue[GET_OUTER_TYPE](), index, this.#proxy),
        thisArg,
      )
      ?.[GET_OUTER_TYPE]() as S | undefined;
  }

  findIndex(
    predicate: (value: OuterType, index: number, obj: OuterType[]) => unknown,
    thisArg?: unknown,
  ): number {
    return this.#innerElements.findIndex(
      (innerValue: InnerType, index): unknown =>
        predicate(innerValue[GET_OUTER_TYPE](), index, this.#proxy),
      thisArg,
    );
  }

  fill(
    outerValue: OuterType,
    start?: number | undefined,
    end?: number | undefined,
  ): OuterType[] {
    const innerValue: InnerType = this.#convertOuterTypeToInner(outerValue);
    this.#innerElements.fill(innerValue, start, end);
    return this.#proxy;
  }

  copyWithin(
    target: number,
    start: number,
    end?: number | undefined,
  ): OuterType[] {
    this.#innerElements.copyWithin(target, start, end);
    return this.#proxy;
  }

  *entries(): ArrayIterator<[number, OuterType]> {
    for (const [index, innerValue] of this.#innerElements.entries()) {
      yield [index, innerValue[GET_OUTER_TYPE]()];
    }
  }

  keys(): ArrayIterator<number> {
    return this.#innerElements.keys();
  }

  values(): ArrayIterator<OuterType> {
    return this[Symbol.iterator]();
  }

  includes(searchElement: OuterType, fromIndex?: number | undefined): boolean {
    return this.indexOf(searchElement, fromIndex) !== -1;
  }

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
    throw new Error("Function not implemented.");
  }

  flat(depth?: number | undefined): FlatArray<OuterType, number>[] {
    void depth;
    throw new Error("Function not implemented.");
  }

  at(index: number): OuterType | undefined {
    return this.#innerElements.at(index)?.[GET_OUTER_TYPE]();
  }

  findLast<S extends OuterType>(
    predicate: (
      value: OuterType,
      index: number,
      array: OuterType[],
    ) => value is S,
    thisArg?: unknown,
  ): S | undefined {
    return this.#innerElements
      .findLast(
        (innerValue: InnerType, index) =>
          predicate(innerValue[GET_OUTER_TYPE](), index, this.#proxy),
        thisArg,
      )
      ?.[GET_OUTER_TYPE]() as S | undefined;
  }

  findLastIndex(
    predicate: (
      value: OuterType,
      index: number,
      array: OuterType[],
    ) => OuterType,
    thisArg?: unknown,
  ): number {
    return this.#innerElements.findLastIndex(
      (innerValue: InnerType, index): unknown =>
        predicate(innerValue[GET_OUTER_TYPE](), index, this.#proxy),
      thisArg,
    );
  }

  toReversed(): OuterType[] {
    return this.slice().reverse();
  }

  toSorted(
    compareFn?: ((a: OuterType, b: OuterType) => number) | undefined,
  ): OuterType[] {
    return this.slice().sort(compareFn);
  }

  toSpliced(
    start: number,
    deleteCount: number,
    ...items: OuterType[]
  ): OuterType[] {
    return this.slice().splice(start, deleteCount, ...items);
  }

  with(index: number, value: OuterType): OuterType[] {
    const newArray = this.slice();
    newArray.splice(index, 1, value);
    return newArray;
  }
}
