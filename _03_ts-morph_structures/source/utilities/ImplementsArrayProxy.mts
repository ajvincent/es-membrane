/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";

import TypeWriterManager from "../decorators/TypeWriterManager.mjs";

/**
 * @param array - the values to create a proxy for.
 * @returns a proxy to a copy of the array's values.
 *
 * @remarks
 *
 * This is a brute-force attempt to build a reasonable proxy for
 * `stringOrWriterFunction[]`, where:
 * - every element has a `TypeWriterManager` backing it,
 * - you can call the normal methods of arrays (push, pop, splice, etc.)
 * - updates to the array proxy cause updates in the `TypeWriterManager[]`
 *
 * I would prefer a full-blown membrane proxy to manage this... but I'm
 * trying to build a membrane in the first place.
 */
function createImplementsArrayProxy(
  array: stringOrWriterFunction[]
): stringOrWriterFunction[]
{
  array = proxyToTargetArrayMap.get(array) ?? array;

  const internalArray = new ImplementsArrayInternal(...array);
  getManagerArrayForTypeArray(internalArray);

  const proxy = new Proxy(internalArray, ImplementsArrayHandler);
  proxyToTargetArrayMap.set(proxy, array);
  proxyToTargetArrayMap.set(internalArray, array);
  return proxy;
}

const proxyToTargetArrayMap = new WeakMap<stringOrWriterFunction[], stringOrWriterFunction[]>;

const writerArrayToManagerArray = new WeakMap<stringOrWriterFunction[], TypeWriterManager[]>;
function getManagerArrayForTypeArray(
  array: stringOrWriterFunction[]
): TypeWriterManager[]
{
  array = proxyToTargetArrayMap.get(array) ?? array;

  if (!writerArrayToManagerArray.has(array)) {
    const internalArray: TypeWriterManager[] = array.map(createManagerForType);
    writerArrayToManagerArray.set(array, internalArray);
  }

  return writerArrayToManagerArray.get(array)!;
}

function createManagerForType(
  value: stringOrWriterFunction
): TypeWriterManager {
  const manager: TypeWriterManager = new TypeWriterManager;
  manager.type = value;
  return manager;
}

function getTypeFromManager(
  manager: TypeWriterManager
): stringOrWriterFunction
{
  return manager.type ?? "";
}

const ImplementsArrayHandler: Required<ProxyHandler<ImplementsArrayInternal>> = Object.freeze({
  apply: function(
    target: ImplementsArrayInternal,
    thisArg: any,
    argArray: any[]
  ): never
  {
    void(target);
    void(thisArg);
    void(argArray);
    throw new Error("Method not implemented.");
  },

  construct: function(
    target: ImplementsArrayInternal,
    argArray: any[],
    newTarget: Function
  ): never
  {
    void(target);
    void(argArray);
    void(newTarget);
    throw new Error("Method not implemented.");
  },

  defineProperty: function(
    target: ImplementsArrayInternal,
    property: string | symbol,
    attributes: PropertyDescriptor
  ): boolean
  {
    if (typeof property === "symbol")
      return false;
    const pNum = parseFloat(property);
    if ((Math.floor(pNum) !== pNum) || (pNum < 0) || !isFinite(pNum))
      return false;

    if (attributes.get ?? attributes.set)
      return false;

    const desc = {
      ...attributes,
      value: new TypeWriterManager
    };
    desc.value.type = attributes.value as stringOrWriterFunction | undefined;

    const managerArray = getManagerArrayForTypeArray(target);
    return (
      Reflect.defineProperty(managerArray, property, desc) &&
      Reflect.defineProperty(target, property, attributes)
    );
  },

  deleteProperty: function(
    target: ImplementsArrayInternal,
    p: string | symbol
  ): boolean
  {
    const managerArray = getManagerArrayForTypeArray(target);
    return Reflect.deleteProperty(managerArray, p) && Reflect.deleteProperty(target, p);
  },

  get: function(
    target: ImplementsArrayInternal,
    p: string | symbol,
    receiver: any
  ): any
  {
    if (p === "length") {
      return Reflect.get(target, "length");
    }

    let pNum = NaN;
    if (typeof p !== "symbol")
      pNum = parseFloat(p);

    if (isNaN(pNum)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const value = Reflect.get(ImplementsArrayInternal.prototype, p, receiver);

      if (typeof value === "function") {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        return value.bind(target);
      }

      return undefined;
    }

    const manager = getManagerArrayForTypeArray(target)[pNum];
    return manager ? getTypeFromManager(manager) : undefined;
  },

  getOwnPropertyDescriptor: function(
    target: ImplementsArrayInternal,
    p: string | symbol
  ): PropertyDescriptor | undefined
  {
    if (p === "length") {
      return Reflect.getOwnPropertyDescriptor(target, "length");
    }

    if (typeof p === "symbol")
      return undefined;
    const pNum = parseFloat(p);
    if (isNaN(pNum))
      return undefined;

    const managerArray = getManagerArrayForTypeArray(target);
    const managerDesc = Reflect.getOwnPropertyDescriptor(managerArray, p);
    if (!managerDesc)
      return undefined;

    const desc: PropertyDescriptor = {
      configurable: managerDesc.configurable,
      enumerable: managerDesc.enumerable,
      writable: managerDesc.writable,
      value: (managerDesc.value as TypeWriterManager).type
    };
    Reflect.defineProperty(target, p, desc);
    return desc;
  },

  getPrototypeOf: function(
    target: ImplementsArrayInternal,
  ): object | null
  {
    void(target);
    return ImplementsArrayInternal.prototype;
  },

  has: function(
    target: ImplementsArrayInternal,
    p: string | symbol
  ): boolean
  {
    const internalArray = getManagerArrayForTypeArray(target);
    return Reflect.has(internalArray, p);
  },

  isExtensible: function(
    target: ImplementsArrayInternal,
  ): boolean
  {
    return Reflect.isExtensible(target);
  },

  ownKeys: function(
    target: ImplementsArrayInternal,
  ): ArrayLike<string | symbol>
  {
    return Reflect.ownKeys(getManagerArrayForTypeArray(target));
  },

  preventExtensions: function(
    target: ImplementsArrayInternal,
  ): boolean
  {
    return Reflect.preventExtensions(target);
  },

  set: function(
    target: ImplementsArrayInternal,
    p: string | symbol,
    newValue: stringOrWriterFunction,
    receiver: any
  ): boolean
  {
    void(receiver);
    return this.defineProperty(target, p, { value: newValue });
  },

  setPrototypeOf: function(
    target: ImplementsArrayInternal,
    v: object | null
  ): false
  {
    void(target);
    void(v);
    return false;
  },
});

class ImplementsArrayInternal
extends Array<stringOrWriterFunction>
{
  concat(
    ...items: ConcatArray<stringOrWriterFunction>[]
  ): stringOrWriterFunction[]
  {
    const fullItems = super.concat(...items);
    return createImplementsArrayProxy(fullItems);
  }

  slice(
    start?: number | undefined,
    end?: number | undefined
  ): stringOrWriterFunction[]
  {
    return createImplementsArrayProxy(super.slice(start, end));
  }

  pop(): stringOrWriterFunction | undefined
  {
    getManagerArrayForTypeArray(this).pop();
    return super.pop();
  }

  push(
    ...items: stringOrWriterFunction[]
  ): number
  {
    const managers = items.map(createManagerForType);
    getManagerArrayForTypeArray(this).push(...managers);
    return super.push(...items);
  }

  reverse(): stringOrWriterFunction[] {
    getManagerArrayForTypeArray(this).reverse();
    return super.reverse();
  }

  shift(): stringOrWriterFunction | undefined
  {
    getManagerArrayForTypeArray(this).shift();
    return super.shift();
  }

  sort(
    compareFn?: (
      (a: stringOrWriterFunction, b: stringOrWriterFunction) => number
    ) | undefined
  ): this
  {
    if (!compareFn)
      compareFn = compareStringOrWriterFunction;

    const managerArray = getManagerArrayForTypeArray(this);
    managerArray.sort((a, b) => compareFn!(a.type!, b.type!));
    super.splice(0, managerArray.length, ...managerArray.map(getTypeFromManager));
    return this;
  }

  unshift(
    ...items: stringOrWriterFunction[]
  ): number
  {
    const managerArray = items.map(createManagerForType);
    getManagerArrayForTypeArray(this).unshift(...managerArray);
    return super.unshift(...items);
  }

  fill(
    value: stringOrWriterFunction,
    start?: number | undefined,
    end?: number | undefined
  ): this
  {
    const manager = createManagerForType(value);
    getManagerArrayForTypeArray(this).fill(manager, start, end);

    return super.fill(value, start, end);
  }

  copyWithin(
    target: number,
    start?: number | undefined,
    end?: number | undefined
  ): this
  {
    const managerArray = getManagerArrayForTypeArray(this);
    managerArray.copyWithin(target, start, end);

    return super.copyWithin(target, start, end);
  }
}

function compareStringOrWriterFunction(
  a: stringOrWriterFunction | undefined,
  b: stringOrWriterFunction | undefined
): -1 | 0 | 1
{
  if ((typeof a !== "string") || (typeof b !== "string")) {
    return 0;
  }
  if (a < b)
    return -1;
  if (a > b)
    return +1;
  return 0;
}

export default createImplementsArrayProxy;
export {
  ImplementsArrayHandler,
  ImplementsArrayInternal,
  getManagerArrayForTypeArray,
  getTypeFromManager,
};
