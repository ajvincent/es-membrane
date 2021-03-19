/** @module source/core/sharedUtilities */

const ShadowKeyMap = new WeakMap();

const DeadProxyKey = Symbol("dead map entry");

function assert(condition, message) {
  if (!condition)
    throw new Error("Assertion failure: " + message);
}

/**
 * Define a shadow target, so we can manipulate the proxy independently of the
 * original target.
 *
 * @argument value {Object} The original target.
 *
 * @returns {Object} A shadow target to minimally emulate the real one.
 */
function makeShadowTarget(value) {
  var rv;
  if (Array.isArray(value))
    rv = [];
  else if (typeof value === "object")
    rv = {};
  else if (typeof value === "function")
    rv = function() {};
  else
    throw new Error("Unknown value for makeShadowTarget");
  ShadowKeyMap.set(rv, value);
  return rv;
}

/**
 * Get the real target for a given shadow object.
 * @param target
 */
function getRealTarget(target) {
  return ShadowKeyMap.has(target) ? ShadowKeyMap.get(target) : target;
}

function returnFalse() {
  return false;
}

class DataDescriptor {
  /**
   * A data descriptor.
   *
   * @param {any} value
   * @param {Boolean} [writable]
   * @param {Boolean} [enumerable]
   * @param {Boolean} [configurable]
   */
  constructor(value, writable = false, enumerable = true, configurable = true) {
    this.value = value;
    this.writable = writable;
    this.enumerable = enumerable;
    this.configurable = configurable;
  }
}

class AccessorDescriptor {
  /**
   * An accessor descriptor.
   *
   * @param {Function} getter
   * @param {Function} [setter]
   * @param {Boolean}  [enumerable]
   * @param {Boolean}  [configurable]
   */
  constructor(getter, setter, enumerable = true, configurable = true) {
    this.get = getter;
    this.set = setter;
    this.enumerable = enumerable;
    this.configurable = configurable;
  }
}

class NWNCDataDescriptor {
  /**
   * A non-writable, non-configurable data descriptor.
   *
   * @param {any} value
   * @param {Boolean} [writable]
   */
  constructor(value, enumerable = true) {
    this.value = value;
    this.enumerable = enumerable;
  }
}
NWNCDataDescriptor.prototype.writable = false;
NWNCDataDescriptor.prototype.configurable = false;
Object.freeze(NWNCDataDescriptor.prototype);

/**
 * Determine if a value is legally a data descriptor.
 * @param {Object} desc
 *
 * @returns {Boolean} true if it is a data descriptor.
 */
function isDataDescriptor(desc) {
  if (typeof desc === "undefined")
    return false;
  if (!("value" in desc) && !("writable" in desc))
    return false;
  return true;
}

/**
 * Determine if a value is legally an accessor descriptor.
 * @param {Object} desc
 *
 * @returns {Boolean} true if it is an accessor descriptor.
 */
function isAccessorDescriptor(desc) {
  if (typeof desc === "undefined") {
    return false;
  }
  if (!("get" in desc) && !("set" in desc))
    return false;
  return true;
}

/**
 * Define a set of properties as non-writable, non-configurable.
 *
 * @param {Object}  obj
 * @param {Object}  propertyBag
 * @param {boolean} enumerable
 *
 * @package
 */
function defineNWNCProperties(obj, propertyBag, enumerable = true) {
  const properties = {};
  for (const [key, value] of Object.entries(propertyBag)) {
    properties[key] = new NWNCDataDescriptor(value, enumerable);
  }

  Object.defineProperties(obj, properties);
}

const allTraps = Object.freeze([
  "getPrototypeOf",
  "setPrototypeOf",
  "isExtensible",
  "preventExtensions",
  "getOwnPropertyDescriptor",
  "defineProperty",
  "has",
  "get",
  "set",
  "deleteProperty",
  "ownKeys",
  "apply",
  "construct"
]);

/* XXX ajvincent This is supposed to be a complete list of top-level globals.
   Copied from https://github.com/tc39/proposal-realms/blob/master/shim/src/stdlib.js
   on September 20, 2017.
*/
const Primordials = Object.freeze((function() {
const p = [
  Array,
  ArrayBuffer,
  Boolean,
  DataView,
  Date,
  decodeURI,
  decodeURIComponent,
  encodeURI,
  encodeURIComponent,
  Error,
  eval,
  EvalError,
  Float32Array,
  Float64Array,
  Function,
  Int8Array,
  Int16Array,
  Int32Array,
  isFinite,
  isNaN,
  JSON,
  Map,
  Math,
  Number,
  Object,
  parseFloat,
  parseInt,
  Promise,
  Proxy,
  RangeError,
  ReferenceError,
  Reflect,
  RegExp,
  Set,
  String,
  Symbol,
  SyntaxError,
  TypeError,
  Uint8Array,
  Uint8ClampedArray,
  Uint16Array,
  Uint32Array,
  URIError,
  WeakMap,
  WeakSet,
];

return p.concat(p.filter((i) => {
    if (!i.name)
      return false;
    let j = i.name[0];
    return j.toUpperCase() === j;
  }).map((k) => k.prototype));
})());

/**
 *
 * @param value
 *
 * @return "primitive" | "function" | "object"
 */
function valueType(value) {
  if (value === null)
    return "primitive";
  const type = typeof value;
  if ((type !== "function") && (type !== "object"))
    return "primitive";
  return type;
}

/**
 * @deprecated
 */
function makeRevokeDeleteRefs(parts, cylinder, graphName) {
  let oldRevoke = parts.revoke;
  if (!oldRevoke)
    return;

  // necessary: in OverriddenProxyParts, revoke is inherited and read-only.
  Reflect.defineProperty(parts, "revoke", new DataDescriptor(function() {
    oldRevoke.apply(parts);
    cylinder.removeGraph(graphName);
  }, true));
}

const NOT_YET_DETERMINED = {};
Object.defineProperty(
  NOT_YET_DETERMINED,
  "not_yet_determined",
  new NWNCDataDescriptor(true)
);

/** @module source/core/ProxyCylinder */

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
class ProxyCylinder {
  /**
   * @param {String | Symbol} originGraph The name of the original graph.
   */
  constructor(originGraph) {
    /**
     * @type {String | Symbol}
     * @public
     * @readonly
     */
    Reflect.defineProperty(this, "originGraph", new NWNCDataDescriptor(originGraph));

    /**
     * @type {Map<String | Symbol, GraphMetadata>}
     * @private
     * @readonly
     */
    Reflect.defineProperty(this, "proxyDataByGraph", new NWNCDataDescriptor(new Map()));

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
   * @param {Membrane}      membrane  The owning membrane.
   * @param {Symbol|String} graphName The graph name of the object graph.
   * @param {GraphMetadata} metadata  The metadata (proxy, value, shadow, etc.) for the graph.
   *
   * @public
   */
  setMetadata(membrane, graphName, metadata) {
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
        membrane.cylinderMap.set(metadata.proxy, this);
        membrane.cylinderMap.set(metadata.shadowTarget, this);
      }
    }
    else if (!this.originalValueSet) {
      this.originalValueSet = true;
    }

    if (metadata.storeAsValue &&
        !membrane.cylinderMap.has(metadata.value) &&
        (valueType(metadata.value) !== "primitive")) {
      membrane.cylinderMap.set(metadata.value, this);
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
   *
   * @param {Membrane} membrane The owning membrane.
   *
   * @public
   */
  clearAllGraphs(membrane) {
    const names = this.getGraphNames();
    for (let i = (names.length - 1); i >= 0; i--) {
      const graphName = names[i];
      if (this.proxyDataByGraph.get(graphName) === DeadProxyKey)
        continue;
      const metadata = this.getMetadata(graphName);
      if (graphName !== this.originGraph) {
        membrane.cylinderMap.delete(metadata.proxy);
        membrane.cylinderMap.delete(metadata.shadowTarget);
      }
      else {
        membrane.cylinderMap.delete(metadata.value);
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

const WeakMap_set = WeakMap.prototype.set;

/**
 * @package
 */
class ProxyCylinderMap extends WeakMap {
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

    return WeakMap_set.apply(this, [key, value]);
  }
}

Object.freeze(ProxyCylinderMap);

/**
 * Notify all proxy listeners of a new proxy.
 *
 * @param {GraphMetadata}      parts     The graph metadata from a ProxyCylinder.
 * @param {ObjectGraphHandler} handler   The handler for the proxy.
 * @param {Boolean}            isOrigin  True if the handler is the origin graph handler.
 * @param {Object}             options   Special options to pass on to the listeners.
 *
 * @package
 * @deprecated
 */
function ProxyNotify(parts, handler, isOrigin, options) {
  if (typeof options === "undefined")
    options = {};

  // private variables
  const listeners = handler.__proxyListeners__;
  if (listeners.length === 0)
    return;

  // the actual metadata object for the listener
  var meta = Object.create(options, {
    /**
     * The proxy or value the Membrane will return to the caller.
     *
     * @note If you set this property with a non-proxy value, the value will NOT
     * be protected by the membrane.
     *
     * If you wish to replace the proxy with another Membrane-based proxy,
     * this is no longer supported.
     */
    "proxy": new AccessorDescriptor(
      () => parts.proxy,

      // @deprecated
      (val) => { if (!meta.stopped) parts.proxy = val; }
    ),

    /* XXX ajvincent revoke is explicitly NOT exposed, lest a listener call it 
     * and cause chaos for any new proxy trying to rely on the existing one.  If
     * you really have a problem, use throwException() below.
     */

    /**
     * The unwrapped object or function we're building the proxy for.
     */
    "target": new DataDescriptor(getRealTarget(parts.shadowTarget)),

    "isOriginGraph": new DataDescriptor(isOrigin),

    /**
     * The proxy handler.  This should be an ObjectGraphHandler.
     */
    "handler": new AccessorDescriptor(
      () => handler,
      (val) => { if (!meta.stopped) handler = val; }
    ),

    /**
     * A reference to the membrane logger, if there is one.
     */
    "logger": new DataDescriptor(handler.membrane.logger),

    /**
     * Direct the membrane to use the shadow target instead of the full proxy.
     *
     * @param mode {String} One of several values:
     *   - "frozen" means return a frozen shadow target.
     *   - "sealed" means return a sealed shadow target.
     *   - "prepared" means return a shadow target with lazy getters for all
     *     available properties and for its prototype.
     */
    "useShadowTarget": new DataDescriptor(
      (mode) => {
        ProxyNotify.useShadowTarget.apply(meta, [parts, handler, mode]);
      }
    ),
  });

  const callbacks = [];
  const inConstruction = handler.proxiesInConstruction;
  const realTarget = parts.shadowTarget ? getRealTarget(parts.shadowTarget) : parts.value;
  inConstruction.set(realTarget, callbacks);

  try {
    invokeProxyListeners(listeners, meta);
  }
  finally {
    callbacks.forEach(function(c) {
      try {
        c(parts.proxy);
      }
      catch (e) {
        // do nothing
      }
    });

    inConstruction.delete(realTarget);
  }
}

ProxyNotify.useShadowTarget = function(parts, handler, mode) {
  let newHandler = {};

  if (mode === "frozen")
    Object.freeze(parts.proxy);
  else if (mode === "sealed")
    Object.seal(parts.proxy);
  else if (mode === "prepared") {
    // Establish the list of own properties.
    const keys = Reflect.ownKeys(parts.proxy);
    keys.forEach(function(key) {
      handler.defineLazyGetter(parts.value, parts.shadowTarget, key);
    });

    /* Establish the prototype.  (I tried using a lazy getPrototypeOf,
     * but testing showed that fails a later test.)
     */
    let proto = handler.getPrototypeOf(parts.shadowTarget);
    Reflect.setPrototypeOf(parts.shadowTarget, proto);

    // Lazy preventExtensions.
    newHandler.preventExtensions = function(st) {
      var rv = handler.preventExtensions.apply(handler, [st]);
      delete newHandler.preventExtensions;
      return rv;
    };
  }
  else {
    throw new Error("useShadowTarget requires its first argument be 'frozen', 'sealed', or 'prepared'");
  }

  this.stopIteration();
  if (typeof parts.shadowTarget == "function") {
    newHandler.apply     = handler.boundMethods.apply;
    newHandler.construct = handler.boundMethods.construct;
  }
  else if (Reflect.ownKeys(newHandler).length === 0)
    newHandler = Reflect; // yay, maximum optimization

  let newParts = Proxy.revocable(parts.shadowTarget, newHandler);
  parts.proxy = newParts.proxy;
  parts.revoke = newParts.revoke;

  const cylinderMap = handler.membrane.cylinderMap;
  const cylinder = cylinderMap.get(parts.value);
  assert(cylinder instanceof ProxyCylinder,
         "Didn't get a ProxyCylinder for an existing value?");
  cylinderMap.set(parts.proxy, cylinder);
  makeRevokeDeleteRefs(parts, cylinder, handler.graphName);
};

function invokeProxyListeners(listeners, meta) {
  listeners = listeners.slice(0);
  var index = 0, exn = null, exnFound = false, stopped = false;

  Object.defineProperties(meta, {
    /**
     * Notify no more listeners.
     */
    "stopIteration": new DataDescriptor(
      () => { stopped = true; }
    ),

    "stopped": new AccessorDescriptor(
      () => stopped
    ),

    /**
     * Explicitly throw an exception from the listener, through the membrane.
     */
    "throwException": new DataDescriptor(
      function(e) { stopped = true; exnFound = true; exn = e; }
    )
  });

  Object.seal(meta);

  while (!stopped && (index < listeners.length)) {
    try {
      listeners[index](meta);
    }
    catch (e) {
      if (meta.logger) {
        /* We don't want an accidental exception to break the iteration.
        That's why the throwException() method exists:  a deliberate call means
        yes, we really want that exception to propagate outward... which is
        still nasty when you consider what a membrane is for.
        */
        try {
          meta.logger.error(e);
        }
        catch (f) {
          // really do nothing, there's no point
        }
      }
    }
    if (exnFound)
      throw exn;
    index++;
  }

  stopped = true;
}

Object.freeze(ProxyNotify);
Object.freeze(ProxyNotify.useShadowTarget);

/**
 * @package
 */
class DistortionsListener {
  constructor(membrane) {
    // private
    defineNWNCProperties(this, {
      membrane,
      proxyListener: this.proxyListener.bind(this),
      valueAndProtoMap: new Map(/*
        object or function.prototype: JSON configuration
      */),

      instanceMap: new Map(/*
          function: JSON configuration
      */),

      filterToConfigMap: new Map(/*
        function returning boolean: JSON configuration
      */),

      ignorableValues: new Set(),
    }, false);
  }

  addListener(value, category, config) {
    if ((category === "prototype") || (category === "instance"))
      value = value.prototype;

    if ((category === "prototype") || (category === "value"))
      this.valueAndProtoMap.set(value, config);
    else if (category === "iterable")
      Array.from(value).forEach((item) => this.valueAndProtoMap.set(item, config));
    else if (category === "instance")
      this.instanceMap.set(value, config);
    else if ((category === "filter") && (typeof value === "function"))
      this.filterToConfigMap.set(value, config);
    else
      throw new Error(`Unsupported category ${category} for value`);
  }

  removeListener(value, category) {
    if ((category === "prototype") || (category === "instance"))
      value = value.prototype;

    if ((category === "prototype") || (category === "value"))
      this.valueAndProtoMap.delete(value);
    else if (category === "iterable")
      Array.from(value).forEach((item) => this.valueAndProtoMap.delete(item));
    else if (category === "instance")
      this.instanceMap.delete(value);
    else if ((category === "filter") && (typeof value === "function"))
      this.filterToConfigMap.delete(value);
    else
      throw new Error(`Unsupported category ${category} for value`);
  }

  listenOnce(meta, config) {
    this.addListener(meta.target, "value", config);
    try {
      this.proxyListener(meta);
    }
    finally {
      this.removeListener(meta.target, "value");
    }
  }

  sampleConfig(isFunction) {
    const rv = {
      formatVersion: "0.8.2",
      dataVersion: "0.1",

      filterOwnKeys: false,
      proxyTraps: allTraps.slice(0),
      storeUnknownAsLocal: false,
      requireLocalDelete: false,
      useShadowTarget: false,
    };

    if (isFunction) {
      rv.truncateArgList = false;
    }
    return rv;
  }

  bindToHandler(handler) {
    if (!this.membrane.ownsHandler(handler)) {
      throw new Error("Membrane must own the first argument as an object graph handler!");
    }
    handler.addProxyListener(this.proxyListener);

    if (handler.mayReplacePassThrough)
      handler.passThroughFilter = this.passThroughFilter.bind(this);
  }

  ignorePrimordials() {
    Primordials.forEach(function(p) {
      if (p)
        this.ignorableValues.add(p);
    }, this);
  }

  /**
   * @private
   */
  getConfigurationForListener(meta) {
    let config = this.valueAndProtoMap.get(meta.target);
    if (!config) {
      let proto = Reflect.getPrototypeOf(meta.target);
      config = this.instanceMap.get(proto);
    }

    if (!config) {
      let iter, filter;
      iter = this.filterToConfigMap.entries();
      let entry = iter.next();
      while (!entry.done && !meta.stopped) {
        filter = entry.value[0];
        if (filter(meta)) {
          config = entry.value[1];
          break;
        }
        else {
          entry = iter.next();
        }
      }
    }

    return config;
  }

  applyConfiguration(config, meta) {
    const rules = this.membrane.modifyRules;
    const graphName = meta.handler.graphName;
    const modifyTarget = (meta.isOriginGraph) ? meta.target : meta.proxy;
    if (Array.isArray(config.filterOwnKeys)) {
      const filterOptions = {
        // empty, but preserved on separate lines for git blame
      };
      if (meta.originHandler)
        filterOptions.originHandler = meta.originHandler;
      if (meta.targetHandler)
        filterOptions.targetHandler = meta.targetHandler;
      rules.filterOwnKeys(
        graphName,
        modifyTarget,
        config.filterOwnKeys,
        filterOptions
      );
    }

    if (!meta.isOriginGraph && !Reflect.isExtensible(meta.target))
      Reflect.preventExtensions(meta.proxy);

    const deadTraps = allTraps.filter(function(key) {
      return !config.proxyTraps.includes(key);
    });
    rules.disableTraps(graphName, modifyTarget, deadTraps);

    if (config.storeUnknownAsLocal)
      rules.storeUnknownAsLocal(graphName, modifyTarget);

    if (config.requireLocalDelete)
      rules.requireLocalDelete(graphName, modifyTarget);

    if (("truncateArgList" in config) && (config.truncateArgList !== false))
      rules.truncateArgList(graphName, modifyTarget, config.truncateArgList);
  }

  /**
   * @private
   */
  proxyListener(meta) {
    const config = this.getConfigurationForListener(meta);
    if (config)
      this.applyConfiguration(config, meta);

    meta.stopIteration();
  }

  passThroughFilter(value) {
    return this.ignorableValues.has(value);
  }
}

Object.freeze(DistortionsListener);
Object.freeze(DistortionsListener.prototype);

/** @module source/core/ModifyRulesAPI */

class ModifyRulesAPI {
  constructor(membrane) {
    // private
    Object.defineProperty(this, "membrane", new NWNCDataDescriptor(membrane, false));
    Object.seal(this);
  }

  /**
   * Ensure that the proxy passed in matches the object graph handler.
   *
   * @param graphName  {Symbol|String} The handler's graph name.
   * @param proxy      {Proxy}  The value to look up.
   * @param methodName {String} The calling function's name.
   * 
   * @private
   */
  assertLocalProxy(graphName, proxy, methodName) {
    let [found, match] = this.membrane.getMembraneProxy(graphName, proxy);
    if (!found || (proxy !== match)) {
      throw new Error(methodName + " requires a known proxy!");
    }
  }

  /**
   * Require that new properties be stored via the proxies instead of propagated
   * through to the underlying object.
   *
   * @param graphName {Symbol|String} The graph name of the object graph handler
   *                                  the proxy uses.
   * @param proxy     {Proxy}  The proxy (or underlying object) needing local
   *                           property protection.
   */
  storeUnknownAsLocal(graphName, proxy) {
    this.assertLocalProxy(graphName, proxy, "storeUnknownAsLocal");

    let cylinder = this.membrane.cylinderMap.get(proxy);
    cylinder.setLocalFlag(graphName, "storeUnknownAsLocal", true);
  }

  /**
   * Require that properties be deleted only on the proxy instead of propagated
   * through to the underlying object.
   *
   * @param graphName {Symbol|String} The graph name of the object graph handler
   *                                  the proxy uses.
   * @param proxy     {Proxy}  The proxy (or underlying object) needing local
   *                           property protection.
   */
  requireLocalDelete(graphName, proxy) {
    this.assertLocalProxy(graphName, proxy, "requireLocalDelete");

    let cylinder = this.membrane.cylinderMap.get(proxy);
    cylinder.setLocalFlag(graphName, "requireLocalDelete", true);
  }

  /**
   * Apply a filter to the original list of own property names from an
   * underlying object.
   *
   * @note Local properties and local delete operations of a proxy are NOT
   * affected by the filters.
   *
   * @param graphName {Symbol|String} The graph name of the object graph handler
   *                                  the proxy uses.
   * @param proxy     {Proxy}    The proxy (or underlying object) needing local
   *                             property protection.
   * @param filter    {Function} The filtering function.  (May be an Array or
   *                             a Set, which becomes a whitelist filter.)
   * @see Array.prototype.filter.
   */
  filterOwnKeys(graphName, proxy, filter) {
    this.assertLocalProxy(graphName, proxy, "filterOwnKeys");

    if (Array.isArray(filter)) {
      filter = new Set(filter);
    }

    if (filter instanceof Set) {
      const s = filter;
      filter = (key) => s.has(key);
    }

    if ((typeof filter !== "function") && (filter !== null))
      throw new Error("filter must be a function, array or Set!");

    /* Defining a filter after a proxy's shadow target is not extensible
     * guarantees inconsistency.  So we must disallow that possibility.
     *
     * Note that if the proxy becomes not extensible after setting a filter,
     * that's all right.  When the proxy becomes not extensible, it then sets
     * all the proxies of the shadow target before making the shadow target not
     * extensible.
     */
    let cylinder = this.membrane.cylinderMap.get(proxy);
    let graphsToCheck;
    if (cylinder.originGraph === graphName)
    {
      graphsToCheck = Array.from(cylinder.proxyDataByGraph.keys());
      graphsToCheck.splice(graphsToCheck.indexOf(graphName), 1);
    }
    else
      graphsToCheck = [ graphName ];

    let allowed = graphsToCheck.every(function(f) {
      let s = cylinder.getShadowTarget(f);
      return Reflect.isExtensible(s);
    });

    if (allowed)
      cylinder.setOwnKeysFilter(graphName, filter);
    else
      throw new Error("filterOwnKeys cannot apply to a non-extensible proxy");
  }

  /**
   * Assign the number of arguments to truncate a method's argument list to.
   *
   * @param graphName {Symbol|String} The graph name of the object graph handler
   *                                  the proxy uses.
   * @param proxy     {Proxy(Function)} The method needing argument truncation.
   * @param value     {Boolean|Number}
   *   - if true, limit to a function's arity.
   *   - if false, do not limit at all.
   *   - if a non-negative integer, limit to that number.
   */
  truncateArgList(graphName, proxy, value) {
    this.assertLocalProxy(graphName, proxy, "truncateArgList");
    if (typeof proxy !== "function")
      throw new Error("proxy must be a function!");
    {
      const type = typeof value;
      if (type === "number") {
        if (!Number.isInteger(value) || (value < 0)) {
          throw new Error("value must be a non-negative integer or a boolean!");
        }
      }
      else if (type !== "boolean") {
        throw new Error("value must be a non-negative integer or a boolean!");
      }
    }

    let cylinder = this.membrane.cylinderMap.get(proxy);
    cylinder.setTruncateArgList(graphName, value);
  }

  /**
   * Disable traps for a given proxy.
   *
   * @param graphName {String}   The name of the object graph the proxy is part
   *                             of.
   * @param proxy     {Proxy}    The proxy to affect.
   * @param trapList  {String[]} A list of proxy (Reflect) traps to disable.
   */
  disableTraps(graphName, proxy, trapList) {
    this.assertLocalProxy(graphName, proxy, "disableTraps");
    if (!Array.isArray(trapList))
      throw new Error("Trap list must be an array of strings!");
    trapList.forEach(t => {
      if (!allTraps.includes(t)) {
        throw new Error(`Unknown trap name: ${t}`);
      }
    });

    const cylinder = this.membrane.cylinderMap.get(proxy);
    trapList.forEach(t => cylinder.setLocalFlag(graphName, `disableTrap(${t})`, true));
  }

  createDistortionsListener() {
    return new DistortionsListener(this.membrane);
  }
}
Object.seal(ModifyRulesAPI);

function AssertIsPropertyKey(propName) {
  var type = typeof propName;
  if ((type !== "string") && (type !== "symbol"))
    throw new Error("propName is not a symbol or a string!");
  return true;
}

/**
 * A proxy handler designed to return only primitives and objects in a given
 * object graph, defined by the graphName.
 *
 * @package
 */
class ObjectGraphHandler {
  constructor(membrane, graphName) {
    {
      let t = typeof graphName;
      if ((t != "string") && (t != "symbol"))
        throw new Error("graph name must be a string or a symbol!");
    }

    let boundMethods = {};
    [
      "apply",
      "construct",
    ].forEach(function(key) {
      Reflect.defineProperty(boundMethods, key, new NWNCDataDescriptor(
        this[key].bind(this), false
      ));
    }, this);
    Object.freeze(boundMethods);

    var passThroughFilter = returnFalse;

    // private
    Object.defineProperties(this, {
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

      "__isDead__": new DataDescriptor(false, true, true, true),
    });

    // private
    defineNWNCProperties(this, {
      membrane,
      graphName,

      boundMethods,

      /* Temporary until membraneGraphName is defined on Object.prototype through
      * the object graph.
      */
      graphNameDescriptor: new DataDescriptor(graphName),

      // see .defineLazyGetter, ProxyNotify for details.
      proxiesInConstruction: new WeakMap(/* original value: [callback() {}, ...]*/),

      __proxyListeners__: [],
    }, false);

    Reflect.preventExtensions(this);
  }

  /* Strategy for each handler trap:
   * (1) Determine the target's origin graph name.
   * (2) Wrap all non-primitive arguments for Reflect in the target graph.
   * (3) var rv = Reflect[trapName].call(argList);
   * (4) Wrap rv in this.graphName's graph.
   * (5) return rv.
   *
   * Error stack trace hiding will be determined by the membrane itself.
   */

  // ProxyHandler
  ownKeys(shadowTarget) {
    this.validateTrapAndShadowTarget("ownKeys", shadowTarget);
    if (!Reflect.isExtensible(shadowTarget))
      return Reflect.ownKeys(shadowTarget);

    var target = getRealTarget(shadowTarget);
    var targetCylinder = this.membrane.cylinderMap.get(target);

    // cached keys are only valid if original keys have not changed
    var cached = targetCylinder.cachedOwnKeys(this.graphName);
    if (cached) {
      let _this = targetCylinder.getOriginal();
      let check = Reflect.ownKeys(_this);

      let pass = ((check.length == cached.original.length) &&
        (check.every(function(elem) {
          return cached.original.includes(elem);
        })));
      if (pass)
        return cached.keys.slice(0);
    }
    return this.setOwnKeys(shadowTarget);
  }

  // ProxyHandler
  has(shadowTarget, propName) {
    this.validateTrapAndShadowTarget("has", shadowTarget);

    var target = getRealTarget(shadowTarget);
    /*
    http://www.ecma-international.org/ecma-262/7.0/#sec-ordinary-object-internal-methods-and-internal-slots-hasproperty-p

    1. Assert: IsPropertyKey(P) is true.
    2. Let hasOwn be ? O.[[GetOwnProperty]](P).
    3. If hasOwn is not undefined, return true.
    4. Let parent be ? O.[[GetPrototypeOf]]().
    5. If parent is not null, then
         a. Return ? parent.[[HasProperty]](P).
    6. Return false. 
    */

    // 1. Assert: IsPropertyKey(P) is true.
    AssertIsPropertyKey(propName);

    var hasOwn;
    while (target !== null) {
      let cylinder = this.membrane.cylinderMap.get(target);
      let shadow = cylinder.getShadowTarget(this.graphName);
      hasOwn = this.getOwnPropertyDescriptor(shadow, propName);
      if (typeof hasOwn !== "undefined")
        return true;
      target = this.getPrototypeOf(shadow);
      if (target === null)
        break;
      let foundProto;
      [foundProto, target] = this.membrane.getMembraneValue(
        this.graphName,
        target
      );
      assert(foundProto, "Must find membrane value for prototype");
    }
    return false;
  }

  // ProxyHandler
  get(shadowTarget, propName, receiver) {
    this.validateTrapAndShadowTarget("get", shadowTarget);

    var desc, target, found, rv;
    target = getRealTarget(shadowTarget);

    /*
    http://www.ecma-international.org/ecma-262/7.0/#sec-ordinary-object-internal-methods-and-internal-slots-get-p-receiver

    1. Assert: IsPropertyKey(P) is true.
    2. Let desc be ? O.[[GetOwnProperty]](P).
    3. If desc is undefined, then
         a. Let parent be ? O.[[GetPrototypeOf]]().
         b. If parent is null, return undefined.
         c. Return ? parent.[[Get]](P, Receiver).
    4. If IsDataDescriptor(desc) is true, return desc.[[Value]].
    5. Assert: IsAccessorDescriptor(desc) is true.
    6. Let getter be desc.[[Get]].
    7. If getter is undefined, return undefined.
    8. Return ? Call(getter, Receiver). 
     */


    // 1. Assert: IsPropertyKey(P) is true.
    // Optimization:  do this once!
    AssertIsPropertyKey(propName);

    /* Optimization:  Recursively calling this.get() is a pain in the neck,
     * especially for the stack trace.  So let's use a do...while loop to reset
     * only the entry arguments we need (specifically, target).
     * We should exit the loop with desc, or return from the function.
     */
    do {
      let targetCylinder = this.membrane.cylinderMap.get(target);
      {
        /* Special case:  Look for a local property descriptors first, and if we
         * find it, return it unwrapped.
         */
        desc = targetCylinder.getLocalDescriptor(this.graphName, propName);

        if (desc) {
          // Quickly repeating steps 4-8 from above algorithm.
          if (isDataDescriptor(desc))
            return desc.value;
          if (!isAccessorDescriptor(desc))
            throw new Error("desc must be a data descriptor or an accessor descriptor!");
          let type = typeof desc.get;
          if (type === "undefined")
            return undefined;
          if (type !== "function")
            throw new Error("getter is not a function");
          return Reflect.apply(desc.get, receiver, []);
        }
      }

      /*
      2. Let desc be ? O.[[GetOwnProperty]](P).
      3. If desc is undefined, then
           a. Let parent be ? O.[[GetPrototypeOf]]().
           b. If parent is null, return undefined.
           c. Return ? parent.[[Get]](P, Receiver).
       */
      let shadow = targetCylinder.getShadowTarget(this.graphName);
      if (shadow)
        desc = this.getOwnPropertyDescriptor(shadow, propName);
      else
        desc = Reflect.getOwnPropertyDescriptor(target, propName);

      if (!desc) {
        let proto = this.getPrototypeOf(shadow);
        if (proto === null)
          return undefined;

        {
          let foundProto, other;
          [foundProto, other] = this.membrane.getMembraneProxy(
            this.graphName,
            proto
          );
          if (!foundProto)
            return Reflect.get(proto, propName, receiver);
          assert(other === proto, "Retrieved prototypes must match");
        }

        if (Reflect.isExtensible(shadow))
        {
          target = this.membrane.getMembraneValue(
            this.graphName,
            proto
          )[1];
        }
        else
          target = proto;
      }
    } while (!desc);

    found = false;
    rv = undefined;

    // 4. If IsDataDescriptor(desc) is true, return desc.[[Value]].
    if (isDataDescriptor(desc)) {
      rv = desc.value;
      found = true;
      if (!desc.configurable && !desc.writable)
        return rv;
    }

    if (!found) {
      // 5. Assert: IsAccessorDescriptor(desc) is true.

      if (!isAccessorDescriptor(desc))
        throw new Error("desc must be a data descriptor or an accessor descriptor!");

      // 6. Let getter be desc.[[Get]].
      var getter = desc.get;

      /*
      7. If getter is undefined, return undefined.
      8. Return ? Call(getter, Receiver). 
       */
      {
        let type = typeof getter;
        if (type === "undefined")
          return undefined;
        if (type !== "function")
          throw new Error("getter is not a function");
        rv = Reflect.apply(getter, receiver, []);
        found = true;
      }
    }

    if (!found) {
      // end of the algorithm
      throw new Error("Membrane fall-through: we should not get here");
    }

    return rv;
  }

  // ProxyHandler
  getOwnPropertyDescriptor(shadowTarget, propName) {
    this.validateTrapAndShadowTarget("getOwnPropertyDescriptor", shadowTarget);

    const mayLog = this.membrane.__mayLog__();
    if (mayLog) {
      this.membrane.logger.debug("propName: " + propName.toString());
    }
    var target = getRealTarget(shadowTarget);
    {
      let [found, unwrapped] = this.membrane.getMembraneValue(this.graphName, target);
      assert(found, "Original target must be found after calling getRealTarget");
      assert(unwrapped === target, "Original target must match getMembraneValue's return value");
    }
    var targetCylinder = this.membrane.cylinderMap.get(target);

    if (this.membrane.showGraphName && (propName == "membraneGraphName")) {
      let checkDesc = Reflect.getOwnPropertyDescriptor(shadowTarget, propName);
      if (checkDesc && !checkDesc.configurable)
        return checkDesc;
      return this.graphNameDescriptor;
    }

    try {
      /* Order of operations:
       * (1) locally deleted property:  undefined
       * (2) locally set property:  the property
       * (3) own keys filtered property: undefined
       * (4) original property:  wrapped property.
       */
      if (targetCylinder.wasDeletedLocally(targetCylinder.originGraph, propName) ||
          targetCylinder.wasDeletedLocally(this.graphName, propName))
        return undefined;

      var desc = targetCylinder.getLocalDescriptor(this.graphName, propName);
      if (desc !== undefined)
        return desc;

      {
        let originFilter = targetCylinder.getOwnKeysFilter(targetCylinder.originGraph);
        if (originFilter && !originFilter(propName))
          return undefined;
      }
      {
        let localFilter  = targetCylinder.getOwnKeysFilter(this.graphName);
        if (localFilter && !localFilter(propName))
          return undefined;
      }

      var _this = targetCylinder.getOriginal();
      desc = Reflect.getOwnPropertyDescriptor(_this, propName);

      // See .getPrototypeOf trap comments for why this matters.
      const isProtoDesc = (propName === "prototype") && isDataDescriptor(desc);
      const isForeign = ((desc !== undefined) &&
                         (targetCylinder.originGraph !== this.graphName));
      if (isProtoDesc || isForeign) {
        // This is necessary to force desc.value to really be a proxy.
        let configurable = desc.configurable;
        desc.configurable = true;
        desc = this.membrane.wrapDescriptor(
          targetCylinder.originGraph, this.graphName, desc
        );
        desc.configurable = configurable;
      }

      // Non-configurable descriptors must apply on the actual proxy target.
      if (desc && !desc.configurable) {
        let current = Reflect.getOwnPropertyDescriptor(shadowTarget, propName);
        let attempt = Reflect.defineProperty(shadowTarget, propName, desc);
        assert(!current || attempt,
               "Non-configurable descriptors must apply on the actual proxy target.");
      }

      // If a shadow target has a non-configurable descriptor, we must return it.
      /* XXX ajvincent It's unclear why this block couldn't go earlier in this
       * function.  There's either a bug here, or a gap in my own understanding.
       */
      {
        let shadowDesc = Reflect.getOwnPropertyDescriptor(shadowTarget, propName);
        if (shadowDesc)
          return shadowDesc;
      }

      return desc;
    }
    catch (e) {
      if (mayLog) {
        this.membrane.logger.error(e.message, e.stack);
      }
      throw e;
    }
  }

  // ProxyHandler
  getPrototypeOf(shadowTarget) {
    this.validateTrapAndShadowTarget("getPrototypeOf", shadowTarget);

    /* Prototype objects are special in JavaScript, but with proxies there is a
     * major drawback.  If the prototype property of a function is
     * non-configurable on the proxy target, the proxy is required to return the
     * proxy target's actual prototype property instead of a wrapper.  You might
     * think "just store the wrapped prototype on the shadow target," and maybe
     * that would work.
     *
     * The trouble arises when you have multiple objects sharing the same
     * prototype object (either through .prototype on functions or through
     * Reflect.getPrototypeOf on ordinary objects).  Some of them may be frozen,
     * others may be sealed, still others not.  The point is .getPrototypeOf()
     * doesn't have a non-configurability requirement to exactly match the way
     * the .prototype property lookup does.
     *
     * It's also for this reason that getPrototypeOf and setPrototypeOf were
     * completely rewritten to more directly use the real prototype chain.
     *
     * One more thing:  it is a relatively safe practice to use a proxy to add,
     * remove or modify individual properties, and ModifyRulesAPI.js supports
     * that in several flavors.  It is doable, but NOT safe, to alter the
     * prototype chain in such a way that breaks the perfect mirroring between
     * object graphs.  Thus, this membrane code will never directly support that
     * as an option.
     *
     * XXX ajvincent update this comment after fixing #76 to specify how the
     * user will extract the shadow target.
     */
    const target = getRealTarget(shadowTarget);
    const targetCylinder = this.membrane.cylinderMap.get(target);

    try {
      const proto = Reflect.getPrototypeOf(target);
      let proxy;
      if (targetCylinder.originGraph !== this.graphName)
        proxy = this.membrane.convertArgumentToProxy(
          this.membrane.getHandlerByName(targetCylinder.originGraph),
          this,
          proto
        );
      else
        proxy = proto;

      let cylinder = this.membrane.cylinderMap.get(proxy);
      if (cylinder && (cylinder.originGraph !== this.graphName)) {
        assert(Reflect.setPrototypeOf(shadowTarget, proxy),
               "shadowTarget could not receive prototype?");
      }
      return proxy;
    }
    catch (e) {
      if (this.membrane.__mayLog__()) {
        this.membrane.logger.error(e.message, e.stack);
      }
      throw e;
    }
  }

  // ProxyHandler
  isExtensible(shadowTarget) {
    this.validateTrapAndShadowTarget("isExtensible", shadowTarget);

    if (!Reflect.isExtensible(shadowTarget))
      return false;
    var target = getRealTarget(shadowTarget);
    var shouldBeLocal = this.getLocalFlag(target, "storeUnknownAsLocal", true);
    if (shouldBeLocal)
      return true;
    
    var targetCylinder = this.membrane.cylinderMap.get(target);
    var _this = targetCylinder.getOriginal();

    var rv = Reflect.isExtensible(_this);

    if (!rv)
      // This is our one and only chance to set properties on the shadow target.
      this.lockShadowTarget(shadowTarget);

    return rv;
  }

  // ProxyHandler
  preventExtensions(shadowTarget) {
    this.validateTrapAndShadowTarget("preventExtensions", shadowTarget);

    var target = getRealTarget(shadowTarget);
    var targetCylinder = this.membrane.cylinderMap.get(target);
    var _this = targetCylinder.getOriginal();

    // Walk the prototype chain to look for shouldBeLocal.
    var shouldBeLocal = this.getLocalFlag(target, "storeUnknownAsLocal", true);

    if (!shouldBeLocal && !this.isExtensible(shadowTarget))
      return true;

    // This is our one and only chance to set properties on the shadow target.
    var rv = this.lockShadowTarget(shadowTarget);

    if (!shouldBeLocal)
      rv = Reflect.preventExtensions(_this);
    return rv;
  }

  // ProxyHandler
  deleteProperty(shadowTarget, propName) {
    this.validateTrapAndShadowTarget("deleteProperty", shadowTarget);

    var target = getRealTarget(shadowTarget);
    const mayLog = this.membrane.__mayLog__();
    if (mayLog) {
      this.membrane.logger.debug("propName: " + propName.toString());
    }

    /*
    http://www.ecma-international.org/ecma-262/7.0/#sec-ordinarydelete

    Assert: IsPropertyKey(P) is true.
    Let desc be ? O.[[GetOwnProperty]](P).
    If desc is undefined, return true.
    If desc.[[Configurable]] is true, then
        Remove the own property with name P from O.
        Return true.
    Return false. 
    */

    // 1. Assert: IsPropertyKey(P) is true.
    AssertIsPropertyKey(propName);
    var targetCylinder, shouldBeLocal;

    try {
      targetCylinder = this.membrane.cylinderMap.get(target);
      shouldBeLocal = this.requiresDeletesBeLocal(target);

      if (!shouldBeLocal) {
        /* See .defineProperty trap for why.  Basically, if the property name
         * is blacklisted, we should treat it as if the property doesn't exist
         * on the original target.  The spec says if GetOwnProperty returns
         * undefined (which it will for our proxy), we should return true.
         */
        let originFilter = targetCylinder.getOwnKeysFilter(targetCylinder.originGraph);
        let localFilter  = targetCylinder.getOwnKeysFilter(this.graphName);
        if (originFilter || localFilter)
          this.membrane.warnOnce(this.membrane.constants.warnings.FILTERED_KEYS_WITHOUT_LOCAL);
        if (originFilter && !originFilter(propName))
          return true;
        if (localFilter && !localFilter(propName))
          return true;
      }
    }
    catch (e) {
      if (mayLog) {
        this.membrane.logger.error(e.message, e.stack);
      }
      throw e;
    }

    let desc = this.getOwnPropertyDescriptor(shadowTarget, propName);
    if (!desc)
      return true;

    if (!desc.configurable)
      return false;

    try {
      targetCylinder.deleteLocalDescriptor(this.graphName, propName, shouldBeLocal);

      if (!shouldBeLocal) {
        var _this = targetCylinder.getOriginal();
        Reflect.deleteProperty(_this, propName);
      }

      Reflect.deleteProperty(shadowTarget, propName);
      this.setOwnKeys(shadowTarget);

      return true;
    }
    catch (e) {
      if (mayLog) {
        this.membrane.logger.error(e.message, e.stack);
      }
      throw e;
    }
  }

  /**
   * Define a property on a target.
   *
   * @param {Object}  target        The target object.
   * @param {String}  propName      The name of the property to define.
   * @param {Object}  desc          The descriptor for the property being defined
   *                                or modified.
   * @param {Boolean} shouldBeLocal True if the property must be defined only
   *                                on the proxy (versus carried over to the
   *                                actual target).
   *
   * @note This is a ProxyHandler trap for defineProperty, modified to include 
   *       the shouldBeLocal argument.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/defineProperty
   */
  defineProperty(shadowTarget, propName, desc, shouldBeLocal) {
    this.validateTrapAndShadowTarget("defineProperty", shadowTarget);

    var target = getRealTarget(shadowTarget);
    /* Regarding the funny indentation:  With long names such as defineProperty,
     * inGraphHandler, and shouldBeLocal, it's hard to make everything fit
     * within 80 characters on a line, and properly indent only two spaces.
     * I choose descriptiveness and preserving commit history over reformatting.
     */
    const mayLog = this.membrane.__mayLog__();
    if (mayLog) {
      this.membrane.logger.debug("propName: " + propName.toString());
    }

    if (this.membrane.showGraphName && (propName == "membraneGraphName")) {
      return Reflect.defineProperty(shadowTarget, propName, desc);
    }

    try {
      var targetCylinder = this.membrane.cylinderMap.get(target);
      var _this = targetCylinder.getOriginal();

      if (!shouldBeLocal) {
        // Walk the prototype chain to look for shouldBeLocal.
        shouldBeLocal = this.getLocalFlag(target, "storeUnknownAsLocal", true);
      }

      var rv, originFilter, localFilter;

      {
        /* It is dangerous to have an ownKeys filter and define a non-local
         * property.  It will work when the property name passes through the
         * filters.  But when that property name is not permitted, then we can
         * get some strange side effects.
         *
         * Specifically, if the descriptor's configurable property is set to
         * false, either the shadow target must get the property, or an
         * exception is thrown.
         *
         * If the descriptor's configurable property is true, the ECMAScript
         * specification doesn't object...
         *
         * In either case, the property would be set, but never retrievable.  I
         * think this is fundamentally a bad thing, so I'm going to play it safe
         * and return false here, denying the property being set on either the
         * proxy or the protected target.
         */
        originFilter = targetCylinder.getOwnKeysFilter(targetCylinder.originGraph);
        localFilter  = targetCylinder.getOwnKeysFilter(this.graphName);
        if (originFilter || localFilter)
          this.membrane.warnOnce(this.membrane.constants.warnings.FILTERED_KEYS_WITHOUT_LOCAL);
      }

      if (shouldBeLocal) {
        if (!Reflect.isExtensible(shadowTarget))
          return Reflect.defineProperty(shadowTarget, propName, desc);

        let hasOwn = true;

        // Own-keys filters modify hasOwn.
        if (hasOwn && originFilter && !originFilter(propName))
          hasOwn = false;
        if (hasOwn && localFilter && !localFilter(propName))
          hasOwn = false;

        // It's probably more expensive to look up a property than to filter the name.
        if (hasOwn)
          hasOwn = Boolean(Reflect.getOwnPropertyDescriptor(_this, propName));

        if (!hasOwn && desc) {
          rv = targetCylinder.setLocalDescriptor(this.graphName, propName, desc);
          if (rv)
            this.setOwnKeys(shadowTarget); // fix up property list
          if (!desc.configurable)
            Reflect.defineProperty(shadowTarget, propName, desc);
          return rv;
        }
        else {
          targetCylinder.deleteLocalDescriptor(this.graphName, propName, false);
          // fall through to Reflect's defineProperty
        }
      }
      else {
        if (originFilter && !originFilter(propName))
          return false;
        if (localFilter && !localFilter(propName))
          return false;
      }

      if (desc !== undefined) {
        desc = this.membrane.wrapDescriptor(
          this.graphName,
          targetCylinder.originGraph,
          desc
        );
      }

      rv = Reflect.defineProperty(_this, propName, desc);
      if (rv) {
        targetCylinder.unmaskDeletion(this.graphName, propName);
        this.setOwnKeys(shadowTarget); // fix up property list

        if (!desc.configurable)
          Reflect.defineProperty(shadowTarget, propName, desc);
      }
      return rv;
    }
    catch (e) {
      if (mayLog) {
        this.membrane.logger.error(e.message, e.stack);
      }
      throw e;
    }
  }

  // ProxyHandler
  set(shadowTarget, propName, value, receiver) {
    this.validateTrapAndShadowTarget("set", shadowTarget);

    const mayLog = this.membrane.__mayLog__();
    if (mayLog) {
      this.membrane.logger.debug("set propName: " + propName);
    }
    let target = getRealTarget(shadowTarget);

    /*
    http://www.ecma-international.org/ecma-262/7.0/#sec-ordinary-object-internal-methods-and-internal-slots-set-p-v-receiver

    1. Assert: IsPropertyKey(P) is true.
    2. Let ownDesc be ? O.[[GetOwnProperty]](P).
    3. If ownDesc is undefined, then
        a. Let parent be ? O.[[GetPrototypeOf]]().
        b. If parent is not null, then
            i.   Return ? parent.[[Set]](P, V, Receiver).
        c. Else,
            i.   Let ownDesc be the PropertyDescriptor{
                   [[Value]]: undefined,
                   [[Writable]]: true,
                   [[Enumerable]]: true,
                   [[Configurable]]: true
                 }.
    4. If IsDataDescriptor(ownDesc) is true, then
        a. If ownDesc.[[Writable]] is false, return false.
        b. If Type(Receiver) is not Object, return false.
        c. Let existingDescriptor be ? Receiver.[[GetOwnProperty]](P).
        d. If existingDescriptor is not undefined, then
            i.   If IsAccessorDescriptor(existingDescriptor) is true, return false.
            ii.  If existingDescriptor.[[Writable]] is false, return false.
            iii. Let valueDesc be the PropertyDescriptor{[[Value]]: V}.
            iv.  Return ? Receiver.[[DefineOwnProperty]](P, valueDesc).
        e. Else Receiver does not currently have a property P,
            i.   Return ? CreateDataProperty(Receiver, P, V).
    5. Assert: IsAccessorDescriptor(ownDesc) is true.
    6. Let setter be ownDesc.[[Set]].
    7. If setter is undefined, return false.
    8. Perform ? Call(setter, Receiver, « V »).
    9. Return true. 
    */

    /* Optimization:  Recursively calling this.set() is a pain in the neck,
     * especially for the stack trace.  So let's use a do...while loop to reset
     * only the entry arguments we need (specifically, shadowTarget, target).
     * We should exit the loop with desc, or return from the function.
     */

    // 1. Assert: IsPropertyKey(P) is true.
    AssertIsPropertyKey(propName);

    var ownDesc,
        shouldBeLocal = this.getLocalFlag(target, "storeUnknownAsLocal", true);

    //eslint-disable-next-line no-constant-condition
    while (true) {
      /*
      2. Let ownDesc be ? O.[[GetOwnProperty]](P).
      3. If ownDesc is undefined, then
          a. Let parent be ? O.[[GetPrototypeOf]]().
          b. If parent is not null, then
              i.   Return ? parent.[[Set]](P, V, Receiver).
          c. Else,
              i.   Let ownDesc be the PropertyDescriptor{
                     [[Value]]: undefined,
                     [[Writable]]: true,
                     [[Enumerable]]: true,
                     [[Configurable]]: true
                   }.
      */

      let cylinder = this.membrane.cylinderMap.get(target);
      let shadow;
      if (cylinder.originGraph === this.graphName) {
        shadow = cylinder.getOriginal();
        ownDesc = Reflect.getOwnPropertyDescriptor(cylinder.getOriginal(), propName);
      }
      else {
        shadow = cylinder.getShadowTarget(this.graphName);
        assert(shadow, "No shadow target?");
        ownDesc = this.getOwnPropertyDescriptor(shadow, propName);
      }

      if (ownDesc)
        break;

      {
        let proto = (cylinder.originGraph === this.graphName) ?
                    Reflect.getPrototypeOf(shadow) :
                    this.getPrototypeOf(shadow);
        if (proto === null) {
          ownDesc = new DataDescriptor(undefined, true);
          break;
        }

        let found = this.membrane.getMembraneProxy(
          this.graphName,
          proto
        )[0];
        assert(found, "Must find membrane proxy for prototype");
        let protoCylinder = this.membrane.cylinderMap.get(proto);
        assert(protoCylinder, "Missing a ProxyCylinder?");

        if (protoCylinder.originGraph != this.graphName) {
          [found, target] = this.membrane.getMembraneValue(
            this.graphName,
            proto
          );
          assert(found, "Must find membrane value for prototype");
        }
        else
        {
          target = proto;
        }
      }
    } // end optimization for ownDesc

    // Special step:  convert receiver to unwrapped value.
    let receiverMap = this.membrane.cylinderMap.get(receiver);
    if (!receiverMap) {
      // We may be under construction.
      let proto = Object.getPrototypeOf(receiver);
      let protoMap = this.membrane.cylinderMap.get(proto);
      let pHandler = this.membrane.getHandlerByName(protoMap.originGraph);

      if (this.membrane.cylinderMap.has(receiver)) {
        /* XXX ajvincent If you're stepping through in a debugger, the debugger
         * may have set this.membrane.cylinderMap.get(receiver) between actions.
         * This is a true Heisenbug, where observing the behavior changes the
         * behavior.
         *
         * Therefore YOU MUST STEP OVER THE FOLLOWING LINE!  DO NOT STEP IN!
         * DO NOT FOOL AROUND WITH THE DEBUGGER, JUST STEP OVER!!!
         */
        this.membrane.convertArgumentToProxy(pHandler, this, receiver, {override: true});
      }
      else {
        this.membrane.convertArgumentToProxy(pHandler, this, receiver);
      }

      receiverMap = this.membrane.cylinderMap.get(receiver);
      if (!receiverMap)
        throw new Error("How do we still not have a receiverMap?");
      if (receiverMap.originGraph === this.graphName)
        throw new Error("Receiver's graph name should not match!");
    }

    /*
    4. If IsDataDescriptor(ownDesc) is true, then
        a. If ownDesc.[[Writable]] is false, return false.
        b. If Type(Receiver) is not Object, return false.
        c. Let existingDescriptor be ? Receiver.[[GetOwnProperty]](P).
        d. If existingDescriptor is not undefined, then
            i.   If IsAccessorDescriptor(existingDescriptor) is true, return false.
            ii.  If existingDescriptor.[[Writable]] is false, return false.
            iii. Let valueDesc be the PropertyDescriptor{[[Value]]: V}.
            iv.  Return ? Receiver.[[DefineOwnProperty]](P, valueDesc).
        e. Else Receiver does not currently have a property P,
            i.   Return ? CreateDataProperty(Receiver, P, V).
    */
    if (isDataDescriptor(ownDesc)) {
      if (!ownDesc.writable || (valueType(receiver) == "primitive"))
        return false;

      let origReceiver = receiverMap.getOriginal();
      let existingDesc = Reflect.getOwnPropertyDescriptor(origReceiver, propName);
      if (existingDesc !== undefined) {
        if (isAccessorDescriptor(existingDesc) || !existingDesc.writable)
          return false;
      }

      let rvProxy;
      if (!shouldBeLocal && (receiverMap.originGraph !== this.graphName)) {
        rvProxy = new DataDescriptor(
          // Only now do we convert the value to the target object graph.
          this.membrane.convertArgumentToProxy(
            this,
            this.membrane.getHandlerByName(receiverMap.originGraph),
            value
          ),
          true
        );
      }
      else {
        rvProxy = new DataDescriptor(value, true);
      }

      if (!ownDesc.configurable)
      {
        rvProxy.configurable = false;
        rvProxy.enumerable = ownDesc.enumerable;
      }

      return this.defineProperty(
        this.getShadowTarget(receiver),
        propName,
        rvProxy,
        shouldBeLocal
      );
    }

    // 5. Assert: IsAccessorDescriptor(ownDesc) is true.
    if (!isAccessorDescriptor(ownDesc))
      throw new Error("ownDesc must be a data descriptor or an accessor descriptor!");

    /*
    6. Let setter be ownDesc.[[Set]].
    7. If setter is undefined, return false.
    */
    let setter = ownDesc.set;
    if (typeof setter === "undefined")
      return false;

    if (!this.membrane.hasProxyForValue(this.graphName, setter))
      this.membrane.addPartsToCylinder(this, setter);

    // 8. Perform ? Call(setter, Receiver, « V »).

    if (!shouldBeLocal) {
      // Only now do we convert the value to the target object graph.
      let rvProxy = this.membrane.convertArgumentToProxy(
        this,
        this.membrane.getHandlerByName(receiverMap.originGraph),
        value
      );

      const shadow = this.getShadowTarget(setter);
      if (shadow)
        this.apply(this.getShadowTarget(setter), receiver, [ rvProxy ]);
      else
        Reflect.apply(setter, receiver, [ rvProxy ]);

    }
    else {
      this.defineProperty(
        this.getShadowTarget(receiver),
        propName,
        new DataDescriptor(value),
        shouldBeLocal
      );
    }

    // 9. Return true.
    return true;
  }

  // ProxyHandler
  setPrototypeOf(shadowTarget, proto) {
    this.validateTrapAndShadowTarget("setPrototypeOf", shadowTarget);

    var target = getRealTarget(shadowTarget);
    try {
      var targetCylinder = this.membrane.cylinderMap.get(target);
      var _this = targetCylinder.getOriginal();

      let protoProxy, wrappedProxy, found;
      if (targetCylinder.originGraph !== this.graphName) {
        protoProxy = this.membrane.convertArgumentToProxy(
          this,
          this.membrane.getHandlerByName(targetCylinder.originGraph),
          proto
        );
        [found, wrappedProxy] = this.membrane.getMembraneProxy(
          this.graphName, proto
        );
        assert(found, "Membrane proxy not found immediately after wrapping!");
      }
      else {
        protoProxy = proto;
        wrappedProxy = proto;
      }

      var rv = Reflect.setPrototypeOf(_this, protoProxy);
      if (rv)
        assert(Reflect.setPrototypeOf(shadowTarget, wrappedProxy),
               "shadowTarget could not receive prototype?");

      return rv;
    }
    catch (e) {
      const mayLog = this.membrane.__mayLog__();
      if (mayLog) {
        this.membrane.logger.error(e.message, e.stack);
      }
      throw e;
    }
  }

  // ProxyHandler
  apply(shadowTarget, thisArg, argumentsList) {
    this.validateTrapAndShadowTarget("apply", shadowTarget);

    var target = getRealTarget(shadowTarget);
    var _this, args = [];
    let targetCylinder  = this.membrane.cylinderMap.get(target);
    let argHandler = this.membrane.getHandlerByName(targetCylinder.originGraph);

    const mayLog = this.membrane.__mayLog__();
    if (mayLog) {
      this.membrane.logger.debug([
        "apply originGraphs: inbound = ",
        argHandler.graphName,
        ", outbound = ",
        this.graphName
      ].join(""));
    }

    argumentsList = this.truncateArguments(target, argumentsList);

    // This is where we are "counter-wrapping" an argument.
    const optionsBase = Object.seal({
      callable: target,
      trapName: "apply"
    });

    if (targetCylinder.originGraph !== this.graphName) {
      _this = this.membrane.convertArgumentToProxy(
        this,
        argHandler,
        thisArg,
        Object.create(optionsBase, { "isThis": new DataDescriptor(true) })
      );

      for (let i = 0; i < argumentsList.length; i++) {
        let nextArg = argumentsList[i];
        nextArg = this.membrane.convertArgumentToProxy(
          this,
          argHandler,
          nextArg,
          Object.create(optionsBase, { "argIndex": new DataDescriptor(i) })
        );
        args.push(nextArg);
      }
    }
    else {
      _this = thisArg;
      args = argumentsList.slice(0);
    }

    if (mayLog) {
      this.membrane.logger.debug("apply about to call function");
    }

    var rv = Reflect.apply(target, _this, args);

    if (mayLog) {
      this.membrane.logger.debug("apply wrapping return value");
    }

    if (targetCylinder.originGraph !== this.graphName)
      rv = this.membrane.convertArgumentToProxy(
        argHandler,
        this,
        rv
      );

    if (mayLog) {
      this.membrane.logger.debug("apply exiting");
    }
    return rv;
  }

  // ProxyHandler
  construct(shadowTarget, argumentsList, ctorTarget) {
    this.validateTrapAndShadowTarget("construct", shadowTarget);

    var target = getRealTarget(shadowTarget);
    var args = [];
    let targetCylinder  = this.membrane.cylinderMap.get(target);
    let argHandler = this.membrane.getHandlerByName(targetCylinder.originGraph);

    const mayLog = this.membrane.__mayLog__();
    if (mayLog) {
      this.membrane.logger.debug([
        "construct originGraphs: inbound = ",
        argHandler.graphName,
        ", outbound = ",
        this.graphName
      ].join(""));
    }

    argumentsList = this.truncateArguments(target, argumentsList);

    // This is where we are "counter-wrapping" an argument.
    const optionsBase = Object.seal({
      callable: target,
      trapName: "construct"
    });

    for (let i = 0; i < argumentsList.length; i++) {
      let nextArg = argumentsList[i];
      nextArg = this.membrane.convertArgumentToProxy(
        this,
        argHandler,
        nextArg,
        Object.create(optionsBase, { "argIndex": new DataDescriptor(i) })
      );
      args.push(nextArg);

      if (mayLog && (valueType(nextArg) != "primitive")) {
        this.membrane.logger.debug("construct argument " + i + "'s membraneGraphName: " + nextArg.membraneGraphName);
      }
    }

    const ctor = this.membrane.convertArgumentToProxy(
      this,
      argHandler,
      ctorTarget
    );

    var rv = Reflect.construct(target, args, ctor);

    rv = this.membrane.convertArgumentToProxy(
      argHandler,
      this,
      rv
    );

    if (mayLog) {
      this.membrane.logger.debug("construct exiting");
    }
    return rv;
  }

  /**
   * Ensure the first argument is a known shadow target.
   *
   * @param {String} trapName     The name of the trap to run.
   * @param {Object} shadowTarget The supposed target.
   * @private
   */
  validateTrapAndShadowTarget(trapName, shadowTarget) {
    const target = getRealTarget(shadowTarget);
    const targetCylinder = this.membrane.cylinderMap.get(target);
    if (!(targetCylinder instanceof ProxyCylinder))
      throw new Error("No ProxyCylinder found for shadow target!");

    if (!targetCylinder.isShadowTarget(shadowTarget)) {
      throw new Error(
        "ObjectGraphHandler traps must be called with a shadow target!"
      );
    }
    const disableTrapFlag = `disableTrap(${trapName})`;
    if (targetCylinder.getLocalFlag(this.graphName, disableTrapFlag) ||
        targetCylinder.getLocalFlag(targetCylinder.originGraph, disableTrapFlag))
      throw new Error(`The ${trapName} trap is not executable.`);
  }

  /**
   * Get the shadow target associated with a real value.
   *
   * @private
   */
  getShadowTarget(target) {
    let targetCylinder = this.membrane.cylinderMap.get(target);
    return targetCylinder.getShadowTarget(this.graphName);
  }

  /**
   * Ensure a value has been wrapped in the membrane (and is available for distortions)
   *
   * @param target {Object} The value to wrap.
   *
   * @package
   */
  ensureProxyCylinder(target) {
    if (!this.membrane.hasProxyForValue(this.graphName, target))
      this.membrane.addPartsToCylinder(this, target);
  }
  
  /**
   * Add a listener for new proxies.
   *
   * @see ProxyNotify
   */
  addProxyListener(listener) {
    if (typeof listener != "function")
      throw new Error("listener is not a function!");
    if (!this.__proxyListeners__.includes(listener))
      this.__proxyListeners__.push(listener);
  }

  /**
   * Remove a listener for new proxies.
   *
   * @see ProxyNotify
   */
  removeProxyListener(listener) {
    let index = this.__proxyListeners__.indexOf(listener);
    if (index == -1)
      throw new Error("listener is not registered!");
    this.__proxyListeners__.splice(index, 1);
  }

  /**
   * Set all properties on a shadow target, including prototype, and seal it.
   *
   * @private
   */
  lockShadowTarget(shadowTarget) {
    const target = getRealTarget(shadowTarget);
    const targetCylinder = this.membrane.cylinderMap.get(target);
    const _this = targetCylinder.getOriginal();
    const keys = this.setOwnKeys(shadowTarget);
    keys.forEach(function(propName) {
      if (this.membrane.showGraphName && (propName == "membraneGraphName")) {
        // Special case.
        Reflect.defineProperty(
          shadowTarget, propName, this.graphNameDescriptor
        );
      }
      else
        this.defineLazyGetter(_this, shadowTarget, propName);

      // We want to trigger the lazy getter so that the property can be sealed.
      void(Reflect.get(shadowTarget, propName));
    }, this);

    // fix the prototype;
    const proto = this.getPrototypeOf(shadowTarget);
    assert(Reflect.setPrototypeOf(shadowTarget, proto),
           "Failed to set unwrapped prototype on non-extensible?");
    return Reflect.preventExtensions(shadowTarget);
  }

  /**
   * Specify the list of ownKeys this proxy exposes.
   *
   * @param {Object} shadowTarget The proxy target
   * @private
   *
   * @returns {String[]} The list of exposed keys.
   */
  setOwnKeys(shadowTarget) {
    var target = getRealTarget(shadowTarget);
    var targetCylinder = this.membrane.cylinderMap.get(target);
    var _this = targetCylinder.getOriginal();

    // First, get the underlying object's key list, forming a base.
    var originalKeys = Reflect.ownKeys(_this);

    // Remove duplicated names and keys that have been deleted.
    {
      let mustSkip = new Set();
      targetCylinder.appendDeletedNames(targetCylinder.originGraph, mustSkip);
      targetCylinder.appendDeletedNames(this.graphName, mustSkip);

      let originFilter = targetCylinder.getOwnKeysFilter(targetCylinder.originGraph);
      let localFilter  = targetCylinder.getOwnKeysFilter(this.graphName);

      if ((mustSkip.size > 0) || originFilter || localFilter) {
        originalKeys = originalKeys.filter(function(elem) {
          if (mustSkip.has(elem))
            return false;
          if (originFilter && !originFilter.apply(this, arguments))
            return false;
          if (localFilter && !localFilter.apply(this, arguments))
            return false;
          return true;
        });
      }
    }

    // Append the local proxy keys.
    var rv;
    {
      let originExtraKeys = targetCylinder.localOwnKeys(targetCylinder.originGraph);
      let targetExtraKeys = targetCylinder.localOwnKeys(this.graphName);
      let known = new Set(originalKeys);
      let f = function(key) {
        if (known.has(key))
          return false;
        known.add(key);
        return true;
      };
      originExtraKeys = originExtraKeys.filter(f);
      targetExtraKeys = targetExtraKeys.filter(f);
      rv = originalKeys.concat(originExtraKeys, targetExtraKeys);
    }

    if (this.membrane.showGraphName && !rv.includes("membraneGraphName")) {
      rv.push("membraneGraphName");
    }

    // Optimization, storing the generated key list for future retrieval.
    targetCylinder.setCachedOwnKeys(this.graphName, rv, originalKeys);

    {
      /* Give the shadow target any non-configurable keys it needs.
         @see http://www.ecma-international.org/ecma-262/7.0/#sec-proxy-object-internal-methods-and-internal-slots-ownpropertykeys
         This code tries to fix steps 17 and 19.
      */

      // trap == rv, in step 5

      // step 9
      const extensibleTarget = Reflect.isExtensible(shadowTarget);

      // step 10
      let targetKeys = Reflect.ownKeys(shadowTarget);

      // step 12, 13
      let targetConfigurableKeys = [], targetNonconfigurableKeys = [];

      // step 14
      targetKeys.forEach(function(key) {
        let desc = Reflect.getOwnPropertyDescriptor(shadowTarget, key);
        if (desc && !desc.configurable)
          targetNonconfigurableKeys.push(key);
        else
          targetConfigurableKeys.push(key);
      });

      // step 15
      if (extensibleTarget && (targetNonconfigurableKeys.length === 0)) {
        return rv;
      }

      // step 16
      let uncheckedResultKeys = new Set(rv);

      // step 17
      targetNonconfigurableKeys.forEach(function(key) {
        if (!uncheckedResultKeys.has(key)) {
          rv.push(key);
        }
        uncheckedResultKeys.delete(key);
      }, this);

      // step 18
      if (extensibleTarget)
        return rv;

      // step 19
      targetConfigurableKeys.forEach(function(key) {
        if (!uncheckedResultKeys.has(key)) {
          rv.push(key);
        }
        uncheckedResultKeys.delete(key);
      });

      // step 20
      assert(uncheckedResultKeys.size === 0, "all required keys should be applied by now");
    }
    return rv;
  }

  /**
   * Define a "lazy" accessor descriptor which replaces itself with a direct
   * property descriptor when needed.
   *
   * @param {Object}          source       The source object holding a property.
   * @param {Object}          shadowTarget The shadow target for a proxy.
   * @param {String | Symbol} propName     The name of the property to copy.
   *
   * @returns {Boolean} true if the lazy property descriptor was defined.
   *
   * @private
   */
  defineLazyGetter(source, shadowTarget, propName) {
    const handler = this;

    let lockState = "none", lockedValue;
    function setLockedValue(value) {
      /* XXX ajvincent The intent is to mark this accessor descriptor as one
       * that can safely be converted to (new DataDescriptor(value)).
       * Unfortunately, a sealed accessor descriptor has the .configurable
       * property set to false, so we can never replace this getter in that
       * scenario with a data descriptor.  ES7 spec sections 7.3.14
       * (SetIntegrityLevel) and 9.1.6.3 (ValidateAndApplyPropertyDescriptor)
       * force that upon us.
       *
       * I hope that a ECMAScript engine can be written (and a future
       * specification written) that could detect this unbreakable contract and
       * internally convert the accessor descriptor to a data descriptor.  That
       * would be a nice optimization for a "just-in-time" compiler.
       *
       * Simply put:  (1) The only setter for lockedValue is setLockedValue.
       * (2) There are at most only two references to setLockedValue ever, and
       * that only briefly in a recursive chain of proxy creation operations.
       * (3) I go out of our way to ensure all references to the enclosed
       * setLockedValue function go away as soon as possible.  Therefore, (4)
       * when all references to setLockedValue go away, lockedValue is
       * effectively a constant.  (5) lockState can only be set to "finalized"
       * by setLockedState.  (6) the setter for this property has been removed
       * before then.  Therefore, (7) lazyDesc.get() can return only one
       * possible value once lockState has become "finalized", and (8) despite
       * the property descriptor's [[Configurable]] flag being set to false, it
       * is completely safe to convert the property to a data descriptor.
       *
       * Lacking such an automated optimization, it would be nice if a future
       * ECMAScript standard could define
       * Object.lockPropertyDescriptor(obj, propName) which could quickly assert
       * the accessor descriptor really can only generate one value in the
       * future, and then internally do the data conversion.
       */

      // This lockState check should be treated as an assertion.
      if (lockState !== "transient")
        throw new Error("setLockedValue should be callable exactly once!");
      lockedValue = value;
      lockState = "finalized";
    }

    const lazyDesc = {
      get: function() {
        if (lockState === "finalized")
          return lockedValue;
        if (lockState === "transient")
          return handler.membrane.getMembraneProxy(
            handler.graphName, shadowTarget
          ).proxy;

        /* When the shadow target is sealed, desc.configurable is not updated.
         * But the shadow target's properties all get the [[Configurable]] flag
         * removed.  So an attempt to delete the property will fail, which means
         * the assert below will throw.
         * 
         * The tests required only that an exception be thrown.  However,
         * asserts are for internal errors, and in theory can be disabled at any
         * time:  they're not for catching mistakes by the end-user.  That's why
         * I am deliberately throwing an exception here, before the assert call.
         */
        let current = Reflect.getOwnPropertyDescriptor(shadowTarget, propName);
        if (!current.configurable)
          throw new Error("lazy getter descriptor is not configurable -- this is fatal");

        handler.validateTrapAndShadowTarget("defineLazyGetter", shadowTarget);

        const target = getRealTarget(shadowTarget);
        const targetCylinder = handler.membrane.cylinderMap.get(target);

        // sourceDesc is the descriptor we really want
        let sourceDesc = (
          targetCylinder.getLocalDescriptor(handler.graphName, propName) ||
          Reflect.getOwnPropertyDescriptor(source, propName)
        );

        if ((sourceDesc !== undefined) &&
            (targetCylinder.originGraph !== handler.graphName)) {
          let hasUnwrapped = "value" in sourceDesc,
              unwrapped = sourceDesc.value;

          // This is necessary to force desc.value to be wrapped in the membrane.
          let configurable = sourceDesc.configurable;
          sourceDesc.configurable = true;
          sourceDesc = handler.membrane.wrapDescriptor(
            targetCylinder.originGraph, handler.graphName, sourceDesc
          );
          sourceDesc.configurable = configurable;

          if (hasUnwrapped && handler.proxiesInConstruction.has(unwrapped)) {
            /* Ah, nuts.  Somewhere in our stack trace, the unwrapped value has
             * a proxy in this object graph under construction.  That's not
             * supposed to happen very often, but can happen during a recursive
             * Object.seal() or Object.freeze() call.  What that means is that
             * we may not be able to replace the lazy getter (which is an
             * accessor descriptor) with a data descriptor when external code
             * looks up the property on the shadow target.
             */
            handler.proxiesInConstruction.get(unwrapped).push(setLockedValue);
            sourceDesc = lazyDesc;
            delete sourceDesc.set;
            lockState = "transient";
          }
        }

        assert(
          Reflect.deleteProperty(shadowTarget, propName),
          "Couldn't delete original descriptor?"
        );
        assert(
          Reflect.defineProperty(this, propName, sourceDesc),
          "Couldn't redefine shadowTarget with descriptor?"
        );

        // Finally, run the actual getter.
        if (sourceDesc === undefined)
          return undefined;
        if ("get" in sourceDesc)
          return sourceDesc.get.apply(this);
        if ("value" in sourceDesc)
          return sourceDesc.value;
        return undefined;
      },

      set: function(value) {
        handler.validateTrapAndShadowTarget("defineLazyGetter", shadowTarget);

        if (valueType(value) !== "primitive") {
          // Maybe we have to wrap the actual descriptor.
          const target = getRealTarget(shadowTarget);
          const targetCylinder = handler.membrane.cylinderMap.get(target);
          if (targetCylinder.originGraph !== handler.graphName) {
            let originHandler = handler.membrane.getHandlerByName(
              targetCylinder.originGraph
            );
            value = handler.membrane.convertArgumentToProxy(
              originHandler, handler, value
            );
          }
        }

        /* When the shadow target is sealed, desc.configurable is not updated.
         * But the shadow target's properties all get the [[Configurable]] flag
         * removed.  So an attempt to delete the property will fail, which means
         * the assert below will throw.
         * 
         * The tests required only that an exception be thrown.  However,
         * asserts are for internal errors, and in theory can be disabled at any
         * time:  they're not for catching mistakes by the end-user.  That's why
         * I am deliberately throwing an exception here, before the assert call.
         */
        let current = Reflect.getOwnPropertyDescriptor(shadowTarget, propName);
        if (!current.configurable)
          throw new Error("lazy getter descriptor is not configurable -- this is fatal");

        const desc = new DataDescriptor(value, true, current.enumerable, true);

        assert(
          Reflect.deleteProperty(shadowTarget, propName),
          "Couldn't delete original descriptor?"
        );
        assert(
          Reflect.defineProperty(this, propName, desc),
          "Couldn't redefine shadowTarget with descriptor?"
        );

        return value;
      },

      enumerable: true,
      configurable: true,
    };

    {
      handler.membrane.addPartsToCylinder(handler, lazyDesc.get);
      handler.membrane.addPartsToCylinder(handler, lazyDesc.set);
    }

    {
      let current = Reflect.getOwnPropertyDescriptor(source, propName);
      if (current && !current.enumerable)
        lazyDesc.enumerable = false;
    }

    return Reflect.defineProperty(shadowTarget, propName, lazyDesc);
  }

  /**
   * Determine if a target, or any prototype ancestor, has a local-to-the-proxy
   * flag.
   *
   * @argument {Object}  target   The proxy target.
   * @argument {String}  flagName The name of the flag.
   * @argument {Boolean} recurse  True if we should look at prototype ancestors.
   *
   * @returns {Boolean} True if local properties have been requested.
   * @private
   */
  getLocalFlag(target, flagName, recurse) {
    let cylinder = this.membrane.cylinderMap.get(target);
    const originGraph = cylinder.originGraph;

    //eslint-disable-next-line no-constant-condition
    while (true) {
      let shouldBeLocal = cylinder.getLocalFlag(this.graphName, flagName) ||
                          cylinder.getLocalFlag(originGraph, flagName);
      if (shouldBeLocal)
        return true;
      if (!recurse)
        return false;
      let shadowTarget = cylinder.getShadowTarget(this.graphName);

      /* XXX ajvincent I suspect this assertion might fail if
       * this.graphName == map.originGraph:  if the graph represents an original
       * value.
       */
      assert(shadowTarget, "getLocalFlag failed to get a shadow target!");

      let protoTarget = this.getPrototypeOf(shadowTarget);
      if (!protoTarget)
        return false;
      cylinder = this.membrane.cylinderMap.get(protoTarget);
      if (!cylinder)
        return false;
    }
  }

  /**
   * Determine whether this proxy (or one it inherits from) requires local
   * property deletions.
   *
   * @param {Object} target The proxy target.
   *
   * @returns {Boolean} True if deletes should be local.
   * @private
   */
  requiresDeletesBeLocal(target) {
    let protoTarget = target;
    let cylinder = this.membrane.cylinderMap.get(protoTarget);
    const originGraph = cylinder.originGraph;

    //eslint-disable-next-line no-constant-condition
    while (true) {
      let shouldBeLocal = cylinder.getLocalFlag(this.graphName, "requireLocalDelete") ||
                          cylinder.getLocalFlag(originGraph, "requireLocalDelete");
      if (shouldBeLocal)
        return true;
      let shadowTarget = cylinder.getShadowTarget(this.graphName);
      protoTarget = this.getPrototypeOf(shadowTarget);
      if (!protoTarget)
        return false;
      cylinder = this.membrane.cylinderMap.get(protoTarget);
    }
  }

  /**
   * Truncate the argument list, if necessary.
   *
   * @param target        {Function} The method about to be invoked.
   * @param argumentsList {Value[]}  The list of arguments
   *
   * returns {Value[]} a copy of the list of arguments, truncated.
   *
   * @private
   */
  truncateArguments(target, argumentsList) {
    assert(Array.isArray(argumentsList), "argumentsList must be an array!");
    const cylinder = this.membrane.cylinderMap.get(target);

    var originCount = cylinder.getTruncateArgList(cylinder.originGraph);
    if (typeof originCount === "boolean") {
      originCount = originCount ? target.length : Infinity;
    }
    else {
      assert(Number.isInteger(originCount) && (originCount >= 0),
             "must call slice with a non-negative integer length");
    }

    var targetCount = cylinder.getTruncateArgList(this.graphName);
    if (typeof targetCount === "boolean") {
      targetCount = targetCount ? target.length : Infinity;
    }
    else {
      assert(Number.isInteger(targetCount) && (targetCount >= 0),
             "must call slice with a non-negative integer length");
    }

    const count = Math.min(originCount, targetCount);
    return argumentsList.slice(0, count);
  }

  /**
   * Add a revoker function to our list.
   *
   * @param {Function} revoke The revoker.
   * @package
   */
  addRevocable(revoke) {
    this.membrane.revokerMultiMap.set(this, revoke);
  }

  /**
   * Revoke the entire object graph.
   */
  revokeEverything() {
    if (this.__isDead__)
      throw new Error("This membrane handler is dead!");
    Object.defineProperty(this, "__isDead__", new DataDescriptor(true));

    this.membrane.revokerMultiMap.revoke(this);
  }
}

Object.freeze(ObjectGraphHandler);

// temporary
const MembraneProxyHandlers = {
  Master: function() {}
};

/**
 * @package
 */
class ObjectGraph {
  constructor(membrane, graphName) {
    {
      let t = typeof graphName;
      if ((t != "string") && (t != "symbol"))
        throw new Error("graph name must be a string or a symbol!");
    }

    var passThroughFilter = returnFalse;

    // private
    defineNWNCProperties(this, {
      membrane,
      graphName,

      __isDead__: false,
    }, true);

    // private
    defineNWNCProperties(this, {
      masterProxyHandler: new MembraneProxyHandlers.Master(this),

      __revokeFunctions__: [],
      __proxyListeners__: [],
    }, false);

    Object.defineProperties(this, {
      // private
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
   * Remove a ProxyCylinder or a Proxy.revoke function from our list.
   *
   * @private
   */
  /*
  removeRevocable(revoke) {
    /*
    let index = this.__revokeFunctions__.indexOf(revoke);
    if (index == -1) {
      throw new Error("Unknown revoke function!");
    }
    this.__revokeFunctions__.splice(index, 1);

    void(revoke);
    throw new Error("Not implemented");
  }
  */

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

const WeakMap_set$1 = WeakMap.prototype.set;

/**
 * @package
 */
class WeakMultiMap extends WeakMap {
  set(key, value) {
    if (!this.has(key)) {
      WeakMap_set$1.apply(this, [key, new Set]);
    }
    this.get(key).add(value);
    return this;
  }

  /* I could add more methods for manipulating values in the set, but I choose not to
  until there is a clear need for them.  Otherwise, it's more unit-testing, more
  complexity.
  */
}

const WeakMultiMap_set = WeakMultiMap.prototype.set;
const WeakMap_set$2      = WeakMap.prototype.set;
const WeakMap_delete   = WeakMap.prototype.delete;

class RevocableMultiMap extends WeakMultiMap {
  set(key, value) {
    if (typeof value !== "function")
      return false;

    if (this.get(key) === DeadProxyKey)
      return false;

    WeakMultiMap_set.apply(this, [key, value]);
    return true;
  }

  delete(key) {
    const set = this.get(key);
    if (set === DeadProxyKey)
      return false;
    return WeakMap_delete.apply(this, [key]);
  }

  revoke(key) {
    const set = this.get(key);
    if (!(set instanceof Set))
      return false;

    let firstErrorSet = false, firstError;
    set.forEach(revoker => {
      try {
        revoker();
      }
      catch (ex) {
        if (firstErrorSet) {
          return;
        }

        firstErrorSet = true;
        firstError = ex;
      }
    });

    WeakMap_set$2.apply(this, [key, DeadProxyKey]);

    if (firstErrorSet)
      throw firstError;
    return true;
  }
}

const Constants = {
  warnings: {
    FILTERED_KEYS_WITHOUT_LOCAL: "Filtering own keys without allowing local property defines or deletes is dangerous",
    PROTOTYPE_FILTER_MISSING: "Proxy filter specified to inherit from prototype, but prototype provides no filter",
  }
};

Object.freeze(Constants.warnings);
Object.freeze(Constants);


/**
 * Helper function to determine if anyone may log.
 * @private
 *
 * @returns {Boolean} True if logging is permitted.
 */
// This function is here because I can blacklist moduleUtilities during debugging.
function MembraneMayLog() {
  return (typeof this.logger == "object") && Boolean(this.logger);
}

// bindValuesByHandlers utility
/**
 * @typedef BindValuesBag
 * @property {ObjectGraphHandler} handler
 * @property {Variant}            value
 * @property {string}             type
 * @property {ProxyCylinder?}     cylinder
 * @property {boolean}            maySet
 *
 * @private
 */

// bindValuesByHandlers utility
/**
 * Make a metadata structure for graph-binding.
 *
 * @param {Membrane}           membrane The membrane accepting the value.
 * @param {ObjectGraphHandler} handler  The graph handler.
 * @param {Variant}            value    The value we are trying to bind.
 *
 * @returns {BindValuesBag}
 * @private
 * @static
 *
 * @note The logic here is convoluted, I admit.  Basically, if we succeed:
 * handler0 must own value0
 * handler1 must own value1
 * the ProxyCylinder instances for value0 and value1 must be the same
 * there must be no collisions between any properties of the ProxyCylinder
 *
 * If we fail, there must be no side-effects.
 */
function makeBindValuesBag(membrane, handler, value) {
  if (!membrane.ownsHandler(handler))
    throw new Error("bindValuesByHandlers requires two ObjectGraphHandlers from different graphs");

  let rv = {
    handler: handler,
    value: value,
    type: valueType(value),
  };

  if (rv.type !== "primitive") {
    rv.cylinder = membrane.cylinderMap.get(value);
    const graph = rv.handler.graphName;
    const valid = (!rv.cylinder ||
                    (rv.cylinder.hasGraph(graph) &&
                    (rv.cylinder.getProxy(graph) === value)));
    if (!valid)
      throw new Error("Value argument does not belong to proposed object graph");
  }

  return rv;
}

// bindValuesByHandlers utility
/**
 * Determine whether a value may be set for a given graph.
 *
 * @param {ProxyCylinder} cylinder
 * @param {BindValuesBag} bag
 *
 * @private
 * @static
 */
function maySetOnGraph(cylinder, bag) {
  if (cylinder && cylinder.hasGraph(bag.handler.graphName)) {
    let check = cylinder.getProxy(bag.handler.graphName);
    if (check !== bag.value)
      throw new Error("Value argument does not belong to proposed object graph");
    bag.maySet = false;
  }
  else
    bag.maySet = true;
}

/* Reference:  http://soft.vub.ac.be/~tvcutsem/invokedynamic/js-membranes
 * Definitions:
 * Object graph: A collection of values that talk to each other directly.
 */

class Membrane {
  /**
   *
   * @param {Object} options
   */
  constructor(options = {}) {
    let passThrough = (typeof options.passThroughFilter === "function") ?
                      options.passThroughFilter :
                      returnFalse;

    defineNWNCProperties(this, {
      showGraphName: Boolean(options.showGraphName),

      refactor: options.refactor || "",

      cylinderMap: new ProxyCylinderMap,

      revokerMultiMap: new RevocableMultiMap,

      handlersByGraphName: {},

      logger: options.logger || null,

      warnOnceSet: (options.logger ? new Set() : null),

      modifyRules: new ModifyRulesAPI(this),

      passThroughFilter: passThrough,
    }, false);
  
    /* XXX ajvincent Somehow adding this line breaks not only npm test, but the
       ability to build as well.  The breakage comes in trying to create a mock of
       a dogfood membrane.
    Object.seal(this);
    */
  }

  /**
   * Returns true if we have a proxy for the value.
   */
  hasProxyForValue(graph, value) {
    var cylinder = this.cylinderMap.get(value);
    return Boolean(cylinder) && cylinder.hasGraph(graph);
  }

  /**
   * Get the value associated with a graph name and another known value.
   *
   * @param {Symbol|String} graph The graph to look for.
   * @param {Variant}       value The key for the ProxyCylinder map.
   *
   * @public
   *
   * @returns [
   *    {Boolean} True if the value was found.
   *    {Variant} The value for that graph.
   * ]
   *
   * @note This method is not used internally in the membrane, but only by debug
   * code to assert that we have the right values stored.  Therefore you really
   * shouldn't use it in Production.
   */
  getMembraneValue(graph, value) {
    var cylinder = this.cylinderMap.get(value);
    if (cylinder && cylinder.hasGraph(graph)) {
      return [true, cylinder.getOriginal()];
    }
    return [false, NOT_YET_DETERMINED];
  }

  /**
   * Get the proxy associated with a graph name and another known value.
   *
   * @param {Symbol|String} graph The graph to look for.
   * @param {Variant}       value The key for the ProxyCylinder map.
   *
   * @public
   *
   * @returns [
   *    {Boolean} True if the value was found.
   *    {Proxy}   The proxy for that graph.
   * ] if graph is not the value's origin graph
   * 
   * @returns [
   *    {Boolean} True if the value was found.
   *    {Variant} The actual value
   * ] if graph is the value's origin graph
   *
   * @returns [
   *    {Boolean} False if the value was not found.
   *    {Object}  NOT_YET_DETERMINED
   * ]
   */
  getMembraneProxy(graph, value) {
    var cylinder = this.cylinderMap.get(value);
    if (cylinder && cylinder.hasGraph(graph)) {
      return [true, cylinder.getProxy(graph)];
    }
    return [false, NOT_YET_DETERMINED];
  }

  /**
   * Assign a value to an object graph.
   *
   * @param handler {ObjectGraphHandler} A graph handler to bind to the value.
   * @param value   {Variant} The value to assign.
   *
   * Options:
   *   @param {ProxyCylinder} cylinder
   *   @param {Variant}       shadowTarget
   *   @param {boolean}       storeAsValue
   *
   * @returns {ProxyCylinder}
   *
   * @package
   */
  addPartsToCylinder(handler, value, options = {}) {
    if (!this.ownsHandler(handler))
      throw new Error("handler is not an ObjectGraphHandler we own!");
    let cylinder = ("cylinder" in options) ? options.cylinder : null;

    const graphName = handler.graphName;

    if (!cylinder) {
      if (this.cylinderMap.has(value)) {
        cylinder = this.cylinderMap.get(value);
      }

      else {
        cylinder = new ProxyCylinder(graphName);
      }
    }

    const isOriginal = (cylinder.originGraph === graphName);
    assert(isOriginal || this.ownsHandler(options.originHandler),
           "Proxy requests must pass in an origin handler");

    let parts;
    if (isOriginal || options.storeAsValue) {
      parts = { value, storeAsValue: true };
    }
    else {
      const shadowTarget = "shadowTarget" in options ?
                           options.shadowTarget :
                           makeShadowTarget(value);
      let obj, revoke;
      if (("shadowTarget" in options) && (valueType(shadowTarget) === "primitive")) {
        obj = { proxy: shadowTarget, revoke: () => {}};
      }
      else if (handler instanceof ObjectGraph) {
        obj = Proxy.revocable(shadowTarget, handler.masterProxyHandler);
      }
      else {
        obj = Proxy.revocable(shadowTarget, handler);
      }

      parts = {
        proxy: obj.proxy,
        shadowTarget,
        storeAsValue: false,
      };
      revoke = obj.revoke;

      this.revokerMultiMap.set(cylinder, revoke);
      this.revokerMultiMap.set(cylinder, () => cylinder.removeGraph(graphName));
      this.revokerMultiMap.set(handler, revoke);
      this.revokerMultiMap.set(handler, () => cylinder.removeGraph(graphName));
    }

    cylinder.setMetadata(this, graphName, parts);

    if (!isOriginal) {
      const notifyOptions = {
        isThis: false,
        originHandler: options.originHandler,
        targetHandler: handler,
      };
      ["trapName", "callable", "isThis", "argIndex"].forEach(function(propName) {
        if (Reflect.has(options, propName))
          notifyOptions[propName] = options[propName];
      });

      ProxyNotify(parts, options.originHandler, true, notifyOptions);
      ProxyNotify(parts, handler, false, notifyOptions);

      if (!options.storeAsValue && !Reflect.isExtensible(value)) {
        try {
          Reflect.preventExtensions(parts.proxy);
        }
        catch (e) {
          // do nothing
        }
      }
    }

    return cylinder;
  }

  /**
   *
   * @param {Symbol|String} graph The graph to look for.
   *
   * @returns {Boolean}
   */
  hasHandlerByGraph(graph) {
    {
      let t = typeof graph;
      if ((t != "string") && (t != "symbol"))
        throw new Error("graph must be a string or a symbol!");
    }
    return Reflect.ownKeys(this.handlersByGraphName).includes(graph);
  }

  /**
   * Get an ObjectGraphHandler object by graph name.  Build it if necessary.
   *
   * @param {Symbol|String} graph   The graph name for the object graph.
   * @param {Object}        options Broken down as follows:
   * - {Boolean} mustCreate  True if we must create a missing graph handler.
   *
   * @returns {ObjectGraphHandler} The handler for the object graph.
   */
  getHandlerByName(graphName, options) {
    if (typeof options === "boolean")
      throw new Error("fix me!");
    let mustCreate = (typeof options == "object") ?
                     Boolean(options.mustCreate) :
                     false;
    if (mustCreate && !this.hasHandlerByGraph(graphName)) {
      let graph = null;
      if (this.refactor === "0.10")
        graph = new ObjectGraph(this, graphName);
      else
        graph = new ObjectGraphHandler(this, graphName);
      this.handlersByGraphName[graphName] = graph;
    }
    return this.handlersByGraphName[graphName];
  }

  /**
   * Determine if the handler is a ObjectGraphHandler for this object graph.
   *
   * @returns {Boolean} True if the handler is one we own.
   */
  ownsHandler(handler) {
    return (((handler instanceof ObjectGraphHandler) ||
             (handler instanceof ObjectGraph)) &&
            (this.handlersByGraphName[handler.graphName] === handler));
  }

  /**
   *
   */
  passThroughFilter() {
    return false;
  }

  /**
   * Ensure an argument is properly wrapped in a proxy.
   *
   * @param {ObjectGraphHandler} origin  Where the argument originated from
   * @param {ObjectGraphHandler} target  The object graph we're returning the arg to.
   * @param {Variant}            arg     The argument.
   *
   * @returns {Proxy}   The proxy for that graph
   *   if graph is not the value's origin graph
   * 
   * @returns {Variant} The actual value
   *   if graph is the value's origin graph
   *
   * @throws {Error} if failed (this really should never happen)
   *
   * @public
   */
  convertArgumentToProxy(originHandler, targetHandler, arg, options = {}) {
    var override = ("override" in options) && (options.override === true);
    if (override) {
      let cylinder = this.cylinderMap.get(arg);
      if (cylinder) {
        cylinder.clearAllGraphs(this);
      }
    }

    if (valueType(arg) === "primitive") {
      return arg;
    }


    let found, rv;
    [found, rv] = this.getMembraneProxy(
      targetHandler.graphName, arg
    );
    if (found)
      return rv;

    if (!this.ownsHandler(originHandler) ||
        !this.ownsHandler(targetHandler) ||
        (originHandler.graphName === targetHandler.graphName))
      throw new Error("convertArgumentToProxy requires two different ObjectGraphHandlers in the Membrane instance");

    if (this.passThroughFilter(arg) ||
        (originHandler.passThroughFilter(arg) && targetHandler.passThroughFilter(arg))) {
      return arg;
    }

    if (!this.hasProxyForValue(originHandler.graphName, arg)) {
      let cylinder = this.cylinderMap.get(arg);
      let passOptions;
      if (cylinder) {
        passOptions = Object.create(options, {
          "cylinder": new DataDescriptor(cylinder)
        });
      }
      else
        passOptions = options;

      this.addPartsToCylinder(originHandler, arg, passOptions);
    }
    
    if (!this.hasProxyForValue(targetHandler.graphName, arg)) {
      let cylinder = this.cylinderMap.get(arg);
      let passOptions = Object.create(options, {
        "originHandler": new DataDescriptor(originHandler)
      });
      assert(cylinder, "ProxyCylinder not created before invoking target handler?");

      Reflect.defineProperty(
        passOptions, "cylinder", new DataDescriptor(cylinder)
      );

      this.addPartsToCylinder(targetHandler, arg, passOptions);
    }

    [found, rv] = this.getMembraneProxy(
      targetHandler.graphName, arg
    );
    if (!found)
      throw new Error("in convertArgumentToProxy(): proxy not found");
    return rv;
  }

  /**
   * Link two values together across object graphs.
   *
   * @param {ObjectGraphHandler} handler0  The graph handler that should own value0.
   * @param {Object}             value0    The first value to store.
   * @param {ObjectGraphHandler} handler1  The graph handler that should own value1.
   * @param {Variant}            value1    The second value to store.
   *
   * @note value0 must already be registered for handler0.
   *
   * @public
   */
  bindValuesByHandlers(handler0, value0, handler1, value1) {
    let propBag0 = makeBindValuesBag(this, handler0, value0);
    let propBag1 = makeBindValuesBag(this, handler1, value1);

    if (propBag0.type === "primitive") {
      if (propBag1.type === "primitive") {
        throw new Error("bindValuesByHandlers requires two non-primitive values");
      }
    }

    let cylinder = propBag0.cylinder || propBag1.cylinder;

    if (propBag0.cylinder && propBag1.cylinder) {
      if (propBag0.cylinder !== propBag1.cylinder) {
        // See https://github.com/ajvincent/es-membrane/issues/77 .
        throw new Error("Linking two object graphs in this way is not safe.");
      }
    }

    maySetOnGraph(cylinder, propBag0);
    maySetOnGraph(cylinder, propBag1);

    if (propBag0.handler.graphName === propBag1.handler.graphName) {
      if (propBag0.value !== propBag1.value)
        throw new Error("bindValuesByHandlers requires two ObjectGraphHandlers from different graphs");
      // no-op
      propBag0.maySet = false;
      propBag1.maySet = false;
    }

    if (propBag0.maySet) {
      const options = {
        cylinder,
        storeAsValue: true,
      };

      if (cylinder && (cylinder.originGraph !== propBag0.handler))
        options.originHandler = this.handlersByGraphName[cylinder.originGraph];

      cylinder = this.addPartsToCylinder(propBag0.handler, propBag0.value, options);
    }
    if (propBag1.maySet) {
      const options = {
        cylinder,
        storeAsValue: true,
        originHandler: this.handlersByGraphName[cylinder.originGraph]
      };
      this.addPartsToCylinder(propBag1.handler, propBag1.value, options);
    }

    // Postconditions
    if (propBag0.type !== "primitive") {
      let found, check;
      [found, check] = this.getMembraneProxy(propBag0.handler.graphName, propBag0.value);
      assert(found, "value0 not found?");
      assert(check === propBag0.value, "value0 not found in handler0 graph name?");

      [found, check] = this.getMembraneProxy(propBag1.handler.graphName, propBag0.value);
      assert(found, "value0 not found?");
      assert(check === propBag1.value, "value0 not found in handler1 graph name?");
    }

    if (propBag1.type !== "primitive") {
      let found, check;
      [found, check] = this.getMembraneProxy(propBag0.handler.graphName, propBag1.value);
      assert(found, "value1 not found?");
      assert(check === propBag0.value, "value1 not found in handler0 graph name?");

      [found, check] = this.getMembraneProxy(propBag1.handler.graphName, propBag1.value);
      assert(found, "value1 not found?");
      assert(check === propBag1.value, "value1 not found in handler1 graph name?");
    }
  }

  /**
   * Wrap the methods of a descriptor in an object graph.
   *
   * @package
   */
  wrapDescriptor(originGraph, targetGraph, desc) {
    if (!desc)
      return desc;

    // XXX ajvincent This optimization may need to go away for wrapping primitives.
    if (isDataDescriptor(desc) && (valueType(desc.value) === "primitive"))
      return desc;

    var keys = Object.keys(desc);

    var wrappedDesc = {
      configurable: Boolean(desc.configurable)
    };
    if ("enumerable" in desc)
      wrappedDesc.enumerable = Boolean(desc.enumerable);
    if (keys.includes("writable")) {
      wrappedDesc.writable = Boolean(desc.writable);
      if (!wrappedDesc.configurable && !wrappedDesc.writable)
        return desc;
    }

    var originHandler = this.getHandlerByName(originGraph);
    var targetHandler = this.getHandlerByName(targetGraph);

    ["value", "get", "set"].forEach(function(descProp) {
      if (!keys.includes(descProp))
        return;
      wrappedDesc[descProp] = this.convertArgumentToProxy(
        originHandler,
        targetHandler,
        desc[descProp]
      );
    }, this);

    return wrappedDesc;
  }

  /**
   *
   * @param {string} message
   */
  warnOnce(message) {
    if (this.logger && !this.warnOnceSet.has(message)) {
      this.warnOnceSet.add(message);
      this.logger.warn(message);
    }
  }
}

Reflect.defineProperty(
  Membrane,
  "Primordials",
  new NWNCDataDescriptor(Primordials, true) // this should be visible
);

Membrane.prototype.allTraps = allTraps;

/**
 * A flag indicating if internal properties of the Membrane are private.
 *
 * @public
 */
Membrane.prototype.secured = false;

Membrane.prototype.__mayLog__ = MembraneMayLog;

Membrane.prototype.constants = Constants;

Object.seal(Membrane);

export default Membrane;
