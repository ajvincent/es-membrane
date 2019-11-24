(function() {
"use strict";

/**
 * A convenience object for caching Proxy trap methods.
 *
 * Necessary because someone decided LinkedList objects should be frozen.  So
 * these properties have to be defined locally.
 */
const forwardingDescriptors = new Map();
allTraps.forEach((trapName) => {
  forwardingDescriptors.set(trapName, new DataDescriptor(
    function(...args) {
      return this.subList[trapName](...args);
    }
  ));
});

/**
 * The master ProxyHandler for an object graph.
 *
 * @param objectGraph {ObjectGraph} The object graph from a Membrane.
 * 
 * @constructor
 * @extends MembraneProxyHandlers.LinkedList
 */
const MasterHandler = function(objectGraph) {
  MembraneProxyHandlers.LinkedList.apply(this, [objectGraph, Reflect]);

  // These are the four linked list nodes at the master level.
  [
    "inbound",
    "distortions",
    "wrapping",
    "outbound",
  ].forEach(function(name) {
    let node = this.buildNode(name);
    this.insertNode("head", node);

    // Create a LinkedList for each of the master list's sections.
    node.subList = new MembraneProxyHandlers.LinkedList(
      objectGraph, node.nextHandler(null)
    );

    /**
     * ProxyHandler
     */
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
