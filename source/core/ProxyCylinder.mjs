/** @module source/core/ProxyCylinder */

/**
 * @fileoverview
 *
 * A ProxyCylinder connects a non-Membrane object to all Membrane proxies that "equal" it
 * in all object graphs the Membrane controls.  It is the lowest-level data storage for
 * objects, their proxies and common "whitelist" distortions (expandos, hiding properties)
 *
 * The data structure is basically two-dimensional:  first the method, then the graph name.
 *
 * Operations using the origin graph actually apply to all proxies for the original value.
 *
 * Whenever you see "local", think "changes that don't apply to the underlying value".
 */

import {
  DeadProxyKey,
  NOT_YET_DETERMINED,
  NWNCDataDescriptor,
  assert,
  valueType,
} from "./sharedUtilities.mjs";

/**
 * @typedef GraphMetadata
 * @property {!Object} value          - The original value
 * @property {Proxy} proxy            - The proxy object from Proxy.revocable()
 * @property {Function} revoke        - The revoke() function from Proxy.revocable()
 * @property {Object} shadowTarget    - The shadow target
 * @property {Boolean} override       - True if the graph should be overridden.
 * @property {Map} localDescriptors   - Property descriptors local to an object graph.
 * @property {Set} deletedLocals      - Names of properties deleted locally.
 * @property {Object} cachedOwnKeys   - A bag of "own keys" that is cached for performance.
 * @property {Function} ownKeysFilter - A callback to filter the list of "own keys" for an object graph.
 * @property {Number} truncateArgList - A limit on the number of arguments.
 * @property {Boolean}
 */

/**
 * @package
 */
export default class ProxyCylinder {
  /**
   * @param {String | Symbol} originGraph The name of the original graph.
   */
  constructor(originGraph) {
    /**
     * @type {String | Symbol}
     */
    Reflect.defineProperty(this, "originGraph", new NWNCDataDescriptor(originGraph))

    /**
     * @private
     */
    Reflect.defineProperty(this, "proxyDataByGraph", new NWNCDataDescriptor({
      /* graph: GraphMetadata */
    }));

    /**
     * @private
     */
    this.originalValue = NOT_YET_DETERMINED;
  
    /**
     * Local flags for string keys determining behavior.
     * @private
     * @type {?Set}
     */
    this.localFlags = null;

    /**
     * Local flags for symbol keys.
     * @private
     * @type {?Map}
     */
    this.localFlagsSymbols = null;
  }

  /**
   * @private
   *
   * @returns {{String | Symbol}[]}
   */
  getGraphNames() {
    return Reflect.ownKeys(this.proxyDataByGraph);
  }

  /**
   * @private
   *
   * @param {String | Symbol} graph The graph name.
   *
   * @returns {GraphMetadata}
   * @throws {Error}
   */
  getMetadata(graphName) {
    {
      const type = typeof graphName;
      if ((type !== "string") && (type !== "symbol"))
        throw new Error("graphName is neither a symbol nor a string!");
    }

    {
      const rv = this.proxyDataByGraph[graphName];
      if (!rv)
        throw new Error(`unknown graph "${graphName}"`);
      if (rv === DeadProxyKey)
        throw new Error(`dead object graph "${graphName}"`);
      return rv;
    }
  }

  /**
   * @private
   *
   * @param {String | Symbol} graph                The graph name.
   * @param {GraphMetadata| DeadProxyKey} metadata The metadata.
   *
   * @throws {Error}
   */
  setMetadata(graphName, metadata) {
    {
      const type = typeof graphName;
      if ((type !== "string") && (type !== "symbol"))
        throw new Error("graphName is neither a symbol nor a string!");
    }

    {
      if (!metadata)
        throw new Error(`no graph for "${graphName}"`);
      if ((metadata !== DeadProxyKey) && (this.proxyDataByGraph[graphName] === DeadProxyKey))
        throw new Error(`dead object graph "${graphName}"`);
      this.proxyDataByGraph[graphName] = metadata;
    }
  }

  /**
   * Get the original, unproxied value.
   */
  getOriginal() {
    if (this.originalValue === NOT_YET_DETERMINED)
      throw new Error("getOriginal called but the original value hasn't been set!");
    return this.getProxy(this.originGraph);
  }

  /**
   * Determine if the mapping has a particular graph.
   *
   * @param {String | Symbol} graph The graph name.
   * @returns {Boolean} true if the graph exists.
   */
  hasGraph(graph) {
    return this.getGraphNames().includes(graph);
  }

  /**
   * Get the original value associated with a graph name.
   *
   * @param {String | Symbol} graph The graph name.
   * @returns {Object}
   */
  getValue(graph) {
    return this.getMetadata(graph).value;
  }

  /**
   * Get the proxy or object associated with a graph name.
   *
   * @param {String | Symbol} graph The graph name.
   * @returns {Object | Proxy}
   */
  getProxy(graph) {
    let rv = this.getMetadata(graph);
    rv = (!rv.override && (graph === this.originGraph)) ? rv.value : rv.proxy;
    return rv;
  }

  /**
   *
   * @param {String | Symbol} graph The graph name.
   *
   * @returns {Object} The shadow target.
   */
  getShadowTarget(graph) {
    return this.getMetadata(graph).shadowTarget;
  }

  /**
   * Determine if the argument is a shadow target we know about.
   *
   * @param {Object} shadowTarget The presumed shadow target.
   *
   * @returns {Boolean} True if the shadow target belongs to this cylinder.
   */
  isShadowTarget(shadowTarget) {
    const graphs = Object.values(this.proxyDataByGraph);
    return graphs.some((graph) => (graph !== DeadProxyKey) && graph.shadowTarget === shadowTarget);
  }

  /**
   * Add a value to the mapping.
   *
   * @param {Membrane}      membrane The owning membrane.
   * @param {Symbol|String} graph    The graph name of the object graph.
   * @param {GraphMetadata} metadata The metadata (proxy, value, shadow, etc.) for the graph.
   */
  set(membrane, graph, metadata) {
    let override = (typeof metadata.override === "boolean") && metadata.override;
    if (!override && this.hasGraph(graph))
      throw new Error("set called for previously defined graph!");
    if (this.proxyDataByGraph[graph] === DeadProxyKey)
      throw new Error(`dead object graph ${graph}`);

    this.setMetadata(graph, metadata);

    if (override || (graph !== this.originGraph)) {
      if (valueType(metadata.proxy) !== "primitive") {
        membrane.map.set(metadata.proxy, this);
      }
    }
    else if (this.originalValue === NOT_YET_DETERMINED) {
      this.originalValue = metadata.value;
      delete metadata.proxy;
      delete metadata.revoke;
    }

    if (!membrane.map.has(metadata.value)) {
      if (valueType(metadata.value) !== "primitive")
        membrane.map.set(metadata.value, this);
    }
    else
      assert(this === membrane.map.get(metadata.value), "ProxyMapping mismatch?");
  }

  /**
   * Mark a graph name as dead.
   *
   * @param {String | Symbol} graph The graph name of the object graph.
   */
  remove(graph) {
    /* This will make the keys of the Membrane's WeakMapOfProxyMappings
     * unreachable, and thus reduce the set of references to the ProxyMapping.
     *
     * There's also the benefit of disallowing recreating a proxy to the
     * original object.
     */
    this.setMetadata(graph, DeadProxyKey);
  }

  /**
   * Kill all membrane proxies this references.
   *
   * @param {Membrane} membrane The owning membrane.
   * @note The key difference between this.selfDestruct() and this.revoke() is
   * that when the Membrane invokes this.selfDestruct(), it's expecting to set
   * all new proxies and values.
   */
  selfDestruct(membrane) {
    const graphs = this.getGraphNames();
    for (let i = (graphs.length - 1); i >= 0; i--) {
      const graph = graphs[i];
      if (graph === DeadProxyKey)
        continue;
      const metadata = this.getMetadata(graph);
      if (graph !== this.originGraph) {
        membrane.map.delete(metadata.proxy);
      }
      membrane.map.delete(metadata.value);
      this.remove(graph);
    }
  }

  /**
   * Revoke all proxies associated with a membrane.
   *
   * @param {Membrane} membrane The controlling membrane.
   */
  revoke(membrane) {
    const graphs = this.getGraphNames();
    // graphs[0] === this.originGraph
    for (let i = 1; i < graphs.length; i++) {
      let parts = this.proxyDataByGraph[graphs[i]];
      if (parts === DeadProxyKey)
        continue;
      if (typeof parts.revoke === "function")
        parts.revoke();
      if (Object(parts.value) === parts.value)
        membrane.revokeMapping(parts.value);
      if (Object(parts.proxy) === parts.proxy)
        membrane.revokeMapping(parts.proxy);
      if (Object(parts.shadowTarget) === parts.shadowTarget)
        membrane.revokeMapping(parts.shadowTarget);

      this.setMetadata(graphs[i], DeadProxyKey);
    }

    {
      let parts = this.proxyDataByGraph[this.originGraph];
      if (parts !== DeadProxyKey)
        membrane.revokeMapping(parts.value);
      this.setMetadata(this.originGraph, DeadProxyKey);
    }
  }

  /**
   * Get a local flag's current value.
   *
   * @param {Symbol | String} graphName The object graph's name.
   * @param {String}          flagName  The flag to get.
   *
   * @returns {Boolean} The value of the flag.
   */
  getLocalFlag(graphName, flagName) {
    this.getMetadata(graphName); // ensure we're alive
    if (typeof graphName == "string") {
      if (!this.localFlags)
        return false;
      let flag = flagName + ":" + graphName;
      return this.localFlags.has(flag);
    }
    else if (typeof graphName == "symbol") {
      if (!this.localFlagsSymbols)
        return false;
      let obj = this.localFlagsSymbols.get(graphName);
      if (!obj || !obj[flagName])
        return false;
      return true;
    }
  }

  /**
   * Set a local flag for a particular graph.
   *
   * @param {Symbol | String} graphName The object graph's name.
   * @param {String}          flagName  The flag to set.
   * @param {Boolean}         value     The value to set.
   */
  setLocalFlag(graphName, flagName, value) {
    this.getMetadata(graphName); // ensure we're alive
    if (typeof graphName == "string") {
      if (!this.localFlags)
        this.localFlags = new Set();

      let flag = flagName + ":" + graphName;
      if (value)
        this.localFlags.add(flag);
      else
        this.localFlags.delete(flag);
    }
    else if (typeof graphName == "symbol") {
      // It's harder to combine symbols and strings into a string...
      if (!this.localFlagsSymbols)
        this.localFlagsSymbols = new Map();
      let obj = this.localFlagsSymbols.get(graphName) || {};
      obj[flagName] = value;
      this.localFlagsSymbols.set(graphName, obj);
    }
  }

  /**
   * Get a property descriptor which is local to a graph proxy.
   *
   * @param {Symbol | String} graphName The object graph's name.
   * @param {Symbol | String} propName
   *
   * @returns {DataDescriptor | AccessorDescriptor}
   */
  getLocalDescriptor(graphName, propName) {
    this.getMetadata(graphName); // ensure we're alive
    let desc;
    if (!this.hasGraph(graphName))
      return desc;
    const metadata = this.getMetadata(graphName);
    if (metadata.localDescriptors)
      desc = metadata.localDescriptors.get(propName);
    return desc;
  }

  /**
   * Set a property descriptor which is local to a graph proxy.
   *
   * @param {Symbol | String} graphName                The object graph's name.
   * @param {Symbol | String} propName                 The property name.
   * @param {DataDescriptor | AccessorDescriptor} desc The property descriptor.
   */
  setLocalDescriptor(graphName, propName, desc) {
    this.getMetadata(graphName); // ensure we're alive
    this.unmaskDeletion(graphName, propName);
    const metadata = this.getMetadata(graphName);

    if (!metadata.localDescriptors) {
      metadata.localDescriptors = new Map();
    }

    metadata.localDescriptors.set(propName, desc);
    return true;
  }

  /**
   * Delete a property descriptor from an object graph.
   *
   * @param {Symbol | String} graphName         The object graph's name.
   * @param {Symbol | String} propName          The property name.
   * @param {Boolean}         recordLocalDelete True if the delete operation is local.
   */
  deleteLocalDescriptor(graphName, propName, recordLocalDelete) {
    this.getMetadata(graphName); // ensure we're alive
    const metadata = this.getMetadata(graphName);
    if (recordLocalDelete) {
      if (!metadata.deletedLocals)
        metadata.deletedLocals = new Set();
      metadata.deletedLocals.add(propName);
    }
    else
      this.unmaskDeletion(graphName, propName);

    if ("localDescriptors" in metadata) {
      metadata.localDescriptors.delete(propName);
      if (metadata.localDescriptors.size === 0)
        metadata.localDescriptors = null;
    }
  }

  /**
   * Get the cached "own keys" for a particular graph.
   *
   * @param {Symbol | String} graphName The object graph's name.
   */
  cachedOwnKeys(graphName) {
    this.getMetadata(graphName); // ensure we're alive
    const metadata = this.getMetadata(graphName);
    if ("cachedOwnKeys" in metadata)
      return metadata.cachedOwnKeys;
    return null;
  }

  /**
   * Set the cached "own keys" for a particular graph.
   *
   * @param {Symbol | String}     graphName The object graph's name.
   * @param {{Symbol | String}[]} keys      The set of keys to make available.
   * @param {{Symbol | String}[]} original  The set of keys on the underlying object.
   */
  setCachedOwnKeys(graphName, keys, original) {
    this.getMetadata(graphName); // ensure we're alive
    const metadata = this.getMetadata(graphName);
    metadata.cachedOwnKeys = {
      keys: keys,
      original: original
    };
  }

  /**
   * Get the list of "own keys" local to a particular object graph.
   * @param {Symbol | String} graphName The object graph's name.
   */
  localOwnKeys(graphName) {
    const metadata = this.getMetadata(graphName);
    let rv = [];
    if ("localDescriptors" in metadata)
      rv = Array.from(metadata.localDescriptors.keys());
    return rv;
  }

  /**
   * 
   * @param {Symbol | String} graphName The object graph's name.
   * @param {Set}             set       Storage for a list of names.
   */
  appendDeletedNames(graphName, set) {
    const metadata = this.getMetadata(graphName);

    const locals = metadata.deletedLocals;
    if (!locals || !locals.size)
      return;

    const iter = locals.values();
    let next;
    do {
      next = iter.next();
      if (!next.done)
        set.add(next.value);
    } while (!next.done);
  }

  /**
   * Report if there is an active local delete for a property name.
   *
   * @param {Symbol | String} graphName The object graph's name.
   * @param {Symbol | String} propName  The property name.
   *
   * @returns {Boolean}
   */
  wasDeletedLocally(graphName, propName) {
    const metadata = this.getMetadata(graphName);
    const locals = metadata.deletedLocals;
    return Boolean(locals) && locals.has(propName);
  }

  /**
   * Unmask a property name from the set of deleted local properties.
   *
   * @param {Symbol | String} graphName The object graph's name.
   * @param {Symbol | String} propName  The property name.
   */
  unmaskDeletion(graphName, propName) {
    const metadata = this.getMetadata(graphName);
    if (!metadata.deletedLocals)
      return;
    metadata.deletedLocals.delete(propName);
    if (metadata.deletedLocals.size === 0)
      delete metadata.deletedLocals;
  }

  /**
   * Get a filter function for a list of own keys.
   *
   * @param {Symbol | String} graphName The object graph's name.
   * @returns {?Function} The filter function.
   */
  getOwnKeysFilter(graphName) {
    const metadata = this.getMetadata(graphName);
    return (typeof metadata.ownKeysFilter === "function") ?
           metadata.ownKeysFilter :
           null;
  }

  /**
   * Set a filter function for a list of own keys.
   *
   * @param {Symbol | String} graphName The object graph's name.
   * @param {?Function} The filter function.
   */
  setOwnKeysFilter(graphName, filter) {
    this.getMetadata(graphName).ownKeysFilter = filter;
  }

  /**
   * Get the maximum argument count for a function proxy.
   * @param {Symbol | String} graphName The object graph's name.
   *
   * @returns {Number | false}
   */
  getTruncateArgList(graphName) {
    const metadata = this.getMetadata(graphName);

    return (typeof metadata.truncateArgList !== "undefined") ?
           metadata.truncateArgList :
           false;
  }

  /**
   * Set the maximum argument count for a function proxy.
   * @param {Symbol | String} graphName The object graph's name.
   * @param {Number}          count     The argument count.
   */
  setTruncateArgList(graphName, count) {
    this.getMetadata(graphName).truncateArgList = count;
  }
}

Object.seal(ProxyCylinder.prototype);
Object.seal(ProxyCylinder);
