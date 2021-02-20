/** @module source/core/sharedUtilities */

const ShadowKeyMap = new WeakMap();

export const DeadProxyKey = Symbol("dead map entry");

/**
 * Define a shadow target, so we can manipulate the proxy independently of the
 * original target.
 *
 * @argument value {Object} The original target.
 *
 * @returns {Object} A shadow target to minimally emulate the real one.
 */
export function makeShadowTarget(value) {
  "use strict";
  var rv;
  if (Array.isArray(value))
    rv = [];
  else if (typeof value == "object")
    rv = {};
  else if (typeof value == "function")
    rv = function() {};
  else
    throw new Error("Unknown value for makeShadowTarget");
  ShadowKeyMap.set(rv, value);
  return rv;
}

/**
 * Get the real target for a given shadow object.
 * @param target
 */
export function getRealTarget(target) {
  return ShadowKeyMap.has(target) ? ShadowKeyMap.get(target) : target;
}

export function returnFalse() {
  return false;
}

export class DataDescriptor {
  /**
   * A data descriptor.
   *
   * @param {any} value
   * @param {Boolean} [writable]
   * @param {Boolean} [enumerable]
   * @param {Boolean} [configurable]
   */
  constructor(value, writable = false, enumerable = true, configurable = true) {
    this.value = value;
    this.writable = writable;
    this.enumerable = enumerable;
    this.configurable = configurable;
  }
}

export class AccessorDescriptor {
  /**
   *
   * @param {Function} getter
   * @param {Function} [setter]
   * @param {Boolean}  [enumerable]
   * @param {Boolean}  [configurable]
   */
  constructor(getter, setter, enumerable = true, configurable = true) {
    this.get = getter;
    this.set = setter;
    this.enumerable = enumerable;
    this.configurable = configurable;
  }
}

export class NWNCDataDescriptor {
  /**
   * A non-writable, non-configurable data descriptor.
   *
   * @param {any} value
   * @param {Boolean} [writable]
   */
  constructor(value, enumerable = true) {
    this.value = value;
    this.enumerable = enumerable;
  }
}
NWNCDataDescriptor.prototype.writable = false;
NWNCDataDescriptor.prototype.configurable = false;
Object.freeze(NWNCDataDescriptor.prototype);

/**
 * Determine if a value is legally a data descriptor.
 * @param {Object} desc
 *
 * @returns {Boolean} true if it is a data descriptor.
 */
export function isDataDescriptor(desc) {
  if (typeof desc === "undefined")
    return false;
  if (!("value" in desc) && !("writable" in desc))
    return false;
  return true;
}

/**
 * Determine if a value is legally an accessor descriptor.
 * @param {Object} desc
 *
 * @returns {Boolean} true if it is an accessor descriptor.
 */
export function isAccessorDescriptor(desc) {
  if (typeof desc === "undefined") {
    return false;
  }
  if (!("get" in desc) && !("set" in desc))
    return false;
  return true;
}

export const allTraps = Object.freeze([
  "getPrototypeOf",
  "setPrototypeOf",
  "isExtensible",
  "preventExtensions",
  "getOwnPropertyDescriptor",
  "defineProperty",
  "has",
  "get",
  "set",
  "deleteProperty",
  "ownKeys",
  "apply",
  "construct"
]);

/* XXX ajvincent This is supposed to be a complete list of top-level globals.
   Copied from https://github.com/tc39/proposal-realms/blob/master/shim/src/stdlib.js
   on September 20, 2017.
*/
export const Primordials = Object.freeze((function() {
const p = [
  Array,
  ArrayBuffer,
  Boolean,
  DataView,
  Date,
  decodeURI,
  decodeURIComponent,
  encodeURI,
  encodeURIComponent,
  Error,
  eval,
  EvalError,
  Float32Array,
  Float64Array,
  Function,
  Int8Array,
  Int16Array,
  Int32Array,
  isFinite,
  isNaN,
  JSON,
  Map,
  Math,
  Number,
  Object,
  parseFloat,
  parseInt,
  Promise,
  Proxy,
  RangeError,
  ReferenceError,
  Reflect,
  RegExp,
  Set,
  String,
  Symbol,
  SyntaxError,
  TypeError,
  Uint8Array,
  Uint8ClampedArray,
  Uint16Array,
  Uint32Array,
  URIError,
  WeakMap,
  WeakSet,
];

return p.concat(p.filter((i) => {
    if (!i.name)
      return false;
    let j = i.name[0];
    return j.toUpperCase() === j;
  }).map((k) => k.prototype));
})());

/**
 *
 * @param value
 *
 * @return "primitive" | "function" | "object"
 */
export function valueType(value) {
  if (value === null)
    return "primitive";
  const type = typeof value;
  if ((type != "function") && (type != "object"))
    return "primitive";
  return type;
}

export function makeRevokeDeleteRefs(parts, mapping, field) {
  let oldRevoke = parts.revoke;
  if (!oldRevoke)
    return;

  // necessary: in OverriddenProxyParts, revoke is inherited and read-only.
  Reflect.defineProperty(parts, "revoke", new DataDescriptor(function() {
    oldRevoke.apply(parts);
    mapping.remove(field);
  }, true));
}

export const NOT_YET_DETERMINED = {};
Object.defineProperty(
  NOT_YET_DETERMINED,
  "not_yet_determined",
  new NWNCDataDescriptor(true)
);
