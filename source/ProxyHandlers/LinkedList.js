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

  if (this.linkNodes.has(middleNode.name))
    throw new Error(name + " is already in the linked list");

  if (middleNode.nextHandler(null))
    throw new Error("LinkedListNode's can't have default follow-up nodes until they're inserted");

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
