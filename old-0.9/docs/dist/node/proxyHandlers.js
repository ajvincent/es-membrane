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
  this.nextHandler = null;
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
module.exports.MembraneProxyHandlers = MembraneProxyHandlers;
