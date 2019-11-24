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

  Reflect.defineProperty(this, "nextHandlerMap", new DataDescriptor(
    new WeakMap(/* target: MembraneProxyHandlers.Base or Reflect */)
  ));
};

//{
LinkedListNode.prototype = new MembraneProxyHandlers.Base();

const DEFAULT_TARGET = {};

LinkedListNode.prototype.link = function(target, nextHandler) {
  if (target === null)
    target = DEFAULT_TARGET;
  this.nextHandlerMap.set(target, nextHandler);
};

LinkedListNode.prototype.nextHandler = function(target) {
  let rv;
  if (target)
    rv = this.nextHandlerMap.get(target);
  if (!rv)
    rv = this.nextHandlerMap.get(DEFAULT_TARGET);
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

MembraneProxyHandlers.LinkedListNode = LinkedListNode;
Object.seal(LinkedListNode.prototype);
Object.freeze(LinkedListNode);
//}

const LinkedListLocks = new WeakSet();

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

LinkedList.prototype.buildNode = function(name, ctorName = null) {
  if (LinkedListLocks.has(this))
    throw new Error("This linked list is locked");
  const t = typeof name;
  if ((t !== "string") && (t !== "symbol"))
    throw new Error("linked list nodes need a name");
  if (this.linkNodes.has(name))
    throw new Error(name + " is already in the linked list");
  let ctor = LinkedListNode;
  if (ctorName) {
    ctor = MembraneProxyHandlers[ctorName];
    if ((ctor.prototype !== LinkedListNode.prototype) &&
        !(ctor.prototype instanceof LinkedListNode))
      throw new Error("constructor is not a LinkedListNode");
  }
  let args = [this.objectGraph, name];
  args = args.concat(Array.from(arguments).slice(2));
  return Reflect.construct(ctor, args);
};

LinkedList.prototype.insertNode = function(
  leadNodeName,
  middleNode,
  insertTarget = null
)
{
  if (LinkedListLocks.has(this))
    throw new Error("This linked list is locked");

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

LinkedList.prototype.lock = function() {
  LinkedListLocks.add(this);
};

MembraneProxyHandlers.LinkedList = LinkedList;
Object.freeze(LinkedList);
Object.freeze(LinkedList.prototype);
//}

}
function TraceLinkedListNode(objectGraph, name, traceLog = []) {
  MembraneProxyHandlers.LinkedListNode.apply(this, [objectGraph, name]);
  this.traceLog = traceLog;
  Object.freeze(this);
}
{
TraceLinkedListNode.prototype = new MembraneProxyHandlers.LinkedListNode({
  membrane: null
});

TraceLinkedListNode.prototype.clearLog = function() {
  this.traceLog.splice(0, this.traceLog.length);
};

const withProps = new Set([
  "defineProperty",
  "deleteProperty",
  "get",
  "getOwnPropertyDescriptor",
  "has",
  "set",
]);

allTraps.forEach((trapName) => {
  const trap = function(...args) {
    const target = args[0];
    let msg;
    {
      let names = [this.name, trapName];
      if (withProps.has(trapName))
        names.push(args[1].toString());
      msg = names.join(", ");
    }

    this.traceLog.push(`enter ${msg}`);
    try {
      const next = this.nextHandler(target);
      let rv = next[trapName].apply(next, args);
      this.traceLog.push(`leave ${msg}`);
      return rv;
    }
    catch (ex) {
      this.traceLog.push(`throw ${msg}`);
      throw ex;
    }
  };
  Reflect.defineProperty(TraceLinkedListNode.prototype, trapName, new DataDescriptor(trap));
});
Object.freeze(TraceLinkedListNode.prototype);
Object.freeze(TraceLinkedListNode);
MembraneProxyHandlers.Tracing = TraceLinkedListNode;
  
}
(function() {
"use strict";

const forwardingDescriptors = new Map();
allTraps.forEach((trapName) => {
  forwardingDescriptors.set(trapName, new DataDescriptor(
    function(...args) {
      return this.subList[trapName](...args);
    }
  ));
});

const MasterHandler = function(objectGraph) {
  MembraneProxyHandlers.LinkedList.apply(this, [objectGraph, Reflect]);

  [
    "inbound",
    "distortions",
    "wrapping",
    "outbound",
  ].forEach(function(name) {
    let node = this.buildNode(name);
    this.insertNode("head", node);

    node.subList = new MembraneProxyHandlers.LinkedList(
      objectGraph, node.nextHandler(null)
    );
    allTraps.forEach((trapName) =>
      Reflect.defineProperty(node, trapName, forwardingDescriptors.get(trapName))
    );
    Object.freeze(node);
  }, this);

  this.lock();
  Object.freeze(this);
};
MasterHandler.prototype = MembraneProxyHandlers.LinkedList.prototype;

MembraneProxyHandlers.Master = MasterHandler;
Object.freeze(MasterHandler.prototype);
Object.freeze(MasterHandler);
})();
Object.freeze(MembraneProxyHandlers);
module.exports.MembraneProxyHandlers = MembraneProxyHandlers;
