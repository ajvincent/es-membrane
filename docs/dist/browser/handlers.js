var MembraneProxyHandlers = (function() {
"use strict";
const MembraneProxyHandlers = {};
// A ProxyHandler base prototype, for instanceof checks.
MembraneProxyHandlers.Base = class {};
allTraps.forEach((trapName) =>
  MembraneProxyHandlers.Base.prototype[trapName] = NOT_IMPLEMENTED
);
MembraneProxyHandlers.Forwarding = class extends MembraneProxyHandlers.Base {
  constructor() {
    super();

    Reflect.defineProperty(this, "nextHandler", {
      value: null,
      writable: true,
      enumerable: true,
      configurable: false,
    });
  }
};

{
  const proto = MembraneProxyHandlers.Forwarding.prototype;
  allTraps.forEach((trapName) =>
    proto[trapName] = function(...args) {
      return this.nextHandler[trapName].apply(this.nextHandler, args);
    }
  );
}
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
 * An object key to use for pointing to a default next node in the linked list.
 * @private
 */
const DEFAULT_TARGET = {};

//{
/**
 * A proxy handler node for a linked list of handlers.
 *
 * @param objectGraph {ObjectGraph} The object graph from a Membrane.
 * @param name        {String}      The name of this particular node in the linked list.
 *
 * @private
 * @extends MembraneProxyHandlers.Base
 */
MembraneProxyHandlers.LinkedListNode = class extends MembraneProxyHandlers.Base {
  constructor(objectGraph, name) {
    super();

    Reflect.defineProperty(this, "objectGraph", new NWNCDataDescriptor(objectGraph));
    Reflect.defineProperty(
      this, "membrane", new NWNCDataDescriptor(objectGraph.membrane)
    );
    Reflect.defineProperty(this, "name", new NWNCDataDescriptor(name));
    Reflect.defineProperty(this, "nextHandlerMap", new NWNCDataDescriptor(
      new WeakMap(/* target: MembraneProxyHandlers.Base or Reflect */)
    ));
  }

  /**
   * Specify which ProxyHandler is next for a given Proxy's shadow target.
   *
   * @param target      {Object} The shadow target.  May be null to indicate the
   *                             default for any shadow target.
   * @param nextHandler {MembraneProxyHandlers.Base} The next node.
   *
   * @private
   */
  link(target, nextHandler) {
    if (target === null)
      target = DEFAULT_TARGET;
    this.nextHandlerMap.set(target, nextHandler);
  }

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
  nextHandler(target) {
    let rv;
    if (target)
      rv = this.nextHandlerMap.get(target);
    if (!rv)
      rv = this.nextHandlerMap.get(DEFAULT_TARGET);
    return rv;
  }
};

// The ProxyHandler traps.
{
  const proto = MembraneProxyHandlers.LinkedListNode.prototype;
  allTraps.forEach((trapName) =>
    proto[trapName] = function(...args) {
      const nextHandler = this.nextHandler(args[0]);
      return nextHandler[trapName].apply(nextHandler, args);
    }
  );
}

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
 */
MembraneProxyHandlers.LinkedList = class extends MembraneProxyHandlers.Forwarding {
  constructor(objectGraph, tailForwarding) {
    super();
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
  }

  /**
   * Get a LinkedList node by name.
   *
   * @param name {String} The name of the node.
   *
   * @return {MembraneProxyHandlers.Base} The node.
   */
  getNodeByName(name) {
    return this.linkNodes.get(name);
  }

  /**
   * Get the next linked list node for a given shadow target.
   *
   * @param name {String}   The name of the current linked list node.
   * @param target {Object} (optional) The shadow target.
   *
   * @return {MembraneProxyHandlers.Base} The next node.
   */
  getNextNode(name, target = null) {
    return this.linkNodes.get(name).nextHandler(target);
  }

  /**
   * Build a new LinkedListNode.
   *
   * @param name     {String} The name of the linked list node.
   * @param ctorName {String} The name of the constructor to use.
   *
   * @returns {MembraneProxyHandlers.LinkedListNode} The node.
   */
  buildNode(name, ctorName = null, ...args) {
    if (LinkedListLocks.has(this))
      throw new Error("This linked list is locked");

    const t = typeof name;
    if ((t !== "string") && (t !== "symbol"))
      throw new Error("linked list nodes need a name");

    if (this.linkNodes.has(name))
      throw new Error(name + " is already in the linked list");

    let ctor = MembraneProxyHandlers.LinkedListNode;
    if (ctorName) {
      ctor = MembraneProxyHandlers[ctorName];
      if ((ctor.prototype !== MembraneProxyHandlers.LinkedListNode.prototype) &&
          !(ctor.prototype instanceof MembraneProxyHandlers.LinkedListNode))
        throw new Error("constructor is not a LinkedListNode");
    }

    args.splice(0, 0, this.objectGraph, name);
    return new ctor(...args);
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
  insertNode(
    leadNodeName,
    middleNode,
    insertTarget = null
  )
  {
    if (LinkedListLocks.has(this))
      throw new Error("This linked list is locked");

    if (!(middleNode instanceof MembraneProxyHandlers.LinkedListNode))
      throw new Error("node must be an instance of LinkedListNode");

    const leadNode = this.linkNodes.get(leadNodeName);
    if (!leadNode)
      throw new Error("lead node must be known to the linked list");

    let tailNode = leadNode.nextHandler(null);
    middleNode.link(insertTarget, tailNode);
    leadNode.link(insertTarget, middleNode);

    this.linkNodes.set(middleNode.name, middleNode);
  }

  /**
   * Mark this linked list as locked, meaning no more insertions of nodes.
   */
  lock() {
    LinkedListLocks.add(this);
  }
};

//}

}
/**
 * @fileoverview
 *
 * This is a debugging ProxyHandler. Production code shouldn't use this, but if
 * you need to figure out how you're getting in and out of a particular
 * ProxyHandler, this is useful.
 */
{

/**
 * @private
 */
const withProps = new Set([
  "defineProperty",
  "deleteProperty",
  "get",
  "getOwnPropertyDescriptor",
  "has",
  "set",
]);

/**
 * Build a LinkedListNode specifically for tracing entering and exiting a proxy handler.
 *
 * @param objectGraph {ObjectGraph} The object graph from a Membrane.
 * @param name        {String}      The name of this particular node in the linked list.
 * @param traceLog    {String[]}    Where the tracing will be recorded.
 */
MembraneProxyHandlers.Tracing = class extends MembraneProxyHandlers.LinkedListNode {
  constructor(objectGraph, name, traceLog = []) {
    super(objectGraph, name);
    this.traceLog = traceLog;

    //Object.seal(this);
  }

  /**
   * Clear the current log of events.
   */
  clearLog() {
    this.traceLog.splice(0, this.traceLog.length);
  }
};

/**
 * ProxyHandler implementation
 */
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

  Reflect.defineProperty(
    MembraneProxyHandlers.Tracing.prototype,
    trapName,
    new DataDescriptor(trap)
  );
});

}
/**
 * @fileoverview
 *
 * This is for specifically converting the shadow target to a real target, for
 * directly applying to Reflect traps.
 */
{

/**
 * Build a LinkedListNode for passing real targets to Reflect.
 *
 * @param objectGraph {ObjectGraph} The object graph from a Membrane.
 * @param name        {String}      The name of this particular node in the linked list.
 * @param traceLog    {String[]}    Where the tracing will be recorded.
 */

MembraneProxyHandlers.ConvertFromShadow = class extends MembraneProxyHandlers.LinkedListNode {
  constructor(objectGraph, name) {
    super(objectGraph, name);
    Object.freeze(this);
  }
};

/**
 * ProxyHandler implementation
 */
allTraps.forEach((trapName) => {
  const trap = function(...args) {
    const shadowTarget = args[0];
    args.splice(0, 1, getRealTarget(shadowTarget));
    const next = this.nextHandler(shadowTarget);
    return next[trapName].apply(next, args);
  };
  Reflect.defineProperty(
    MembraneProxyHandlers.ConvertFromShadow.prototype,
    trapName,
    new NWNCDataDescriptor(trap)
  );
});

Object.freeze(MembraneProxyHandlers.ConvertFromShadow.prototype);
Object.freeze(MembraneProxyHandlers.ConvertFromShadow);
}
/**
 * @fileoverview
 *
 * This is to update the shadow target of a Proxy from actions by subsidiary
 * ProxyHandlers.  The intent is to make sure Proxy invariants are not violated.
 */
{

/**
 * Build a LinkedListNode for updating shadow targets to match ProxyHandler operations.
 *
 * @param objectGraph {ObjectGraph} The object graph from a Membrane.
 * @param name        {String}      The name of this particular node in the linked list.
 * @param traceLog    {String[]}    Where the tracing will be recorded.
 */
MembraneProxyHandlers.UpdateShadow = class extends MembraneProxyHandlers.LinkedListNode {
  constructor(objectGraph, name) {
    super(objectGraph, name);
    Object.freeze(this);
  }


  /**
   * ProxyHandler implementation
   */
  preventExtensions(shadowTarget) {
    const handler = this.nextHandler(shadowTarget);
    const rv = handler.preventExtensions.apply(handler, arguments);
    if (rv)
      Reflect.preventExtensions(shadowTarget);
    return rv;
  }

  defineProperty(shadowTarget) {
    const handler = this.nextHandler(shadowTarget);
    const rv = handler.defineProperty.apply(handler, arguments);
    if (rv)
      Reflect.defineProperty.apply(Reflect, arguments);
    return rv;
  }
};

}
{
"use strict";

/**
 * A convenience object for caching Proxy trap methods.
 *
 * Necessary because someone decided LinkedList objects should be frozen.  So
 * these properties have to be defined locally.
 */
const forwardingDescriptors = new Map();

class MiddleList extends MembraneProxyHandlers.LinkedListNode {
  constructor(master, name) {
    super(master.objectGraph, name);
    this.subList = new MembraneProxyHandlers.LinkedList(master.objectGraph, master.getNextNode("head"));
  }
};

allTraps.forEach((trapName) => {
  MiddleList.prototype[trapName] = function(...args) {
    return this.subList[trapName](...args);
  };
});
Object.freeze(MiddleList.prototype);
Object.freeze(MiddleList);

/**
 * The master ProxyHandler for an object graph.
 *
 * @param objectGraph {ObjectGraph} The object graph from a Membrane.
 */
MembraneProxyHandlers.Master = class extends MembraneProxyHandlers.LinkedList {
  constructor(objectGraph) {
    super(objectGraph, Reflect);

    // These are the four linked list nodes at the master level.
    [
      "inbound",
      "distortions",
      "wrapping",
      "outbound",
    ].forEach(function(name) {
      let node = new MiddleList(this, name, this);
      this.insertNode("head", node);
      Object.freeze(node);
    }, this);
  
    { //  outbound
      const subList = this.getNodeByName("outbound").subList;
      {
        const updateShadow = subList.buildNode("updateShadow", "UpdateShadow");
        subList.insertNode("head", updateShadow);
      }
    }
  
    { // inbound
      const subList = this.getNodeByName("inbound").subList;
      {
        const convertFromShadow = subList.buildNode("convertFromShadow", "ConvertFromShadow");
        subList.insertNode("head", convertFromShadow);
      }
    }
  
    this.lock();
    Object.freeze(this);
  }
};



}
Object.freeze(MembraneProxyHandlers);
return MembraneProxyHandlers;
})();
