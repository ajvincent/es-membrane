/**
 * @constructor
 */
function ObjectGraph(membrane, graphName) {
  {
    let t = typeof graphName;
    if ((t != "string") && (t != "symbol"))
      throw new Error("field must be a string or a symbol!");
  }

  var passThroughFilter = returnFalse;

  Object.defineProperties(this, {
    "membrane": new NWNCDataDescriptor(membrane, true),
    "graphName": new NWNCDataDescriptor(graphName, true),

    // private
    "masterProxyHandler": new NWNCDataDescriptor(
      new MembraneProxyHandlers.Master(this), false
    ),

    "passThroughFilter": {
      get: () => passThroughFilter,
      set: (val) => {
        if (passThroughFilter !== returnFalse)
          throw new Error("passThroughFilter has been defined once already!");
        if (typeof val !== "function")
          throw new Error("passThroughFilter must be a function");
        passThroughFilter = val;
        return val;
      },
      enumerable: false,
      configurable: false,
    },

    "mayReplacePassThrough": {
      get: () => passThroughFilter === returnFalse,
      enumerable: true,
      configurable: false
    },

    // private
    "__revokeFunctions__": new NWNCDataDescriptor([], false),

    // private
    "__isDead__": new DataDescriptor(false, true, true, true),

    // private
    "__proxyListeners__": new NWNCDataDescriptor([], false),
  });
}

/**
 * Insert a ProxyHandler into our sequence.
 *
 * @param phase        {String} The phase to insert the handler in.
 * @param leadNodeName {String} The name of the current linked list node in the given phase.
 * @param middleNode   {MembraneProxyHandlers.LinkedListNode}
 *                     The node to insert.
 * @param insertTarget {Object} (optional) The shadow target to set for a redirect.
 *                     Null if for all shadow targets in general.
 */
ObjectGraph.prototype.insertHandler = function(
  phase,
  leadNodeName,
  middleNode,
  insertTarget = null) {
  const subHandler = this.masterProxyHandler.getNodeByName(phase);
  if (!subHandler)
    throw new Error("Phase for proxy handler does not exist");
  subHandler.insertNode(leadNodeName, middleNode, insertTarget);
};

/**
 * Add a ProxyMapping or a Proxy.revoke function to our list.
 *
 * @private
 */
ObjectGraph.prototype.addRevocable = function(revoke) {
  if (this.__isDead__)
    throw new Error("This membrane handler is dead!");
  this.__revokeFunctions__.push(revoke);
};

/**
 * Remove a ProxyMapping or a Proxy.revoke function from our list.
 *
 * @private
 */
ObjectGraph.prototype.removeRevocable = function(revoke) {
  let index = this.__revokeFunctions__.indexOf(revoke);
  if (index == -1) {
    throw new Error("Unknown revoke function!");
  }
  this.__revokeFunctions__.splice(index, 1);
};

/**
 * Revoke the entire object graph.
 */
ObjectGraph.prototype.revokeEverything = function() {
  if (this.__isDead__)
    throw new Error("This membrane handler is dead!");
  Object.defineProperty(this, "__isDead__", new NWNCDataDescriptor(true, false));
  let length = this.__revokeFunctions__.length;
  for (var i = 0; i < length; i++) {
    let revocable = this.__revokeFunctions__[i];
    if (revocable instanceof ProxyMapping)
      revocable.revoke(this.membrane);
    else // typeof revocable == "function"
      revocable();
  }
};

Object.freeze(ObjectGraph.prototype);
Object.freeze(ObjectGraph);
