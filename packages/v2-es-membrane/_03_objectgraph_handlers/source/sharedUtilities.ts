export function returnTrue(): true {
  return true;
}
export function returnFalse(): false {
  return false;
}

export function NOT_IMPLEMENTED(): never {
  throw new Error("Not implemented!");
}

export function valueType(
  value: unknown
): "object" | "function" | "primitive"
{
  if (value === null)
    return "primitive";
  const type = typeof value;
  if ((type != "function") && (type != "object"))
    return "primitive";
  return type;
}

/**
 * We don't need to worry about property descriptors being from a different realm.
 * (Though we may need to worry about which realm's Reflect we use.)
 * @internal
 */
export class DataDescriptor<T>
implements Required<Pick<PropertyDescriptor, "configurable" | "enumerable" | "value" | "writable">>
{
  configurable: boolean;
  enumerable: boolean;
  value: T;
  writable: boolean;

  constructor(
    value: T,
    writable: boolean,
    enumerable: boolean,
    configurable: boolean
  )
  {
    this.value = value;
    this.writable = writable;
    this.enumerable = enumerable;
    this.configurable = configurable;
  }
}

export class AccessorDescriptor<T>
  implements Required<Pick<PropertyDescriptor, "configurable" | "enumerable">>,
  Pick<PropertyDescriptor,  "get" | "set">
{
  get?: (() => T);
  set?: (v: T) => void;
  enumerable: boolean;
  configurable: boolean;

  constructor(
    get: (() => T) | undefined,
    set: ((value: T) => void) | undefined,
    enumerable: boolean,
    configurable: boolean
  )
  {
    this.get = get;
    this.set = set;
    this.enumerable = enumerable;
    this.configurable = configurable;
  }
}

export class NWNCDataDescriptor<T> {
  value: T;
  enumerable: boolean;

  readonly configurable = false;
  readonly writable = false;

  constructor(value: T, enumerable: boolean) {
    this.value = value;
    this.enumerable = enumerable;
  }
}
Object.freeze(NWNCDataDescriptor.prototype);

export function isDataDescriptor(desc: object): desc is typeof DataDescriptor {
  if (typeof desc === "undefined")
    return false;
  if (!("value" in desc) && !("writable" in desc))
    return false;
  return true;
}

export function isAccessorDescriptor(desc: object): desc is typeof AccessorDescriptor {
  if (typeof desc === "undefined") {
    return false;
  }
  if (!("get" in desc) && !("set" in desc))
    return false;
  return true;
}

export function isGenericDescriptor(desc: object): desc is PropertyDescriptor {
  if (typeof desc === "undefined")
    return false;
  return !isAccessorDescriptor(desc) && !isDataDescriptor(desc);
}

export const allTraps = Object.freeze([
  "apply",
  "construct",
  "defineProperty",
  "deleteProperty",
  "get",
  "getPrototypeOf",
  "getOwnPropertyDescriptor",
  "isExtensible",
  "has",
  "ownKeys",
  "preventExtensions",
  "set",
  "setPrototypeOf",
]);
