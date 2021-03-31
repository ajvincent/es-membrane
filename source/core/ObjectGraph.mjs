import {
  DataDescriptor,
  NWNCDataDescriptor,
  defineNWNCProperties,
} from "./utilities/shared.mjs";

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

    defineNWNCProperties(this, {
      /**
       * @public
       */
      membrane,

      /**
       * @public
       */
      graphName,
    }, true);

    defineNWNCProperties(this, {
      /**
       * @package
       */
      masterProxyHandler: new MembraneProxyHandlers.Master(this),

      /**
       * @private
       */
      __revokeFunctions__: [],

      /**
       * @private
       */
      __proxyListeners__: new Set,
    }, false);

    Reflect.defineProperty(this, "__isDead__", new DataDescriptor(false, true, false, false));
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
   *
   * @public
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
  /*
  addRevocable(revoke) {
    if (this.__isDead__)
      throw new Error("This membrane handler is dead!");
    this.__revokeFunctions__.push(revoke);

    void(revoke);
    throw new Error("Not implemented");
  }
  */

  /**
   * Add a listener for new proxies.
   *
   * @see ProxyNotify
   * @public
   */
  addProxyListener(listener) {
    if (typeof listener != "function")
      throw new Error("listener is not a function!");
    this.__proxyListeners__.add(listener);
  }

  /**
   * Remove a listener for new proxies.
   *
   * @see ProxyNotify
   * @public
   */
  removeProxyListener(listener) {
    if (typeof listener != "function")
      throw new Error("listener is not a function!");
    this.__proxyListeners__.remove(listener);
  }

  /**
   * Get the currently registered set of proxy listeners.
   *
   * @returns {Function[]}
   * @package
   */
  getProxyListeners() {
    return Array.from(this.__proxyListeners__);
  }

  /**
   * Revoke the entire object graph.
   * @public
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
