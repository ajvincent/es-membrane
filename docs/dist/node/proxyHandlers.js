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
// A ProxyHandler base prototype, for instanceof checks.
MembraneProxyHandlers.Base = function() {};
allTraps.forEach((trapName) =>
  MembraneProxyHandlers.Base.prototype[trapName] = NOT_IMPLEMENTED
);
MembraneProxyHandlers.Forwarding = function() {
  this.nextHandlerByTrap = new Map();
  this.setNextHandler(allTraps, NOT_IMPLEMENTED);
};

MembraneProxyHandlers.Forwarding.prototype = new MembraneProxyHandlers.Base();

{
  const proto = MembraneProxyHandlers.Forwarding.prototype;
  allTraps.forEach((trapName) =>
    proto[trapName] = function(...args) {
      const next = this.nextHandlerByTrap.get(trapName);
      return next[trapName].apply(next, args);
    }
  );

  proto.setNextHandler = function(traps, handler) {
    traps.forEach((trapName) =>
      this.nextHandlerByTrap.set(trapName, handler)
    );
  };
}
module.exports.MembraneProxyHandlers = MembraneProxyHandlers;
