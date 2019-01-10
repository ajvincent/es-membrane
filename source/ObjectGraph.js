/**
 * @constructor
 */
function ObjectGraph(membrane, graphName) {
  {
    let t = typeof graphName;
    if ((t != "string") && (t != "symbol"))
      throw new Error("field must be a string or a symbol!");
  }
  this.membrane = membrane;
  this.graphName = graphName;
  this.entryHandler = new MembraneProxyHandlers.LinkedList(this);

  // Build up the linked list.
  const handlers = [
    this.entryHandler, // this must be the first in the sequence
    Reflect // this must be the last in the sequence
  ];
  handlers.forEach((handler, index, array) => {
    if (handler === Reflect)
      return;
    handler.link(null, array[index + 1]);
  });

  Object.freeze(this);
}

ObjectGraph.prototype.buildBaseProxy = function(value) {
  let shadowTarget = makeShadowTarget(value);
  parts = Proxy.revocable(shadowTarget, this.entryHandler);
  parts.value = value;
  parts.shadowTarget = shadowTarget;
  return parts;
};

ObjectGraph.prototype.insertHandler = function(target, headHandler, handler) {
  if (target === null)
    throw new Error("Do not use insertHandler to modify default linked list");
  if (!(headHandler instanceof MembraneProxyHandlers.LinkedList))
    throw new Error("headHandler should be a MembraneProxyHandlers.LinkedList");
  if (!(handler instanceof MembraneProxyHandlers.LinkedList))
    throw new Error("handler should be a MembraneProxyHandlers.LinkedList");

  const tailHandler = headHandler.nextHandler(target);
  handler.link(target, tailHandler);
  headHandler.link(target, handler);
};

Object.freeze(ObjectGraph.prototype);
Object.freeze(ObjectGraph);
