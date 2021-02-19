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
