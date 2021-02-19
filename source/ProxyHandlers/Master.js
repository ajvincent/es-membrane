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
