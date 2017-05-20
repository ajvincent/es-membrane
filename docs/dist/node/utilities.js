"use strict"
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
module.exports.NOT_IMPLEMENTED = NOT_IMPLEMENTED;
module.exports.NOT_IMPLEMENTED_DESC = NOT_IMPLEMENTED_DESC;
module.exports.DataDescriptor = DataDescriptor;
module.exports.AccessorDescriptor = AccessorDescriptor;
module.exports.isDataDescriptor = isDataDescriptor;
module.exports.isAccessorDescriptor = isAccessorDescriptor;
module.exports.isGenericDescriptor = isGenericDescriptor;
module.exports.allTraps = allTraps;
