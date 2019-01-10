var DimensionalMap = (function() {
"use strict";
function buildKeyMap(obj, keySequence) {
  if ((obj instanceof WeakMap) || (obj instanceof Map))
    return obj;
  const rv = new Map();
  keySequence.forEach((key) => rv.set(key, obj[key]));
  return rv;
}

function validateWeakKey(keyMap, keySequence) {
  keySequence.forEach(function(key, index) {
    const part = keyMap.get(key);
    if ((typeof part !== "object") && (typeof part !== "function"))
      throw new Error(
        `DimensionalMap key ${key} at objectKeys index ${index} ` +
        `must be an object, got the ${typeof part} ${part}`
      );
  });
}

function BootstrapMap(mapCtor, keySequence) {
  this.mapCtor = mapCtor;
  this.validateSequence = keySequence.slice(0); // this deliberately keeps the lastKeyPart
  this.keySequence = keySequence.slice(0);
  this.lastKeyPart = this.keySequence.pop();
  this.root = new mapCtor();

  Object.freeze(this.validateSequence);
  Object.freeze(this.keySequence);
}

BootstrapMap.prototype.has = function(keyObj) {
  const keyMap = buildKeyMap(keyObj, this.validateSequence);
  if (this.mapCtor === WeakMap)
    validateWeakKey(keyMap, this.validateSequence);
  let map = this.root;

  const rv = this.keySequence.every(function(key) {
    const keyPart = keyMap.get(key);
    const found = map.has(keyPart);
    if (found)
      map = map.get(keyPart);
    return found;
  });
  return rv && map.has(keyMap.get(this.lastKeyPart));
};

BootstrapMap.prototype.get = function(keyObj) {
  const keyMap = buildKeyMap(keyObj, this.validateSequence);
  if (this.mapCtor === WeakMap)
    validateWeakKey(keyMap, this.validateSequence);
  let map = this.root;
  
  const rv = this.keySequence.every(function(key) {
    const keyPart = keyMap.get(key);
    const found = map.has(keyPart);
    if (found)
      map = map.get(keyPart);
    return found;
  });

  return rv ? map.get(keyMap.get(this.lastKeyPart)) : undefined;
};

BootstrapMap.prototype.delete = function(keyObj) {
  const keyMap = buildKeyMap(keyObj, this.validateSequence);
  if (!this.has(keyMap))
    return false;
  // no need to call validateWeakKey, this.has already did that...

  const maps = [this.root];
  this.keySequence.forEach(function(key) {
    const leadMap = maps[0];
    maps.unshift(leadMap.get(keyMap.get(key)));
  });

  const keySequence = this.validateSequence.slice(0).reverse();
  keySequence.every(function(key) {
    const leadMap = maps.shift();
    leadMap.delete(keyMap.get(key));
    return ((this.mapCtor === Map) && (leadMap.size === 0));
  }, this);
  
  return true;
};

BootstrapMap.prototype.set = function(keyObj, value) {
  const keyMap = buildKeyMap(keyObj, this.validateSequence);
  if (this.mapCtor === WeakMap)
    validateWeakKey(keyMap, this.validateSequence);
  let map = this.root;

  this.keySequence.every(function(key) {
    const keyPart = keyMap.get(key);
    if (!map.has(keyPart))
      map.set(keyPart, new this.mapCtor());
    map = map.get(keyPart);
  }, this);

  map.set(keyMap.get(this.lastKeyPart), value);
  return this;
};

function DimensionalMap(objectKeys = [], strongKeys = []) {
  if (!Array.isArray(objectKeys))
    throw new Error("objectKeys must be an array");
  if (!Array.isArray(strongKeys))
    throw new Error("strongKeys must be an array");
  {
    const keySet = new Set(objectKeys.concat(strongKeys));
    if (keySet.size !== objectKeys.length + strongKeys.length)
      throw new Error("objectKeys and strongKeys contain some non-unique elements");
  }

  if (objectKeys.length === 0)
    return new BootstrapMap(Map, strongKeys);
  if (strongKeys.length === 0)
    return new BootstrapMap(WeakMap, objectKeys);

  this.root = new BootstrapMap(WeakMap, objectKeys);
  this.strongKeys = strongKeys.slice(0);
}

DimensionalMap.prototype.has = function(keyMap) {
  const firstMap = this.root.get(keyMap);
  return firstMap ? firstMap.has(keyMap) : false;
};

DimensionalMap.prototype.get = function(keyMap) {
  const firstMap = this.root.get(keyMap);
  return firstMap ? firstMap.get(keyMap) : undefined;
};

DimensionalMap.prototype.delete = function(keyMap) {
  const firstMap = this.root.get(keyMap);
  if (!firstMap)
    return false;
  let rv = firstMap.delete(keyMap);
  if (rv && firstMap.root.size === 0)
    this.root.delete(keyMap);
  return rv;
};

DimensionalMap.prototype.set = function(keyMap, value) {
  if (!this.root.has(keyMap))
    this.root.set(keyMap, new BootstrapMap(Map, this.strongKeys));
  this.root.get(keyMap).set(keyMap, value);
  return this;
};

return DimensionalMap;

})();
void(DimensionalMap);
