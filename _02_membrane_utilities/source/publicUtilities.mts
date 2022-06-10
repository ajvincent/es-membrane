export type propertyKey = string | symbol;

export function returnTrue() : true
{
  return true;
}
export function returnFalse() : false
{
  return false;
}

export function NOT_IMPLEMENTED() : never
{
  throw new Error("Not implemented!");
}

export const PROXYHANDLER_TRAPS = Object.freeze([
  "apply",
  "construct",
  "defineProperty",
  "deleteProperty",
  "get",
  "getOwnPropertyDescriptor",
  "getPrototypeOf",
  "has",
  "isExtensible",
  "ownKeys",
  "preventExtensions",
  "set",
  "setPrototypeOf",
]);

// #region descriptors

/**
 * {@link https://tc39.es/ecma262/#sec-property-descriptor-specification-type}
 */
export class DataDescriptor<T>
{
  value: T;
  writable: boolean;
  enumerable: boolean;
  configurable: boolean;
  constructor(value: T, writable = false, enumerable = true, configurable = true)
  {
    this.value = value;
    this.writable = writable;
    this.enumerable = enumerable;
    this.configurable = configurable;
  }

  /**
   * Check if a descriptor is a DataDescriptor.
   * @param desc - The potential descriptor
   * @returns True if desc is a DataDescriptor.
   * {@link https://tc39.es/ecma262/#sec-isdatadescriptor}
   */
  static is(desc: PropertyDescriptor | undefined) : boolean
  {
    if (!desc)
      return false;
    if (!("value" in desc) && !("writable" in desc))
      return false;
    return true;
  }
}
Object.freeze(DataDescriptor);
Object.freeze(DataDescriptor.prototype);

/**
 * {@link https://tc39.es/ecma262/#sec-property-descriptor-specification-type}
 */
export class AccessorDescriptor<T>
{
  get: () => T;
  set: (value: T) => void;
  enumerable;
  configurable;
  constructor(
    getter: () => T,
    setter: (value: T) => void,
    enumerable = true,
    configurable = true
  )
  {
    this.get = getter;
    this.set = setter;
    this.enumerable = enumerable;
    this.configurable = configurable;
  }

  /**
   * Check if a descriptor is an AccessorDescriptor.
   * @param desc - The potential descriptor
   * @returns True if desc is an AccessorDescriptor.
   * {@link https://tc39.es/ecma262/#sec-isaccessordescriptor}
   */
  static is(desc: PropertyDescriptor | undefined) : boolean
  {
    if (!desc) {
      return false;
    }
    if (!("get" in desc) && !("set" in desc))
      return false;
    return true;
  }

  static NOT_IMPLEMENTED: Readonly<AccessorDescriptor<never>> = Object.freeze(new AccessorDescriptor(
    NOT_IMPLEMENTED,
    NOT_IMPLEMENTED
  ));
}
Object.freeze(AccessorDescriptor);
Object.freeze(AccessorDescriptor.prototype);

/**
 * {@link https://tc39.es/ecma262/#sec-property-descriptor-specification-type}
 */
export class NWNCDataDescriptor<T> extends DataDescriptor<T>
{
  constructor(value: T, enumerable = true)
  {
    super(value, false, enumerable, false);
  }

  static is(desc: PropertyDescriptor | undefined) : boolean
  {
    if (!desc || !super.is(desc))
      return false;
    return !desc.writable && !desc.configurable;
  }
}
Object.freeze(NWNCDataDescriptor);
Object.freeze(NWNCDataDescriptor.prototype);

/**
 * Check if a value is a generic descriptor.
 * @param desc - The potential descriptor.
 * @returns True if the value is a generic descriptor.
 * {@link https://tc39.es/ecma262/#sec-isgenericdescriptor}
 */
export function isGenericDescriptor(desc: PropertyDescriptor | undefined) : boolean
{
  if (!desc)
    return false;
  return !AccessorDescriptor.is(desc) && !DataDescriptor.is(desc);
}

// #endregion descriptors
