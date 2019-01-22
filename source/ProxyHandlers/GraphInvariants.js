(function() {
"use strict";

const InvariantBase = function() {};
InvariantBase.prototype = new MembraneProxyHandlers.LinkedList(null);
InvariantBase.prototype.validateArgument = function(arg, argIndex) {
  if (valueType(arg) === "primitive")
    return;
  if (this.membrane.getMembraneProxy(this.objectGraph.graphName, arg) === arg)
    return;
  if (argIndex === -1)
    throw new TypeError(`GraphInvariant violation for return value`);
  throw new TypeError(`GraphInvariant violation for argument ${argIndex}`);
};
Object.freeze(InvariantBase.prototype);
Object.freeze(InvariantBase);

const GraphInvariantOut = function(objectGraph) {
  MembraneProxyHandlers.LinkedList.apply(this, [objectGraph]);
};
GraphInvariantOut.prototype = new InvariantBase();

allTraps.forEach(function(trapName) {
  this[trapName] = function(target) {
    const rv = this.nextHandler(target)[trapName].apply(this, arguments);
    this.validateArgument(rv, -1);
    return rv;
  };
}, GraphInvariantOut.prototype);

MembraneProxyHandlers.GraphInvariantOut = GraphInvariantOut;
Object.freeze(GraphInvariantOut.prototype);
Object.freeze(GraphInvariantOut);

const GraphInvariantIn = function(objectGraph) {
  MembraneProxyHandlers.LinkedList.apply(this, [objectGraph]);
};
GraphInvariantIn.prototype = new InvariantBase();
allTraps.forEach(function(trapName) {
  this[trapName] = function() {
    Array.from(arguments).forEach(this.validateArgument, this);
    return this.nextHandler(target)[trapName].apply(this.nextHandler, arguments);
  };
}, GraphInvariantIn.prototype);

MembraneProxyHandlers.GraphInvariantIn = GraphInvariantIn;
Object.freeze(GraphInvariantIn.prototype);
Object.freeze(GraphInvariantIn);
})();
