/**
 * @fileoverview
 *
 * This implements a LinkedList proxy handler and nodes for the linked list.
 *
 * LinkedListNode objects should form the basis for any real-world proxy
 * operations, as a unit-testable component.
 *
 * @see Tracing.js for an example of how to write a LinkedListNode subclass.
 */

{

/**
 * A proxy handler node for a linked list of handlers.
 *
 * @param objectGraph {ObjectGraph} The object graph from a Membrane.
 * @param name        {String}      The name of this particular node in the linked list.
 *
 * @private
 * @constructor
 * @extends MembraneProxyHandlers.Base
 */
const LinkedListNode = function(objectGraph, name) {
  Reflect.defineProperty(this, "objectGraph", new NWNCDataDescriptor(objectGraph));
  Reflect.defineProperty(
    this, "membrane", new NWNCDataDescriptor(objectGraph.membrane)
  );
  Reflect.defineProperty(this, "name", new NWNCDataDescriptor(name));
  Reflect.defineProperty(this, "nextHandlerMap", new NWNCDataDescriptor(
    new WeakMap(/* target: MembraneProxyHandlers.Base or Reflect */)
  ));
};

//{
LinkedListNode.prototype = new MembraneProxyHandlers.Base();

/**
 * An object key to use for pointing to a default next node in the linked list.
 * @private
 */
const DEFAULT_TARGET = {};

/**
 * Specify which ProxyHandler is next for a given Proxy's shadow target.
 *
 * @param target      {Object} The shadow target.  May be null to indicate the
 *                             default for any shadow target.
 * @param nextHandler {MembraneProxyHandlers.Base} The next node.
 * 
 * @private
 */
LinkedListNode.prototype.link = function(target, nextHandler) {
  if (target === null)
    target = DEFAULT_TARGET;
  this.nextHandlerMap.set(target, nextHandler);
};

/**
 * Get the next ProxyHandler for a given Proxy's shadow target.
 *
 * @param target {Object}  The shadow target.  May be null to indicate the
 *                         default for any shadow target.
 *
 * @returns {MembraneProxyHandlers.Base} The next node.
 *
 * @private
 */
LinkedListNode.prototype.nextHandler = function(target) {
  let rv;
  if (target)
    rv = this.nextHandlerMap.get(target);
  if (!rv)
    rv = this.nextHandlerMap.get(DEFAULT_TARGET);
  return rv;
};

// The ProxyHandler traps.
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

/**
 * A set of LinkedList objects which should no longer be altered.
 *
 * @private
 */
const LinkedListLocks = new WeakSet(/* LinkedList */);

/**
 * A linked list proxy handler.
 *
 * @param objectGraph    {ObjectGraph} The object graph from a Membrane.
 * @param tailForwarding {Reflect | MembraneProxyHandlers.Base} The tail of the linked list.
 *
 * @constructor
 */
const LinkedList = function(objectGraph, tailForwarding) {
  if ((tailForwarding !== Reflect) &&
      (!(tailForwarding instanceof MembraneProxyHandlers.Base)))
    throw new Error("tailForwarding must be a ProxyHandler or Reflect");

  Reflect.defineProperty(this, "objectGraph", new NWNCDataDescriptor(objectGraph));
  Reflect.defineProperty(
    this, "membrane", new NWNCDataDescriptor(objectGraph.membrane)
  );

  const tailNode = new MembraneProxyHandlers.Forwarding();
  Reflect.defineProperty(
    this, "tailNode", new NWNCDataDescriptor(tailNode, false)
  );
  Reflect.defineProperty(
    tailNode, "nextHandler", new NWNCDataDescriptor(tailForwarding)
  );

  // @private
  this.linkNodes = new Map(/* String: LinkedListNode */);

  const headNode = this.buildNode("head");
  this.linkNodes.set("head", headNode);
  Reflect.defineProperty(this, "nextHandler", new NWNCDataDescriptor(headNode));
  headNode.link(null, tailNode);

  Object.freeze(this);
};
//{
// the LinkedList object also acts as a head to its own linked list
LinkedList.prototype = new MembraneProxyHandlers.Forwarding();

/**
 * Get a LinkedList node by name.
 *
 * @param name {String} The name of the node.
 *
 * @return {MembraneProxyHandlers.Base} The node.
 */
LinkedList.prototype.getNodeByName = function(name) {
  return this.linkNodes.get(name);
};

/**
 * Get the next linked list node for a given shadow target.
 *
 * @param name {String}   The name of the current linked list node.
 * @param target {Object} (optional) The shadow target.
 *
 * @return {MembraneProxyHandlers.Base} The next node.
 */
LinkedList.prototype.getNextNode = function(name, target = null) {
  return this.linkNodes.get(name).nextHandler(target);
};

/**
 * Build a new LinkedListNode.
 *
 * @param name     {String} The name of the linked list node.
 * @param ctorName {String} The name of the constructor to use.
 *
 * @returns {MembraneProxyHandlers.LinkedListNode} The node.
 */
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

/**
 * Insert a LinkedListNode into this linked list.
 *
 * @param leadNodeName {String} The name of the current linked list node.
 * @param middleNode   {MembraneProxyHandlers.LinkedListNode}
 *                     The node to insert.
 * @param insertTarget {Object} (optional) The shadow target to set for a redirect.
 *                     Null if for all shadow targets in general.
 */
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

/**
 * Mark this linked list as locked, meaning no more insertions of nodes.
 */
LinkedList.prototype.lock = function() {
  LinkedListLocks.add(this);
};

MembraneProxyHandlers.LinkedList = LinkedList;
Object.freeze(LinkedList);
Object.freeze(LinkedList.prototype);
//}

}
