{
const LinkedList = function(objectGraph) {
  this.objectGraph = objectGraph;
  this.membrane = objectGraph.membrane;
  Object.freeze(this);
};
LinkedList.prototype = new MembraneProxyHandlers.Base();

LinkedList.ForwardingMap = new DimensionalMap(
  ["target"], /* object keys */
  ["handler"] /* strong keys */
  /*
    {
      target: (shadow target, or null for default),
      handler: new MembraneProxyHandlers.LinkedList()
    }: new MembraneProxyHandlers.LinkedList() or Reflect
  */
);

const DEFAULT_TARGET = {};

LinkedList.prototype.link = function(target, nextHandler) {
  if (target === null)
    target = DEFAULT_TARGET;
  const key = new Map();
  key.set("target", target);
  key.set("handler", this);
  LinkedList.ForwardingMap.set(key, nextHandler);
};

LinkedList.prototype.nextHandler = function(target) {
  const key = new Map();
  key.set("target", target);
  key.set("handler", this);
  let rv = LinkedList.ForwardingMap.get(key);
  if (!rv) {
    key.set("target", DEFAULT_TARGET);
    rv = LinkedList.ForwardingMap.get(key);
  }
  return rv;
};

{
  const proto = LinkedList.prototype;
  allTraps.forEach((trapName) =>
    proto[trapName] = function(...args) {
      const nextHandler = this.nextHandler(args[0]);
      return nextHandler[trapName].apply(nextHandler, args);
    }
  );
}

MembraneProxyHandlers.LinkedList = LinkedList;
Object.freeze(LinkedList.prototype);
Object.freeze(LinkedList);
}
