import {
  DataDescriptor,
  NWNCDataDescriptor,
  returnFalse,
} from "./sharedUtilities.mjs";

import {
  ProxyCylinder,
} from "./ProxyCylinder.mjs";

// temporary
const MembraneProxyHandlers = {
  Master: function() {}
};

/**
 * @package
 */
export default class ObjectGraph {
  constructor(membrane, graphName) {
    {
      let t = typeof graphName;
      if ((t != "string") && (t != "symbol"))
        throw new Error("graph name must be a string or a symbol!");
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
   * @param {String} phase         The phase to insert the handler in.
   * @param {String} leadNodeName  The name of the current linked list node in the given phase.
   * @param {MembraneProxyHandlers.LinkedListNode} middleNode
   *                     The node to insert.
   * @param {?Object} insertTarget The shadow target to set for a redirect.
   *                     Null if for all shadow targets in general.
   */
  insertHandler(
    phase, leadNodeName, middleNode, insertTarget = null
  )
  {
    const subHandler = this.masterProxyHandler.getNodeByName(phase);
    if (!subHandler)
      throw new Error("Phase for proxy handler does not exist");
    subHandler.insertNode(leadNodeName, middleNode, insertTarget);
  }

  /**
   * Add a ProxyCylinder or a Proxy.revoke function to our list.
   *
   * @private
   */
  addRevocable(revoke) {
    /*
    if (this.__isDead__)
      throw new Error("This membrane handler is dead!");
    this.__revokeFunctions__.push(revoke);
    */
    void(revoke);
    throw new Error("Not implemented");
  }

  /**
   * Remove a ProxyCylinder or a Proxy.revoke function from our list.
   *
   * @private
   */
  removeRevocable(revoke) {
    /*
    let index = this.__revokeFunctions__.indexOf(revoke);
    if (index == -1) {
      throw new Error("Unknown revoke function!");
    }
    this.__revokeFunctions__.splice(index, 1);
    */
    void(revoke);
    throw new Error("Not implemented");
  }

  /**
   * Revoke the entire object graph.
   */
  revokeEverything() {
    if (this.__isDead__)
      throw new Error("This membrane handler is dead!");
    Object.defineProperty(this, "__isDead__", new NWNCDataDescriptor(true, false));
    let length = this.__revokeFunctions__.length;
    for (var i = 0; i < length; i++) {
      let revocable = this.__revokeFunctions__[i];
      if (revocable instanceof ProxyCylinder)
        revocable.revoke(this.membrane);
      else // typeof revocable == "function"
        revocable();
    }
  }
}

Object.freeze(ObjectGraph.prototype);
Object.freeze(ObjectGraph);
