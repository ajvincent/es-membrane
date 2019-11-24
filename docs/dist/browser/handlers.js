var MembraneProxyHandlers = (function() {
"use strict";
var MembraneProxyHandlers = {};
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
return MembraneProxyHandlers;
})();
