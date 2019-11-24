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
