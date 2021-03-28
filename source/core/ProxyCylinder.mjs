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
  defineNWNCProperties,
  valueType,
} from "./utilities/shared.mjs";

/**
 * @callback OwnKeysFilter
 * @param {Symbol | String}     key   The current key.
 * @param {Number}              index The index of the current key.
 * @param {{Symbol | String}[]} array The ordered set of keys to make available.
 *
 * @returns {Boolean}
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
 */

/**
 * @typedef GraphMetadata
 * @property {Object} value                - The original value
 * @property {Proxy} proxy                 - The proxy object from Proxy.revocable()
 * @property {Object} shadowTarget         - The shadow target
 * @property {Boolean} storeAsValue        - Store a value instead of a proxy/shadow.
 * @property {Boolean} override            - True if the graph should be overridden.
 * @property {Map} localDescriptors        - Property descriptors local to an object graph.
 * @property {Set} deletedLocals           - Names of properties deleted locally.
 * @property {Object} cachedOwnKeys        - A bag of "own keys" that is cached for performance.
 * @property {OwnKeysFilter} ownKeysFilter - A callback to filter the list of "own keys" for an object graph.
 * @property {Number} truncateArgList      - A limit on the number of arguments.
 */

/**
 * @package
 */
export class ProxyCylinder {
  /**
   * @param {String | Symbol}  originGraph The name of the original graph.
   * @param {ProxyCylinderMap} map         The cylinder map which will own this.
   */
  constructor(originGraph, map) {
    defineNWNCProperties(this, {
      // XXX rename to originGraphName
      /**
       * @type {String | Symbol}
       * @public
       * @readonly
       */
      originGraph,
    }, true);

    defineNWNCProperties(this, {
      /**
       * @type {Map<String | Symbol, GraphMetadata>}
       * @private
       * @readonly
       */
      proxyDataByGraph: new Map,

      /**
       * @type {ProxyCylinderMap}
       * @private
       * @readonly
       */
      cylinderMap: map,
    }, false);

    /**
     * @type {Boolean}
     * @private
     */
    this.originalValueSet = false;

    /**
     * Local flags for string keys determining behavior.
     * @type {?Set}
     * @private
     */
    this.localFlags = null;

    /**
     * Local flags for symbol keys.
     * @type {?Map}
     * @private
     */
    this.localFlagsSymbols = null;

    Reflect.preventExtensions(this);
  }

  /**
   * @private
   *
   * @returns {{String | Symbol}[]}
   */
  getGraphNames() {
    return Array.from(this.proxyDataByGraph.keys());
  }

  /**
   * @private
   *
   * @param {String | Symbol} graphName The graph name.
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
      const rv = this.proxyDataByGraph.get(graphName);
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
   * @param {String | Symbol}              graphName The graph name.
   * @param {GraphMetadata | DeadProxyKey} metadata  The metadata.
   *
   * @throws {Error}
   */
  setMetadataInternal(graphName, metadata) {
    if (!metadata)
      throw new Error(`no graph for "${graphName}"`);
    if ((metadata !== DeadProxyKey) && (this.proxyDataByGraph.get(graphName) === DeadProxyKey))
      throw new Error(`dead object graph "${graphName}"`);
    this.proxyDataByGraph.set(graphName, metadata);
  }

  /**
   * Get the original, unproxied value.
   * @public
   */
  getOriginal() {
    if (!this.originalValueSet)
      throw new Error("the original value hasn't been set");
    return this.getProxy(this.originGraph);
  }

  /**
   * Determine if the cylinder has a particular graph.
   *
   * @param {String | Symbol} graphName The graph name.
   *
   * @returns {Boolean} true if the graph exists.
   * @public
   */
  hasGraph(graphName) {
    return this.getGraphNames().includes(graphName);
  }

  /**
   * Get the proxy or object associated with a graph name.
   *
   * @param {String | Symbol} graphName The graph name.
   *
   * @returns {Object | Proxy}
   * @public
   */
  getProxy(graphName) {
    let rv = this.getMetadata(graphName);
    return rv.storeAsValue ? rv.value : rv.proxy;
  }

  /**
   *
   * @param {String | Symbol} graphName The graph name.
   *
   * @returns {Object} The shadow target.
   * @public
   */
  getShadowTarget(graphName) {
    return this.getMetadata(graphName).shadowTarget;
  }

  /**
   * Determine if the argument is a shadow target we know about.
   *
   * @param {Object} shadowTarget The presumed shadow target.
   *
   * @returns {Boolean} True if the shadow target belongs to this cylinder.
   * @public
   */
  isShadowTarget(shadowTarget) {
    if (shadowTarget === undefined)
      return false;
    const graphs = Array.from(this.proxyDataByGraph.values());
    return graphs.some(
      graph => (graph !== DeadProxyKey) && (graph.shadowTarget === shadowTarget)
    );
  }

  /**
   * Add a value to the cylinder.
   *
   * @param {Symbol|String} graphName The graph name of the object graph.
   * @param {GraphMetadata} metadata  The metadata (proxy, value, shadow, etc.) for the graph.
   *
   * @public
   */
  setMetadata(graphName, metadata) {
    if ((typeof metadata !== "object") || (metadata === null))
      throw new Error("metadata argument must be an object");

    if (typeof metadata.storeAsValue !== "boolean")
      throw new Error("metadata.storeAsValue must be a boolean");

    const override = (typeof metadata.override === "boolean") && metadata.override;
    if (!override && this.hasGraph(graphName))
      throw new Error(`set called for previously defined graph "${graphName}"`);

    if (this.proxyDataByGraph.get(graphName) === DeadProxyKey)
      throw new Error(`dead object graph "${graphName}"`);

    const type = typeof graphName;
    if ((type !== "string") && (type !== "symbol"))
      throw new Error("graphName is neither a symbol nor a string!");

    const isForeignGraph = (graphName !== this.originGraph);

    if (!this.originalValueSet && (override || !metadata.storeAsValue))
      throw new Error("original value has not been set");

    if (isForeignGraph && (this.proxyDataByGraph.get(this.originGraph) === DeadProxyKey))
      throw new Error(`dead origin object graph "${this.originGraph}"`);

    if (!metadata.storeAsValue) {
      if ("value" in metadata)
        throw new Error("metadata must not include a value for a foreign graph");
      if (!metadata.proxy)
        throw new Error("metadata must include a proxy for a foreign graph");
      if (!metadata.shadowTarget)
        throw new Error("metadata must include a shadow target for a foreign graph");
    }
    else {
      if (!("value" in metadata))
        throw new Error("metadata must include an original value for an origin graph");
      if (metadata.proxy)
        throw new Error("metadata must not include a proxy for an origin graph");
      if (metadata.shadowTarget)
        throw new Error("metadata must not include a shadow target for an origin graph");
    }

    this.setMetadataInternal(graphName, metadata);

    if (isForeignGraph) {
      if (!metadata.storeAsValue && (valueType(metadata.proxy) !== "primitive")) {
        this.cylinderMap.set(metadata.proxy, this);
        this.cylinderMap.set(metadata.shadowTarget, this);
      }
    }
    else if (!this.originalValueSet) {
      this.originalValueSet = true;
    }

    if (metadata.storeAsValue &&
        !this.cylinderMap.has(metadata.value) &&
        (valueType(metadata.value) !== "primitive")) {
      this.cylinderMap.set(metadata.value, this);
    }
  }

  /**
   * Mark a graph name as dead.
   *
   * @param {String | Symbol} graphName The graph name of the object graph.
   * @public
   */
  removeGraph(graphName) {
    /* This will make the keys of the Membrane's ProxyCylinderMap
     * unreachable, and thus reduce the set of references to the ProxyCylinder.
     *
     * There's also the benefit of disallowing recreating a proxy to the
     * original object.
     */

    this.getMetadata(graphName); // ensure we're alive

    if (graphName === this.originGraph) {
      // Ensure no other graph is alive.
      const values = new Set(this.proxyDataByGraph.values());
      values.delete(DeadProxyKey);
      if (values.size !== 1)
        throw new Error("Cannot remove the origin graph with another graph referring to it");
    }
    this.setMetadataInternal(graphName, DeadProxyKey);
  }

  /**
   * Remove all membrane proxies this references (without revocation)

   * @public
   */
  clearAllGraphs() {
    const names = this.getGraphNames();
    for (let i = (names.length - 1); i >= 0; i--) {
      const graphName = names[i];
      if (this.proxyDataByGraph.get(graphName) === DeadProxyKey)
        continue;
      const metadata = this.getMetadata(graphName);
      if (graphName !== this.originGraph) {
        this.cylinderMap.delete(metadata.proxy);
        this.cylinderMap.delete(metadata.shadowTarget);
      }
      else {
        this.cylinderMap.delete(metadata.value);
      }
    }

    this.originalValueSet = false;
    this.proxyDataByGraph.clear();
  }

  /**
   * Get a local flag's current value.
   *
   * @param {Symbol | String} graphName The object graph's name.
   * @param {String}          flagName  The flag to get.
   *
   * @returns {Boolean} The value of the flag.
   * @public
   */
  getLocalFlag(graphName, flagName) {
    this.getMetadata(graphName); // ensure we're alive
    if (typeof graphName === "string") {
      if (!this.localFlags)
        return false;
      let flag = flagName + ":" + graphName;
      return this.localFlags.has(flag);
    }
    else {
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
   *
   * @public
   */
  setLocalFlag(graphName, flagName, value) {
    this.getMetadata(graphName); // ensure we're alive
    if (typeof graphName === "string") {
      if (!this.localFlags)
        this.localFlags = new Set();

      let flag = flagName + ":" + graphName;
      if (value)
        this.localFlags.add(flag);
      else
        this.localFlags.delete(flag);
    }
    else {
      // It's harder to combine symbols and strings into a string...
      if (!this.localFlagsSymbols)
        this.localFlagsSymbols = new Map();
      let obj = this.localFlagsSymbols.get(graphName) || {};
      obj[flagName] = value;
      this.localFlagsSymbols.set(graphName, obj);
    }
  }

  /**
   * Get the list of "own keys" local to a particular object graph.
   * @param {Symbol | String} graphName The object graph's name.
   *
   * @returns {{Symbol | String}[]}
   * @public
   */
  localOwnKeys(graphName) {
    const metadata = this.getMetadata(graphName);
    let rv = [];
    if ("localDescriptors" in metadata)
      rv = Array.from(metadata.localDescriptors.keys());
    return rv;
  }

  /**
   * Get a property descriptor which is local to a graph proxy.
   *
   * @param {Symbol | String} graphName The object graph's name.
   * @param {Symbol | String} propName
   *
   * @returns {DataDescriptor | AccessorDescriptor}
   * @public
   */
  getLocalDescriptor(graphName, propName) {
    const metadata = this.getMetadata(graphName); // ensure we're alive
    let desc;
    if (!this.hasGraph(graphName))
      return desc;

    if (metadata.localDescriptors)
      desc = metadata.localDescriptors.get(propName);
    return desc;
  }

  /**
   * Set a property descriptor which is local to a graph proxy.
   *
   * @param {Symbol | String}                     graphName The object graph's name.
   * @param {Symbol | String}                     propName  The property name.
   * @param {DataDescriptor | AccessorDescriptor} desc      The property descriptor.
   *
   * @public
   *
   * @note This does not update cachedOwnKeys.
   */
  setLocalDescriptor(graphName, propName, desc) {
    const metadata = this.getMetadata(graphName); // ensure we're alive
    this.unmaskDeletion(graphName, propName);

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
   *
   * @public
   *
   * @note This does not update cachedOwnKeys.
   */
  deleteLocalDescriptor(graphName, propName, recordLocalDelete) {
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
      if (metadata.localDescriptors.size === 0) {
        delete metadata.localDescriptors;
      }
    }
  }

  /**
   * Append our list of deleted property names to a Set that carries them.
   *
   * @param {Symbol | String} graphName The object graph's name.
   * @param {Set}             set       Storage for a list of names.
   *
   * @public
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
   * @public
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
   *
   * @public
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
   * Get the cached "own keys" for a particular graph.
   *
   * @param {Symbol | String} graphName The object graph's name.
   *
   * @returns {{Symbol | String}[]}
   * @public
   */
  cachedOwnKeys(graphName) {
    const metadata = this.getMetadata(graphName);
    if ("cachedOwnKeys" in metadata)
      return metadata.cachedOwnKeys;
    return null;
  }

  /**
   * Set the cached "own keys" for a particular graph.
   *
   * @param {Symbol | String}     graphName The object graph's name.
   * @param {{Symbol | String}[]} keys      The ordered set of keys to make available.
   * @param {{Symbol | String}[]} original  The ordered set of keys on the underlying object.
   *
   * @public
   */
  setCachedOwnKeys(graphName, keys, original) {
    this.getMetadata(graphName).cachedOwnKeys = { keys, original };
  }

  /**
   * Get a filter function for a list of own keys.
   *
   * @param {Symbol | String} graphName The object graph's name.
   * @returns {?OwnKeysFilter} The filter function.
   *
   * @public
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
   * @param {?OwnKeysFilter}  filter    The filter function.
   *
   * @public
   */
  setOwnKeysFilter(graphName, filter) {
    this.getMetadata(graphName).ownKeysFilter = (typeof filter === "function") ? filter : null;
  }

  /**
   * Get the maximum argument count for a function proxy.
   * @param {Symbol | String} graphName The object graph's name.
   *
   * @returns {Number | false}
   * @public
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
   * @param {?Number | false} count     The argument count.
   *
   * @public
   */
  setTruncateArgList(graphName, count) {
    const metadata = this.getMetadata(graphName);
    if ((typeof count === "boolean") ||
        ((typeof count === "number") && (count >= 0) && (parseInt(count) === count) && isFinite(count))
       )
      metadata.truncateArgList = count;
    else
      delete metadata.truncateArgList;
  }
}

Object.freeze(ProxyCylinder.prototype);
Object.freeze(ProxyCylinder);

/**
 * @package
 */
export class ProxyCylinderMap extends WeakMap {
  set(key, value) {
    if (value !== DeadProxyKey) {
      if (!(value instanceof ProxyCylinder)) {
        throw new Error("Value must be a ProxyCylinder, or DeadProxyKey");
      }
      const current = this.get(key);
      if (current === DeadProxyKey)
        throw new Error("ProxyCylinderMap says this key is dead");

      if ((current !== undefined) && (current !== value))
        throw new Error("ProxyCylinderMap already has a value for this key");
    }

    return super.set(key, value);
  }

  buildCylinder(originGraph) {
    return new ProxyCylinder(originGraph, this);
  }
}

Object.freeze(ProxyCylinderMap);
Object.freeze(ProxyCylinderMap.prototype);
