/* eslint-disable @typescript-eslint/no-explicit-any */

import NotImplementedProxyHandler from "./NotImplementedHandler.mjs";
import type {
  ArrayWithoutIndices,
  DataDescriptor,
  BackingAndPublicDictionary,
  UpdateSymbolTracking,
} from "./types/export-types.mjs";

interface BackingAndPublicArrayDictionaryIfc<
  BackingType extends object,
  PublicType extends object,
>
{
  backingArray: BackingType[];
  readonly wrappedPublicArray: PublicType[];
  readonly shadowTargetArray: PublicTypeArrayShadowWrapper<BackingType, PublicType>;
  readonly proxyArray: PublicTypeArrayShadowWrapper<BackingType, PublicType>;
  revoke(): void;
}

class BackingAndPublicArrayDictionary<
  BackingType extends object,
  PublicType extends object,
>
implements BackingAndPublicArrayDictionaryIfc<BackingType, PublicType>, UpdateSymbolTracking
{
  readonly backingArray: BackingType[];
  readonly wrappedPublicArray: PublicType[];
  readonly shadowTargetArray: PublicTypeArrayShadowWrapper<BackingType, PublicType>;
  readonly proxyArray: PublicTypeArrayShadowWrapper<BackingType, PublicType>;
  readonly revoke: () => void;
  #lastUpdateSymbol: symbol;

  constructor(
    dictionary: Omit<
      BackingAndPublicArrayDictionaryIfc<BackingType, PublicType>,
      "markUpdated" | "lastUpdateSymbol"
    >,
    updateSymbol: symbol
  )
  {
    this.backingArray = dictionary.backingArray;
    this.wrappedPublicArray = dictionary.wrappedPublicArray;
    this.shadowTargetArray = dictionary.shadowTargetArray;
    this.proxyArray = dictionary.proxyArray;
    this.revoke = dictionary.revoke;

    this.#lastUpdateSymbol = updateSymbol
  }

  markUpdated(): symbol
  {
    this.#lastUpdateSymbol = Symbol();
    return this.#lastUpdateSymbol;
  }

  get lastUpdateSymbol(): symbol
  {
    return this.#lastUpdateSymbol;
  }
}

interface BackingPublicContextBase<
  BackingType extends object,
  PublicType extends object,
>
{
  readonly buildPublic: (backingValue: BackingType) => PublicType,
  readonly buildBacking: (publicValue: PublicType) => BackingType,
}

interface BackingPublicContext<
  BackingType extends object,
  PublicType extends object,
> extends BackingPublicContextBase<BackingType, PublicType>
{
  readonly objectOneToOneMap: WeakMap<
    BackingType | PublicType,
    BackingAndPublicDictionary<BackingType, PublicType>
  >;
  readonly arrayOneToOneMap: WeakMap<
    PublicType[] | BackingType[],
    BackingAndPublicArrayDictionaryIfc<BackingType, PublicType> & UpdateSymbolTracking
  >;
}

export class PublicArrayProxyHandler<
  BackingType extends object,
  PublicType extends object,
>
extends NotImplementedProxyHandler
implements Required<ProxyHandler<PublicTypeArrayShadowWrapper<BackingType, PublicType>>>
{
  static getNumericIndex(
    p: string | symbol
  ): number
  {
    if (typeof p === "symbol")
      return NaN;
    const pNum = parseFloat(p);
    if (isNaN(pNum) || (Math.floor(pNum) !== pNum) || (pNum < 0) || !isFinite(pNum))
      return NaN;
    return pNum;
  }

  // #region proxy management

  readonly #context: BackingPublicContext<BackingType, PublicType>;
  //readonly #methodHandler: ArrayMethodProxyHandler<BackingType, PublicType>;

  constructor(
    baseContext: BackingPublicContextBase<BackingType, PublicType>,
  )
  {
    super()
    this.#context = {
      ...baseContext,

      objectOneToOneMap: new WeakMap,
      arrayOneToOneMap: new WeakMap,
    };

    //this.#methodHandler = new ArrayMethodProxyHandler<BackingType, PublicType>;
  }

  getProxy(
    backingValues: BackingType[]
  ): PublicTypeArrayShadowWrapper<BackingType, PublicType>
  {
    return this.#context.arrayOneToOneMap.get(backingValues)?.proxyArray ??
      this.#createArrayProxy(backingValues);
  }

  revokeProxy(
    values: PublicType[] | BackingType[]
  ): void
  {
    this.#context.arrayOneToOneMap.get(values)?.revoke();
  }

  #createArrayProxy(
    backingArray: BackingType[]
  ): PublicTypeArrayShadowWrapper<BackingType, PublicType>
  {
    const wrappedPublicArray = backingArray.map(backingValue => this.requirePublic(backingValue));

    const shadowTargetArray = new PublicTypeArrayShadowWrapper<BackingType, PublicType>(
      this,
      {
        backingArray,
        wrappedPublicArray,
      }
    );
    shadowTargetArray satisfies PublicType[];

    const {
      proxy: proxyArray,
      revoke
    } = Proxy.revocable<
      PublicTypeArrayShadowWrapper<BackingType, PublicType>
    >(shadowTargetArray, this);

    const arrayDictionary = new BackingAndPublicArrayDictionary<BackingType, PublicType>(
      {
        backingArray,
        wrappedPublicArray,
        shadowTargetArray,
        proxyArray,
        revoke,
      },
      Symbol()
    );

    this.#context.arrayOneToOneMap.set(backingArray, arrayDictionary);
    this.#context.arrayOneToOneMap.set(wrappedPublicArray, arrayDictionary);
    this.#context.arrayOneToOneMap.set(shadowTargetArray, arrayDictionary);
    this.#context.arrayOneToOneMap.set(proxyArray, arrayDictionary);

    return proxyArray;
  }

  requirePublic(backingValue: BackingType): PublicType
  {
    if (!this.#context.objectOneToOneMap.has(backingValue)) {
      const publicValue = this.#context.buildPublic(backingValue)
      const backingAndPublic: BackingAndPublicDictionary<BackingType, PublicType> = {
        backingValue,
        publicValue
      };

      this.#context.objectOneToOneMap.set(backingValue, backingAndPublic);
      this.#context.objectOneToOneMap.set(publicValue, backingAndPublic);

      return publicValue;
    }

    return this.#context.objectOneToOneMap.get(backingValue)!.publicValue;
  }

  requireBacking(publicValue: PublicType): BackingType
  {
    if (!this.#context.objectOneToOneMap.has(publicValue)) {
      const backingValue = this.#context.buildBacking(publicValue);

      const backingAndPublic: BackingAndPublicDictionary<BackingType, PublicType> = {
        backingValue,
        publicValue
      };

      this.#context.objectOneToOneMap.set(backingValue, backingAndPublic);
      this.#context.objectOneToOneMap.set(publicValue, backingAndPublic);

      return backingValue;
    }

    return this.#context.objectOneToOneMap.get(publicValue)!.backingValue;
  }

  // #endregion proxy management

  // #region ProxyHandler

  defineProperty(
    shadowTargetArray: PublicTypeArrayShadowWrapper<BackingType, PublicType>,
    property: string | symbol,
    publicDesc: PropertyDescriptor
  ): boolean
  {
    const context = this.#context.arrayOneToOneMap.get(shadowTargetArray)!;

    const numericIndex = property !== "length" ?
      PublicArrayProxyHandler.getNumericIndex(property) : 1;

    if (isNaN(numericIndex) && property !== "length")
      return false;

    if (publicDesc.get ?? publicDesc.set)
      return false;

    let value: undefined | number | BackingType = undefined;
    if (property === "length")
      value = publicDesc.value as number;
    else if (publicDesc.value !== undefined) {
      value = this.requireBacking(publicDesc.value as PublicType);
    }

    const backingDesc: DataDescriptor = {
      ...publicDesc,
      value
    };

    const rv = Reflect.defineProperty(context.backingArray, property, backingDesc);
    if (rv) {
      context.markUpdated();
    }

    return rv;
  }

  deleteProperty(
    shadowTargetArray: PublicTypeArrayShadowWrapper<BackingType, PublicType>,
    property: string | symbol
  ): boolean
  {
    const numericIndex = PublicArrayProxyHandler.getNumericIndex(property);
    if (isNaN(numericIndex))
      return false;

    const { backingArray } = this.#context.arrayOneToOneMap.get(shadowTargetArray)!;

    const rv = (
      Reflect.deleteProperty(backingArray, property) &&
      Reflect.deleteProperty(shadowTargetArray, property)
    );
    if (rv) {
      shadowTargetArray.refreshFromBackingArray();
    }
    return rv;
  }

  get(
    shadowTargetArray: PublicTypeArrayShadowWrapper<BackingType, PublicType>,
    property: string | symbol,
    receiver: any
  ): any
  {
    void(receiver);

    const numericIndex = PublicArrayProxyHandler.getNumericIndex(property);
    if (!isNaN(numericIndex)) {
      return this.getOwnPropertyDescriptor(shadowTargetArray, property)?.value;
    }

    if (!Reflect.has(Array.prototype, property))
      return undefined;

    const propertyName = property as keyof ArrayWithoutIndices;
    if (propertyName === "length") {
      shadowTargetArray.refreshFromBackingArray();
      return shadowTargetArray.length;
    }

    if (propertyName === Symbol.unscopables) {
      return shadowTargetArray[propertyName];
    }

    const boundDesc = this.#bindMethod(shadowTargetArray, propertyName);
    return boundDesc.value;
  }

  #bindMethod(
    shadowTargetArray: PublicTypeArrayShadowWrapper<BackingType, PublicType>,
    property: keyof Omit<object[], number | typeof Symbol.unscopables | "length">
  ): DataDescriptor
  {
    let shadowDesc = Reflect.getOwnPropertyDescriptor(
      shadowTargetArray, property
    ) as DataDescriptor | undefined;

    if (!shadowDesc) {
      const { proxyArray } = this.#context.arrayOneToOneMap.get(shadowTargetArray)!;
      const shadowMethod = shadowTargetArray[property].bind(proxyArray);

      /*
      const proxyMethod = new Proxy(
        shadowMethod,
        this.#methodHandler
      );
      */

      shadowDesc = {
        configurable: false,
        enumerable: true,
        writable: false,
        value: shadowMethod /* proxyMethod */,
      };
      Reflect.defineProperty(shadowTargetArray, property, shadowDesc);
    }

    return shadowDesc;
  }

  getOwnPropertyDescriptor(
    shadowTargetArray: PublicTypeArrayShadowWrapper<BackingType, PublicType>,
    property: string | symbol
  ): PropertyDescriptor | undefined
  {
    const numericIndex = PublicArrayProxyHandler.getNumericIndex(property);
    if (isNaN(numericIndex))
      return undefined;

    shadowTargetArray.refreshFromBackingArray();

    const { backingArray } = this.#context.arrayOneToOneMap.get(shadowTargetArray)!;
    const backingDesc = Reflect.getOwnPropertyDescriptor(
      backingArray, property
    ) as DataDescriptor | undefined;
    if (!backingDesc)
      return undefined;

    const shadowDesc = {
      ...backingDesc,
      value: this.requirePublic(backingDesc.value as BackingType)
    };
    if (!Reflect.defineProperty(shadowTargetArray, property, shadowDesc))
      return undefined;

    return shadowDesc;
  }

  getPrototypeOf(
    shadowTargetArray: PublicTypeArrayShadowWrapper<BackingType, PublicType>
  ): object | null
  {
    return Reflect.getPrototypeOf(shadowTargetArray);
  }

  has(
    shadowTargetArray: PublicTypeArrayShadowWrapper<BackingType, PublicType>,
    property: string | symbol
  ): boolean
  {
    const numericIndex = PublicArrayProxyHandler.getNumericIndex(property);
    if (!isNaN(numericIndex)) {
      shadowTargetArray.refreshFromBackingArray();

      const { backingArray } = this.#context.arrayOneToOneMap.get(shadowTargetArray)!;
      const result = Reflect.has(backingArray, property);
      if (result) {
        const backingDesc = Reflect.getOwnPropertyDescriptor(
          backingArray, property
        ) as DataDescriptor;

        const publicDesc = {
          ...backingDesc,
          value: this.requirePublic(backingDesc.value as BackingType)
        };

        return Reflect.defineProperty(shadowTargetArray, property, publicDesc);
      }

      return false;
    }

    return Reflect.has(shadowTargetArray, property);
  }

  isExtensible(
    shadowTargetArray: PublicTypeArrayShadowWrapper<BackingType, PublicType>
  ): boolean
  {
    return Reflect.isExtensible(shadowTargetArray);
  }

  ownKeys(
    shadowTargetArray: PublicTypeArrayShadowWrapper<BackingType, PublicType>
  ): ArrayLike<string | symbol>
  {
    const { backingArray } = this.#context.arrayOneToOneMap.get(shadowTargetArray)!;
    return Reflect.ownKeys(backingArray);
  }

  preventExtensions(
    shadowTargetArray: PublicTypeArrayShadowWrapper<BackingType, PublicType>
  ): boolean
  {
    void(shadowTargetArray);
    return false;
  }

  set(
    shadowTargetArray: PublicTypeArrayShadowWrapper<BackingType, PublicType>,
    propertyName: string | symbol,
    newValue: any,
    receiver: any
  ): boolean
  {
    void(receiver);
    return this.defineProperty(
      shadowTargetArray,
      propertyName,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      { value: newValue }
    );
  }

  setPrototypeOf(
    shadowTargetArray: PublicTypeArrayShadowWrapper<BackingType, PublicType>,
    newPrototype: object | null
  ): boolean
  {
    void(shadowTargetArray);
    void(newPrototype);
    return false;
  }

  // #endregion ProxyHandler
}
/*










  REMOVE THIS LINE
 */
/* eslint-disable @typescript-eslint/no-unused-vars */


class PublicTypeArrayShadowWrapper<
  BackingType extends object,
  PublicType extends object
> extends Array<PublicType>
{
  readonly #proxyHandler: PublicArrayProxyHandler<BackingType, PublicType>
  readonly #backingArray: BackingType[];

  #updateSymbolTracking: UpdateSymbolTracking | undefined;

  #lastUpdateSymbol = Symbol();

  constructor(
    proxyHandler: PublicArrayProxyHandler<BackingType, PublicType>,
    items: Pick<
      BackingAndPublicArrayDictionaryIfc<BackingType, PublicType>,
      "backingArray" | "wrappedPublicArray"
    >
  )
  {
    super(...items.wrappedPublicArray);
    this.#proxyHandler = proxyHandler;
    this.#backingArray = items.backingArray;
  }

  set symbolTracker(
    tracking: UpdateSymbolTracking
  )
  {
    if (this.#updateSymbolTracking)
      throw new Error("symbolTracker already set");
    this.#updateSymbolTracking = tracking;
    this.#lastUpdateSymbol = tracking.lastUpdateSymbol;
  }

  refreshFromBackingArray(): void
  {
    if (!this.#updateSymbolTracking) {
      throw new Error("We should be tracking now");
    }
    if (this.#lastUpdateSymbol === this.#updateSymbolTracking.lastUpdateSymbol)
      return;

    Array.prototype.splice.call(this, 0, this.length, ...this.#backingArray.map(this.#getPublicValue))
    this.#lastUpdateSymbol = this.#updateSymbolTracking.lastUpdateSymbol;
  }

  #markUpdated<ReturnedType>(returnValue: ReturnedType): ReturnedType
  {
    if (!this.#updateSymbolTracking) {
      throw new Error("We should be tracking now");
    }
    this.#lastUpdateSymbol = this.#updateSymbolTracking.markUpdated();
    return returnValue;
  }

  readonly #getPublicValue = (backingValue: BackingType): PublicType =>
  {
    return this.#proxyHandler.requirePublic(backingValue);
  }

  readonly #getBackingValue = (publicValue: PublicType): BackingType =>
  {
    return this.#proxyHandler.requireBacking(publicValue);
  }

  [Symbol.iterator](): IterableIterator<PublicType>
  {
    throw new Error("Function not implemented.");
  }

  get length(): number {
    this.refreshFromBackingArray();
    return super.length;
  }

  pop(): PublicType | undefined {
    this.refreshFromBackingArray();
    return this.#markUpdated<PublicType | undefined>(super.pop());
  }

  push(...publicItems: PublicType[]): number {
    this.refreshFromBackingArray();
    const backingItems = publicItems.map(this.#getBackingValue);
    this.#backingArray.push(...backingItems);
    return this.#markUpdated<number>(super.push(...publicItems));
  }

  concat(
    ...items: ConcatArray<PublicType>[]
  ): PublicTypeArrayShadowWrapper<BackingType, PublicType>
  {
    this.refreshFromBackingArray();
    const publicItems: PublicType[] = super.concat(...items);

    const newBackingArray: BackingType[] = publicItems.map(this.#getBackingValue);
    return this.#proxyHandler.getProxy(newBackingArray);
  }

  join(separator?: string | undefined): string
  {
    this.refreshFromBackingArray();
    return super.join(separator);
  }

  reverse(): PublicType[] {
    this.refreshFromBackingArray();
    return this.#markUpdated<PublicType[]>(super.reverse());
  }

  shift(): PublicType | undefined
  {
    this.refreshFromBackingArray();
    if (this.length === 0)
      return undefined;

    this.#backingArray.shift();
    return this.#markUpdated<PublicType | undefined>(super.shift());
  }

  slice(
    start?: number | undefined,
    end?: number | undefined
  ): PublicTypeArrayShadowWrapper<BackingType, PublicType>
  {
    const newBackingArray: BackingType[] = this.#backingArray.slice(start, end);
    return this.#proxyHandler.getProxy(newBackingArray);
  }

  sort(
    compareFn?: (
      (a: PublicType, b: PublicType) => number
    ) | undefined,
  ): this
  {
    if (!compareFn)
      throw new Error("unable to sort objects without a comparator");

    const map = new WeakMap<BackingType, PublicType>(
      this.#backingArray.map(backingValue => [backingValue, this.#getPublicValue(backingValue)])
    );

    this.#backingArray.sort(
      this.#sortBound.bind(this, map, compareFn)
    );

    // Force a refresh.
    this.#lastUpdateSymbol = Symbol();
    this.refreshFromBackingArray();
    return this.#markUpdated<this>(this);
  }

  #sortBound(
    map: WeakMap<BackingType, PublicType>,
    compareFn: (a: PublicType, b: PublicType) => number,
    backingValueA: BackingType,
    backingValueB: BackingType,
  ): number
  {
    return compareFn(
      map.get(backingValueA)!,
      map.get(backingValueB)!,
    );
  }

  splice(start: number, deleteCount?: number | undefined): PublicType[] {
    this.refreshFromBackingArray();
    throw new Error("Function not implemented.");
  }
  unshift(...items: PublicType[]): number {
    this.refreshFromBackingArray();
    throw new Error("Function not implemented.");
  }
  indexOf(searchElement: PublicType, fromIndex?: number | undefined): number {
    this.refreshFromBackingArray();
    throw new Error("Function not implemented.");
  }
  lastIndexOf(searchElement: PublicType, fromIndex?: number | undefined): number {
    this.refreshFromBackingArray();
    throw new Error("Function not implemented.");
  }
  every<S extends PublicType>(predicate: (value: PublicType, index: number, array: PublicType[]) => value is S, thisArg?: any): this is S[];
  every(predicate: (value: PublicType, index: number, array: PublicType[]) => unknown, thisArg?: any): boolean;
  every(predicate: unknown, thisArg?: unknown): boolean {
    this.refreshFromBackingArray();
    throw new Error("Function not implemented")
  }
  some(predicate: (value: PublicType, index: number, array: PublicType[]) => boolean, thisArg?: PublicType): boolean {
    this.refreshFromBackingArray();
    throw new Error("Function not implemented.");
  }
  forEach(callbackfn: (value: PublicType, index: number, array: PublicType[]) => void, thisArg?: PublicType): void {
    this.refreshFromBackingArray();
    throw new Error("Function not implemented.");
  }
  map<U>(callbackfn: (value: PublicType, index: number, array: PublicType[]) => U, thisArg?: PublicType): U[] {
    this.refreshFromBackingArray();
    throw new Error("Function not implemented.");
  }
  filter(predicate: (value: PublicType, index: number, array: PublicType[]) => unknown, thisArg?: any): PublicType[];
  filter(predicate: unknown, thisArg?: unknown): PublicType[] {
    this.refreshFromBackingArray();
    throw new Error("Function not implemented");
  }
  reduce(callbackfn: (previousValue: PublicType, currentValue: PublicType, currentIndex: number, array: PublicType[]) => PublicType): PublicType;
  reduce(callbackfn: (previousValue: PublicType, currentValue: PublicType, currentIndex: number, array: PublicType[]) => PublicType, initialValue: PublicType): PublicType;
  reduce<U>(callbackfn: (previousValue: U, currentValue: PublicType, currentIndex: number, array: PublicType[]) => U, initialValue: U): U;
  reduce(callbackfn: unknown, initialValue?: unknown): PublicType {
    this.refreshFromBackingArray();
    throw new Error("Function not implemented.");
  }
  reduceRight(callbackfn: (previousValue: PublicType, currentValue: PublicType, currentIndex: number, array: PublicType[]) => PublicType): PublicType;
  reduceRight(callbackfn: (previousValue: PublicType, currentValue: PublicType, currentIndex: number, array: PublicType[]) => PublicType, initialValue: PublicType): PublicType;
  reduceRight<U>(callbackfn: (previousValue: U, currentValue: PublicType, currentIndex: number, array: PublicType[]) => U, initialValue: U): U;
  reduceRight(callbackfn: unknown, initialValue?: unknown): PublicType {
    this.refreshFromBackingArray();
    throw new Error("Function not implemented.");
  }

  find<S extends PublicType>(predicate: (value: PublicType, index: number, obj: PublicType[]) => value is S, thisArg?: any): S | undefined;
  find(predicate: (value: PublicType, index: number, obj: PublicType[]) => unknown, thisArg?: any): PublicType | undefined;
  find(predicate: unknown, thisArg?: unknown): PublicType | undefined {
    this.refreshFromBackingArray();
    throw new Error("not yet implemented");
  }
  findIndex(predicate: (value: PublicType, index: number, obj: PublicType[]) => unknown, thisArg?: any): number {
    this.refreshFromBackingArray();
    throw new Error("not yet implemented");
  }
  fill(value: PublicType, start?: number | undefined, end?: number | undefined): this {
    this.refreshFromBackingArray();
    throw new Error("Function not implemented.");
  }
  copyWithin(target: number, start?: number | undefined, end?: number | undefined): this {
    this.refreshFromBackingArray();
    throw new Error("Function not implemented.");
  }
  entries(): IterableIterator<[number, PublicType]> {
    this.refreshFromBackingArray();
    throw new Error("Function not implemented.");
  }
  keys(): IterableIterator<number> {
    this.refreshFromBackingArray();
    throw new Error("Function not implemented.");
  }
  values(): IterableIterator<PublicType> {
    this.refreshFromBackingArray();
    throw new Error("Function not implemented.");
  }
  includes(searchElement: PublicType, fromIndex?: number | undefined): boolean {
    this.refreshFromBackingArray();
    throw new Error("Function not implemented.");
  }
  flatMap<U, This = PublicType>(callback: (this: This, value: PublicType, index: number, array: PublicType[]) => U | readonly U[], thisArg?: This | undefined): U[] {
    this.refreshFromBackingArray();
    throw new Error("Function not implemented.");
  }
  flat<A, D extends number = 1>(this: A, depth?: D | undefined): FlatArray<A, D>[] {
    //
    throw new Error("Function not implemented");
  }
  at(index: number): PublicType | undefined {
    this.refreshFromBackingArray();
    throw new Error("Function not implemented.");
  }
  findLast<S>(predicate: (value: PublicType, index: number, array: PublicType[]) => boolean, thisArg?: PublicType): S | undefined {
    this.refreshFromBackingArray();
    throw new Error("Function not implemented.");
  }
  findLastIndex(predicate: (value: PublicType, index: number, array: PublicType[]) => boolean, thisArg?: PublicType): number {
    this.refreshFromBackingArray();
    throw new Error("Function not implemented.");
  }
}
