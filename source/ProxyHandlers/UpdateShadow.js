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
 *
 * @constructor
 * @extends MembraneProxyHandlers.LinkedListNode
 */
const UpdateShadow = function(objectGraph, name) {
  MembraneProxyHandlers.LinkedListNode.apply(this, [objectGraph, name]);
  Object.freeze(this);
};

UpdateShadow.prototype = new MembraneProxyHandlers.LinkedListNode({
  membrane: null
});

/**
 * ProxyHandler implementation
 */
Reflect.defineProperty(
  UpdateShadow.prototype,
  "preventExtensions",
  new NWNCDataDescriptor(function(shadowTarget) {
    const handler = this.nextHandler(shadowTarget);
    const rv = handler.preventExtensions.apply(handler, arguments);
    if (rv)
      Reflect.preventExtensions(shadowTarget);
    return rv;
  })
);

Reflect.defineProperty(
  UpdateShadow.prototype,
  "defineProperty",
  new NWNCDataDescriptor(function(shadowTarget) {
    const handler = this.nextHandler(shadowTarget);
    const rv = handler.defineProperty.apply(handler, arguments);
    if (rv)
      Reflect.defineProperty.apply(Reflect, arguments);
    return rv;
  })
);

Object.freeze(UpdateShadow.prototype);
Object.freeze(UpdateShadow);
MembraneProxyHandlers.UpdateShadow = UpdateShadow;
}
