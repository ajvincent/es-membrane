"use strict";
var assert = require("assert");
var {
    NOT_IMPLEMENTED,
    NOT_IMPLEMENTED_DESC,
    DataDescriptor,
    AccessorDescriptor,
    isDataDescriptor,
    isAccessorDescriptor,
    allTraps,
} = require("./utilities.js");
var MembraneProxyHandlers = {};
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
// A ProxyHandler base prototype, for instanceof checks.
MembraneProxyHandlers.Base = function() {};
allTraps.forEach((trapName) =>
  MembraneProxyHandlers.Base.prototype[trapName] = NOT_IMPLEMENTED
);
MembraneProxyHandlers.Forwarding = function() {
  Reflect.defineProperty(this, "nextHandler", {
    value: null,
    writable: true,
    enumerable: true,
    configurable: false,
  });
};

MembraneProxyHandlers.Forwarding.prototype = new MembraneProxyHandlers.Base();

{
  const proto = MembraneProxyHandlers.Forwarding.prototype;
  allTraps.forEach((trapName) =>
    proto[trapName] = function(...args) {
      return this.nextHandler[trapName].apply(this.nextHandler, args);
    }
  );
}
{
const LinkedListNode = function(objectGraph, name) {
  Reflect.defineProperty(this, "objectGraph", {
    value: objectGraph,
    writable: false,
    enumerable: true,
    configurable: false,
  });

  Reflect.defineProperty(this, "membrane", {
    value: objectGraph.membrane,
    writable: false,
    enumerable: true,
    configurable: false,
  });

  Reflect.defineProperty(this, "name", {
    value: name,
    writable: false,
    enumerable: true,
    configurable: false,
  });  
};

//{
LinkedListNode.prototype = new MembraneProxyHandlers.Base();

LinkedListNode.ForwardingMap = new DimensionalMap(
  ["target"], /* object keys */
  ["handler"] /* strong keys */
  /*
    {
      target: (shadow target, or null for default),
      handler: new MembraneProxyHandlers.LinkedListNode()
    }: new MembraneProxyHandlers.LinkedListNode() or Reflect
  */
);

const DEFAULT_TARGET = {};

LinkedListNode.prototype.link = function(target, nextHandler) {
  if (target === null)
    target = DEFAULT_TARGET;
  const key = new Map();
  key.set("target", target);
  key.set("handler", this);
  LinkedListNode.ForwardingMap.set(key, nextHandler);
};

LinkedListNode.prototype.nextHandler = function(target) {
  const key = new Map();
  key.set("target", target);
  key.set("handler", this);
  let rv = LinkedListNode.ForwardingMap.get(key);
  if (!rv) {
    key.set("target", DEFAULT_TARGET);
    rv = LinkedListNode.ForwardingMap.get(key);
  }
  return rv;
};

{
  const proto = LinkedListNode.prototype;
  allTraps.forEach((trapName) =>
    proto[trapName] = function(...args) {
      const nextHandler = this.nextHandler(args[0]);
      return nextHandler[trapName].apply(nextHandler, args);
    }
  );
}

Object.freeze(LinkedListNode.prototype);
Object.freeze(LinkedListNode);
//}

const LinkedList = function(objectGraph, tailForwarding) {
  if ((tailForwarding !== Reflect) &&
      (!(tailForwarding instanceof MembraneProxyHandlers.Base)))
    throw new Error("tailForwarding must be a ProxyHandler or Reflect");

  Reflect.defineProperty(this, "objectGraph", {
    value: objectGraph,
    writable: false,
    enumerable: true,
    configurable: false,
  });

  Reflect.defineProperty(this, "membrane", {
    value: objectGraph.membrane,
    writable: false,
    enumerable: true,
    configurable: false,
  });

  const tailNode = new MembraneProxyHandlers.Forwarding();

  Reflect.defineProperty(this, "tailNode", {
    value: tailNode,
    writable: false,
    enumerable: false,
    configurable: false,
  });
  Reflect.defineProperty(tailNode, "nextHandler", {
    value: tailForwarding,
    writable: false,
    enumerable: true,
    configurable: false,
  });

  this.linkNodes = new Map();

  const headNode = this.buildNode("head");
  this.linkNodes.set("head", headNode);
  Reflect.defineProperty(this, "nextHandler", {
    value: headNode,
    writable: false,
    enumerable: true,
    configurable: false
  });
  headNode.link(null, tailNode);

  Object.freeze(this);
};
//{
// the LinkedList object also acts as a head to its own linked list
LinkedList.prototype = new MembraneProxyHandlers.Forwarding();

LinkedList.prototype.getNodeByName = function(name) {
  return this.linkNodes.get(name);
};

LinkedList.prototype.getNextNode = function(name, target = null) {
  return this.linkNodes.get(name).nextHandler(target);
};

LinkedList.prototype.buildNode = function(name) {
  const t = typeof name;
  if ((t !== "string") && (t !== "symbol"))
    throw new Error("linked list nodes need a name");
  if (this.linkNodes.has(name))
    throw new Error(name + " is already in the linked list");
  return new LinkedListNode(this.objectGraph, name);
};

LinkedList.prototype.insertNode = function(
  leadNodeName,
  middleNode,
  insertTarget = null
)
{
  if (!(middleNode instanceof LinkedListNode))
    throw new Error("node must be provided by this.buildNode()");

  const leadNode = this.linkNodes.get(leadNodeName);
  if (!leadNode)
    throw new Error("lead node must be known to the linked list");

  let tailNode = leadNode.nextHandler(null);
  middleNode.link(insertTarget, tailNode);
  leadNode.link(insertTarget, middleNode);

  this.linkNodes.set(middleNode.name, middleNode);
};

MembraneProxyHandlers.LinkedList = LinkedList;
Object.freeze(LinkedList);
Object.freeze(LinkedList.prototype);
//}

}
Object.freeze(MembraneProxyHandlers);
module.exports.MembraneProxyHandlers = MembraneProxyHandlers;
