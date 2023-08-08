/* eslint-disable @typescript-eslint/no-explicit-any */

import NotImplementedProxyHandler from "./NotImplementedHandler.mjs";
import type {
  ArrayWithoutIndices,
  DataDescriptor,
  PrivateAndPublicDictionary,
  UpdateSymbolTracking,
} from "./types/export-types.mjs";

interface PrivateAndPublicArrayDictionaryIfc<
  PrivateType extends object,
  PublicType extends object,
>
{
  privateArray: PrivateType[];
  readonly wrappedPublicArray: PublicType[];
  readonly shadowTargetArray: PublicTypeArrayShadowWrapper<PrivateType, PublicType>;
  readonly proxyArray: PublicTypeArrayShadowWrapper<PrivateType, PublicType>;
  revoke(): void;
}

class PrivateAndPublicArrayDictionary<
  PrivateType extends object,
  PublicType extends object,
>
implements PrivateAndPublicArrayDictionaryIfc<PrivateType, PublicType>, UpdateSymbolTracking
{
  readonly privateArray: PrivateType[];
  readonly wrappedPublicArray: PublicType[];
  readonly shadowTargetArray: PublicTypeArrayShadowWrapper<PrivateType, PublicType>;
  readonly proxyArray: PublicTypeArrayShadowWrapper<PrivateType, PublicType>;
  readonly revoke: () => void;
  #lastUpdateSymbol: symbol;

  constructor(
    dictionary: Omit<
      PrivateAndPublicArrayDictionaryIfc<PrivateType, PublicType>,
      "markUpdated" | "lastUpdateSymbol"
    >,
    updateSymbol: symbol
  )
  {
    this.privateArray = dictionary.privateArray;
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

interface PrivatePublicContextBase<
  PrivateType extends object,
  PublicType extends object,
>
{
  readonly buildPublic: (privateValue: PrivateType) => PublicType,
  readonly buildPrivate: (publicValue: PublicType) => PrivateType,
}

interface PrivatePublicContext<
  PrivateType extends object,
  PublicType extends object,
> extends PrivatePublicContextBase<PrivateType, PublicType>
{
  readonly objectOneToOneMap: WeakMap<
    PrivateType | PublicType,
    PrivateAndPublicDictionary<PrivateType, PublicType>
  >;
  readonly arrayOneToOneMap: WeakMap<
    PublicType[] | PrivateType[],
    PrivateAndPublicArrayDictionaryIfc<PrivateType, PublicType> & UpdateSymbolTracking
  >;
}

export class InternalArrayProxyHandler<
  PrivateType extends object,
  PublicType extends object,
>
extends NotImplementedProxyHandler
implements Required<ProxyHandler<PublicTypeArrayShadowWrapper<PrivateType, PublicType>>>
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

  readonly #context: PrivatePublicContext<PrivateType, PublicType>;
  //readonly #methodHandler: ArrayMethodProxyHandler<PrivateType, PublicType>;

  constructor(
    baseContext: PrivatePublicContextBase<PrivateType, PublicType>,
  )
  {
    super()
    this.#context = {
      ...baseContext,

      objectOneToOneMap: new WeakMap,
      arrayOneToOneMap: new WeakMap,
    };

    //this.#methodHandler = new ArrayMethodProxyHandler<PrivateType, PublicType>;
  }

  getProxy(
    privateValues: PrivateType[]
  ): PublicTypeArrayShadowWrapper<PrivateType, PublicType>
  {
    return this.#context.arrayOneToOneMap.get(privateValues)?.proxyArray ??
      this.#createArrayProxy(privateValues);
  }

  revokeProxy(
    values: PublicType[] | PrivateType[]
  ): void
  {
    this.#context.arrayOneToOneMap.get(values)?.revoke();
  }

  #createArrayProxy(
    privateArray: PrivateType[]
  ): PublicTypeArrayShadowWrapper<PrivateType, PublicType>
  {
    const wrappedPublicArray = privateArray.map(privateValue => this.requirePublic(privateValue));

    const shadowTargetArray = new PublicTypeArrayShadowWrapper<PrivateType, PublicType>(
      this,
      {
        privateArray,
        wrappedPublicArray,
      }
    );
    shadowTargetArray satisfies PublicType[];

    const {
      proxy: proxyArray,
      revoke
    } = Proxy.revocable<
      PublicTypeArrayShadowWrapper<PrivateType, PublicType>
    >(shadowTargetArray, this);

    const arrayDictionary = new PrivateAndPublicArrayDictionary<PrivateType, PublicType>(
      {
        privateArray,
        wrappedPublicArray,
        shadowTargetArray,
        proxyArray,
        revoke,
      },
      Symbol()
    );

    this.#context.arrayOneToOneMap.set(privateArray, arrayDictionary);
    this.#context.arrayOneToOneMap.set(wrappedPublicArray, arrayDictionary);
    this.#context.arrayOneToOneMap.set(shadowTargetArray, arrayDictionary);
    this.#context.arrayOneToOneMap.set(proxyArray, arrayDictionary);

    return proxyArray;
  }

  requirePublic(privateValue: PrivateType): PublicType
  {
    if (!this.#context.objectOneToOneMap.has(privateValue)) {
      const publicValue = this.#context.buildPublic(privateValue)
      const privateAndPublic: PrivateAndPublicDictionary<PrivateType, PublicType> = {
        privateValue,
        publicValue
      };

      this.#context.objectOneToOneMap.set(privateValue, privateAndPublic);
      this.#context.objectOneToOneMap.set(publicValue, privateAndPublic);

      return publicValue;
    }

    return this.#context.objectOneToOneMap.get(privateValue)!.publicValue;
  }

  requirePrivate(publicValue: PublicType): PrivateType
  {
    if (!this.#context.objectOneToOneMap.has(publicValue)) {
      const privateValue = this.#context.buildPrivate(publicValue);

      const privateAndPublic: PrivateAndPublicDictionary<PrivateType, PublicType> = {
        privateValue,
        publicValue
      };

      this.#context.objectOneToOneMap.set(privateValue, privateAndPublic);
      this.#context.objectOneToOneMap.set(publicValue, privateAndPublic);

      return privateValue;
    }

    return this.#context.objectOneToOneMap.get(publicValue)!.privateValue;
  }

  // #endregion proxy management

  // #region ProxyHandler

  defineProperty(
    shadowTargetArray: PublicTypeArrayShadowWrapper<PrivateType, PublicType>,
    property: string | symbol,
    publicDesc: PropertyDescriptor
  ): boolean
  {
    const context = this.#context.arrayOneToOneMap.get(shadowTargetArray)!;

    const numericIndex = property !== "length" ?
      InternalArrayProxyHandler.getNumericIndex(property) : 1;

    if (isNaN(numericIndex) && property !== "length")
      return false;

    if (publicDesc.get ?? publicDesc.set)
      return false;

    let value: undefined | number | PrivateType = undefined;
    if (property === "length")
      value = publicDesc.value as number;
    else if (publicDesc.value !== undefined) {
      value = this.requirePrivate(publicDesc.value as PublicType);
    }

    const privateDesc: DataDescriptor = {
      ...publicDesc,
      value
    };

    const rv = Reflect.defineProperty(context.privateArray, property, privateDesc);
    if (rv) {
      context.markUpdated();
    }

    return rv;
  }

  deleteProperty(
    shadowTargetArray: PublicTypeArrayShadowWrapper<PrivateType, PublicType>,
    property: string | symbol
  ): boolean
  {
    const numericIndex = InternalArrayProxyHandler.getNumericIndex(property);
    if (isNaN(numericIndex))
      return false;

    const { privateArray } = this.#context.arrayOneToOneMap.get(shadowTargetArray)!;

    const rv = (
      Reflect.deleteProperty(privateArray, property) &&
      Reflect.deleteProperty(shadowTargetArray, property)
    );
    if (rv) {
      shadowTargetArray.refreshFromPrivateArray();
    }
    return rv;
  }

  get(
    shadowTargetArray: PublicTypeArrayShadowWrapper<PrivateType, PublicType>,
    property: string | symbol,
    receiver: any
  ): any
  {
    void(receiver);

    const numericIndex = InternalArrayProxyHandler.getNumericIndex(property);
    if (!isNaN(numericIndex)) {
      return this.getOwnPropertyDescriptor(shadowTargetArray, property)?.value;
    }

    if (!Reflect.has(Array.prototype, property))
      return undefined;

    const propertyName = property as keyof ArrayWithoutIndices;
    if (propertyName === "length") {
      shadowTargetArray.refreshFromPrivateArray();
      return shadowTargetArray.length;
    }

    if (propertyName === Symbol.unscopables) {
      return shadowTargetArray[propertyName];
    }

    const boundDesc = this.#bindMethod(shadowTargetArray, propertyName);
    return boundDesc.value;
  }

  #bindMethod(
    shadowTargetArray: PublicTypeArrayShadowWrapper<PrivateType, PublicType>,
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
    shadowTargetArray: PublicTypeArrayShadowWrapper<PrivateType, PublicType>,
    property: string | symbol
  ): PropertyDescriptor | undefined
  {
    const numericIndex = InternalArrayProxyHandler.getNumericIndex(property);
    if (isNaN(numericIndex))
      return undefined;

    shadowTargetArray.refreshFromPrivateArray();

    const { privateArray } = this.#context.arrayOneToOneMap.get(shadowTargetArray)!;
    const privateDesc = Reflect.getOwnPropertyDescriptor(
      privateArray, property
    ) as DataDescriptor | undefined;
    if (!privateDesc)
      return undefined;

    const shadowDesc = {
      ...privateDesc,
      value: this.requirePublic(privateDesc.value as PrivateType)
    };
    if (!Reflect.defineProperty(shadowTargetArray, property, shadowDesc))
      return undefined;

    return shadowDesc;
  }

  getPrototypeOf(
    shadowTargetArray: PublicTypeArrayShadowWrapper<PrivateType, PublicType>
  ): object | null
  {
    return Reflect.getPrototypeOf(shadowTargetArray);
  }

  has(
    shadowTargetArray: PublicTypeArrayShadowWrapper<PrivateType, PublicType>,
    property: string | symbol
  ): boolean
  {
    const numericIndex = InternalArrayProxyHandler.getNumericIndex(property);
    if (!isNaN(numericIndex)) {
      shadowTargetArray.refreshFromPrivateArray();

      const { privateArray } = this.#context.arrayOneToOneMap.get(shadowTargetArray)!;
      const result = Reflect.has(privateArray, property);
      if (result) {
        const privateDesc = Reflect.getOwnPropertyDescriptor(
          privateArray, property
        ) as DataDescriptor;

        const publicDesc = {
          ...privateDesc,
          value: this.requirePublic(privateDesc.value as PrivateType)
        };

        return Reflect.defineProperty(shadowTargetArray, property, publicDesc);
      }

      return false;
    }

    return Reflect.has(shadowTargetArray, property);
  }

  isExtensible(
    shadowTargetArray: PublicTypeArrayShadowWrapper<PrivateType, PublicType>
  ): boolean
  {
    return Reflect.isExtensible(shadowTargetArray);
  }

  ownKeys(
    shadowTargetArray: PublicTypeArrayShadowWrapper<PrivateType, PublicType>
  ): ArrayLike<string | symbol>
  {
    const { privateArray } = this.#context.arrayOneToOneMap.get(shadowTargetArray)!;
    return Reflect.ownKeys(privateArray);
  }

  preventExtensions(
    shadowTargetArray: PublicTypeArrayShadowWrapper<PrivateType, PublicType>
  ): boolean
  {
    void(shadowTargetArray);
    return false;
  }

  set(
    shadowTargetArray: PublicTypeArrayShadowWrapper<PrivateType, PublicType>,
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
    shadowTargetArray: PublicTypeArrayShadowWrapper<PrivateType, PublicType>,
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
  PrivateType extends object,
  PublicType extends object
> extends Array<PublicType>
{
  readonly #proxyHandler: InternalArrayProxyHandler<PrivateType, PublicType>
  readonly #privateArray: PrivateType[];

  #updateSymbolTracking: UpdateSymbolTracking | undefined;

  #lastUpdateSymbol = Symbol();

  constructor(
    proxyHandler: InternalArrayProxyHandler<PrivateType, PublicType>,
    items: Pick<
      PrivateAndPublicArrayDictionaryIfc<PrivateType, PublicType>,
      "privateArray" | "wrappedPublicArray"
    >
  )
  {
    super(...items.wrappedPublicArray);
    this.#proxyHandler = proxyHandler;
    this.#privateArray = items.privateArray;
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

  refreshFromPrivateArray(): void
  {
    if (!this.#updateSymbolTracking) {
      throw new Error("We should be tracking now");
    }
    if (this.#lastUpdateSymbol === this.#updateSymbolTracking.lastUpdateSymbol)
      return;

    Array.prototype.splice.call(this, 0, this.length, ...this.#privateArray.map(this.#getPublicValue))
    this.#lastUpdateSymbol = this.#updateSymbolTracking.lastUpdateSymbol;
  }

  #markUpdated(): void
  {
    if (!this.#updateSymbolTracking) {
      throw new Error("We should be tracking now");
    }
    this.#lastUpdateSymbol = this.#updateSymbolTracking.markUpdated();
  }

  readonly #getPublicValue = (privateValue: PrivateType): PublicType =>
  {
    return this.#proxyHandler.requirePublic(privateValue);
  }

  readonly #getPrivateValue = (publicValue: PublicType): PrivateType =>
  {
    return this.#proxyHandler.requirePrivate(publicValue);
  }

  [Symbol.iterator](): IterableIterator<PublicType>
  {
    throw new Error("Function not implemented.");
  }

  get length(): number {
    this.refreshFromPrivateArray();
    return super.length;
  }

  pop(): PublicType | undefined {
    this.refreshFromPrivateArray();
    return super.pop();
  }

  push(...publicItems: PublicType[]): number {
    this.refreshFromPrivateArray();
    const privateItems = publicItems.map(this.#getPrivateValue);
    this.#privateArray.push(...privateItems);
    const count = super.push(...publicItems);
    this.#markUpdated();
    return count;
  }

  concat(
    ...items: ConcatArray<PublicType>[]
  ): PublicTypeArrayShadowWrapper<PrivateType, PublicType>
  {
    this.refreshFromPrivateArray();
    const publicItems: PublicType[] = super.concat(...items);

    const newPrivateArray: PrivateType[] = publicItems.map(this.#getPrivateValue);
    return this.#proxyHandler.getProxy(newPrivateArray);
  }

  join(separator?: string | undefined): string
  {
    this.refreshFromPrivateArray();
    return super.join(separator);
  }

  reverse(): PublicType[] {
    this.refreshFromPrivateArray();
    return super.reverse();
  }

  shift(): PublicType | undefined
  {
    this.refreshFromPrivateArray();
    if (this.length === 0)
      return undefined;

    const rv = super.shift();
    this.#privateArray.shift();
    this.#markUpdated();

    return rv;
  }

  slice(
    start?: number | undefined,
    end?: number | undefined
  ): PublicTypeArrayShadowWrapper<PrivateType, PublicType>
  {
    const newPrivateArray: PrivateType[] = this.#privateArray.slice(start, end);
    return this.#proxyHandler.getProxy(newPrivateArray);
  }

  sort(
    compareFn?: (
      (a: PublicType, b: PublicType) => number) | undefined
    ): this
  {
    this.refreshFromPrivateArray();
    throw new Error("Function not implemented.");
  }
  splice(start: number, deleteCount?: number | undefined): PublicType[] {
    this.refreshFromPrivateArray();
    throw new Error("Function not implemented.");
  }
  unshift(...items: PublicType[]): number {
    this.refreshFromPrivateArray();
    throw new Error("Function not implemented.");
  }
  indexOf(searchElement: PublicType, fromIndex?: number | undefined): number {
    this.refreshFromPrivateArray();
    throw new Error("Function not implemented.");
  }
  lastIndexOf(searchElement: PublicType, fromIndex?: number | undefined): number {
    this.refreshFromPrivateArray();
    throw new Error("Function not implemented.");
  }
  every<S extends PublicType>(predicate: (value: PublicType, index: number, array: PublicType[]) => value is S, thisArg?: any): this is S[];
  every(predicate: (value: PublicType, index: number, array: PublicType[]) => unknown, thisArg?: any): boolean;
  every(predicate: unknown, thisArg?: unknown): boolean {
    this.refreshFromPrivateArray();
    throw new Error("Function not implemented")
  }
  some(predicate: (value: PublicType, index: number, array: PublicType[]) => boolean, thisArg?: PublicType): boolean {
    this.refreshFromPrivateArray();
    throw new Error("Function not implemented.");
  }
  forEach(callbackfn: (value: PublicType, index: number, array: PublicType[]) => void, thisArg?: PublicType): void {
    this.refreshFromPrivateArray();
    throw new Error("Function not implemented.");
  }
  map<U>(callbackfn: (value: PublicType, index: number, array: PublicType[]) => U, thisArg?: PublicType): U[] {
    this.refreshFromPrivateArray();
    throw new Error("Function not implemented.");
  }
  filter(predicate: (value: PublicType, index: number, array: PublicType[]) => unknown, thisArg?: any): PublicType[];
  filter(predicate: unknown, thisArg?: unknown): PublicType[] {
    this.refreshFromPrivateArray();
    throw new Error("Function not implemented");
  }
  reduce(callbackfn: (previousValue: PublicType, currentValue: PublicType, currentIndex: number, array: PublicType[]) => PublicType): PublicType;
  reduce(callbackfn: (previousValue: PublicType, currentValue: PublicType, currentIndex: number, array: PublicType[]) => PublicType, initialValue: PublicType): PublicType;
  reduce<U>(callbackfn: (previousValue: U, currentValue: PublicType, currentIndex: number, array: PublicType[]) => U, initialValue: U): U;
  reduce(callbackfn: unknown, initialValue?: unknown): PublicType {
    this.refreshFromPrivateArray();
    throw new Error("Function not implemented.");
  }
  reduceRight(callbackfn: (previousValue: PublicType, currentValue: PublicType, currentIndex: number, array: PublicType[]) => PublicType): PublicType;
  reduceRight(callbackfn: (previousValue: PublicType, currentValue: PublicType, currentIndex: number, array: PublicType[]) => PublicType, initialValue: PublicType): PublicType;
  reduceRight<U>(callbackfn: (previousValue: U, currentValue: PublicType, currentIndex: number, array: PublicType[]) => U, initialValue: U): U;
  reduceRight(callbackfn: unknown, initialValue?: unknown): PublicType {
    this.refreshFromPrivateArray();
    throw new Error("Function not implemented.");
  }

  find<S extends PublicType>(predicate: (value: PublicType, index: number, obj: PublicType[]) => value is S, thisArg?: any): S | undefined;
  find(predicate: (value: PublicType, index: number, obj: PublicType[]) => unknown, thisArg?: any): PublicType | undefined;
  find(predicate: unknown, thisArg?: unknown): PublicType | undefined {
    this.refreshFromPrivateArray();
    throw new Error("not yet implemented");
  }
  findIndex(predicate: (value: PublicType, index: number, obj: PublicType[]) => unknown, thisArg?: any): number {
    this.refreshFromPrivateArray();
    throw new Error("not yet implemented");
  }
  fill(value: PublicType, start?: number | undefined, end?: number | undefined): this {
    this.refreshFromPrivateArray();
    throw new Error("Function not implemented.");
  }
  copyWithin(target: number, start?: number | undefined, end?: number | undefined): this {
    this.refreshFromPrivateArray();
    throw new Error("Function not implemented.");
  }
  entries(): IterableIterator<[number, PublicType]> {
    this.refreshFromPrivateArray();
    throw new Error("Function not implemented.");
  }
  keys(): IterableIterator<number> {
    this.refreshFromPrivateArray();
    throw new Error("Function not implemented.");
  }
  values(): IterableIterator<PublicType> {
    this.refreshFromPrivateArray();
    throw new Error("Function not implemented.");
  }
  includes(searchElement: PublicType, fromIndex?: number | undefined): boolean {
    this.refreshFromPrivateArray();
    throw new Error("Function not implemented.");
  }
  flatMap<U, This = PublicType>(callback: (this: This, value: PublicType, index: number, array: PublicType[]) => U | readonly U[], thisArg?: This | undefined): U[] {
    this.refreshFromPrivateArray();
    throw new Error("Function not implemented.");
  }
  flat<A, D extends number = 1>(this: A, depth?: D | undefined): FlatArray<A, D>[] {
    //
    throw new Error("Function not implemented");
  }
  at(index: number): PublicType | undefined {
    this.refreshFromPrivateArray();
    throw new Error("Function not implemented.");
  }
  findLast<S>(predicate: (value: PublicType, index: number, array: PublicType[]) => boolean, thisArg?: PublicType): S | undefined {
    this.refreshFromPrivateArray();
    throw new Error("Function not implemented.");
  }
  findLastIndex(predicate: (value: PublicType, index: number, array: PublicType[]) => boolean, thisArg?: PublicType): number {
    this.refreshFromPrivateArray();
    throw new Error("Function not implemented.");
  }
}
