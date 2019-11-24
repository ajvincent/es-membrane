function TraceLinkedListNode(objectGraph, name, traceLog = []) {
  MembraneProxyHandlers.LinkedListNode.apply(this, [objectGraph, name]);
  this.traceLog = traceLog;
  Object.freeze(this);
}
{
TraceLinkedListNode.prototype = new MembraneProxyHandlers.LinkedListNode({
  membrane: null
});

TraceLinkedListNode.prototype.clearLog = function() {
  this.traceLog.splice(0, this.traceLog.length);
};

const withProps = new Set([
  "defineProperty",
  "deleteProperty",
  "get",
  "getOwnPropertyDescriptor",
  "has",
  "set",
]);

allTraps.forEach((trapName) => {
  const trap = function(...args) {
    const target = args[0];
    let msg;
    {
      let names = [this.name, trapName];
      if (withProps.has(trapName))
        names.push(args[1].toString());
      msg = names.join(", ");
    }

    this.traceLog.push(`enter ${msg}`);
    try {
      const next = this.nextHandler(target);
      let rv = next[trapName].apply(next, args);
      this.traceLog.push(`leave ${msg}`);
      return rv;
    }
    catch (ex) {
      this.traceLog.push(`throw ${msg}`);
      throw ex;
    }
  };
  Reflect.defineProperty(TraceLinkedListNode.prototype, trapName, new DataDescriptor(trap));
});
Object.freeze(TraceLinkedListNode.prototype);
Object.freeze(TraceLinkedListNode);
MembraneProxyHandlers.Tracing = TraceLinkedListNode;
  
}
