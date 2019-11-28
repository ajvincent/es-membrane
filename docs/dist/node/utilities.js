"use strict";
const ShadowKeyMap = new WeakMap();

/**
 * Define a shadow target, so we can manipulate the proxy independently of the
 * original target.
 *
 * @argument value {Object} The original target.
 *
 * @returns {Object} A shadow target to minimally emulate the real one.
 * @private
 */
function makeShadowTarget(value) {
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

function getRealTarget(target) {
  return ShadowKeyMap.has(target) ? ShadowKeyMap.get(target) : target;
}

function returnTrue() {
  return true;
}
function returnFalse() {
  return false;
}

function NOT_IMPLEMENTED() {
  throw new Error("Not implemented!");
}

function DataDescriptor(value, writable = false, enumerable = true, configurable = true) {
  this.value = value;
  this.writable = writable;
  this.enumerable = enumerable;
  this.configurable = configurable;
}

function AccessorDescriptor(getter, setter, enumerable = true, configurable = true) {
  this.get = getter;
  this.set = setter;
  this.enumerable = enumerable;
  this.configurable = configurable;
}

function NWNCDataDescriptor(value, enumerable = true) {
  this.value = value;
  this.enumerable = enumerable;
}
NWNCDataDescriptor.prototype.writable = false;
NWNCDataDescriptor.prototype.configurable = false;
Object.freeze(NWNCDataDescriptor.prototype);

const NOT_IMPLEMENTED_DESC = new AccessorDescriptor(
  NOT_IMPLEMENTED,
  NOT_IMPLEMENTED
);

function isDataDescriptor(desc) {
  if (typeof desc === "undefined")
    return false;
  if (!("value" in desc) && !("writable" in desc))
    return false;
  return true;
}

function isAccessorDescriptor(desc) {
  if (typeof desc === "undefined") {
    return false;
  }
  if (!("get" in desc) && !("set" in desc))
    return false;
  return true;
}

function isGenericDescriptor(desc) {
  if (typeof desc === "undefined")
    return false;
  return !isAccessorDescriptor(desc) && !isDataDescriptor(desc);
}

const allTraps = Object.freeze([
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
const Primordials = Object.freeze((function() {
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
module.exports.makeShadowTarget = makeShadowTarget;
module.exports.getRealTarget = getRealTarget;
module.exports.NOT_IMPLEMENTED = NOT_IMPLEMENTED;
module.exports.NOT_IMPLEMENTED_DESC = NOT_IMPLEMENTED_DESC;
module.exports.DataDescriptor = DataDescriptor;
module.exports.AccessorDescriptor = AccessorDescriptor;
module.exports.NWNCDataDescriptor = NWNCDataDescriptor;
module.exports.isDataDescriptor = isDataDescriptor;
module.exports.isAccessorDescriptor = isAccessorDescriptor;
module.exports.isGenericDescriptor = isGenericDescriptor;
module.exports.allTraps = allTraps;
