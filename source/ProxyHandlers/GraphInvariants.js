{
"use strict";

class InvariantBase extends MembraneProxyHandlers.LinkedList {
  validateArgument(arg, argIndex) {
    if (valueType(arg) === "primitive")
      return;
    if (this.membrane.getMembraneProxy(this.objectGraph.graphName, arg) === arg)
      return;
    if (argIndex === -1)
      throw new TypeError(`GraphInvariant violation for return value`);
    throw new TypeError(`GraphInvariant violation for argument ${argIndex}`);
  }
};
Object.freeze(InvariantBase.prototype);
Object.freeze(InvariantBase);

MembraneProxyHandlers.GraphInvariantOut = class extends InvariantBase {
};

allTraps.forEach(function(trapName) {
  this[trapName] = function(target) {
    const rv = this.nextHandler(target)[trapName].apply(this, arguments);
    this.validateArgument(rv, -1);
    return rv;
  };
}, MembraneProxyHandlers.GraphInvariantOut);


MembraneProxyHandlers.GraphInvariantIn = class extends InvariantBase {
};

allTraps.forEach(function(trapName) {
  this[trapName] = function() {
    Array.from(arguments).forEach(this.validateArgument, this);
    return this.nextHandler(target)[trapName].apply(this.nextHandler, arguments);
  };
}, MembraneProxyHandlers.GraphInvariantIn.prototype);

}
