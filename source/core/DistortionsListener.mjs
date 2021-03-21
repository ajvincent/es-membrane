/** @module source/core/DistortionsListener  */

/**
 * @fileoverview
 *
 * This is an observer for taking a JSON object (a "DistortionConfiguration")
 * and using its rules to define distortions for a proxy before the membrane returns
 * the proxy for general use.  It abstracts several common patterns about objects,
 * instances, prototypes, etc. into a single, easy-to-use utility for these distortions.
 *
 * The DistortionsListener can handle any object as a base value, and uses the
 * "category" field to determine what to watch for.  The "category" flag has five allowed
 * settings:
 *   - "value":     Listen for a specific value when we see it.
 *   - "prototype": Listen for the prototype of the value.
 *   - "instance":  Listen for objects whose prototype is the value.
 *   - "iterable":  Listen for all elements of the value (which is an Array or a Set)
 *   - "filter":    Treat the value as a filter functions for other values to apply a configuration to.
 *
 * While a listener is active via .addListener(), when a proxy is ready for distortions,
 * handleProxyMessage() fires for the proxy's shadow target as part of a ProxyMessage.  This
 * results in two major steps:
 *   - getConfigurationForListener() looks up the right configuration, based on a matching
 *     value, prototype or instance
 *   - applyConfiguration() uses the configuration to apply distortions via the ModifyRulesAPI.
 *
 * If the DistortionsListener succeeds in applying distortions, it stops propagation of the ProxyMessage.
 *
 * See DistortionsListener.sampleConfig() for minimalist examples of the DistortionConfiguration.
 */

import {
  Primordials,
  allTraps,
  defineNWNCProperties,
  valueType,
} from "./utilities/shared.mjs";

function defineSetOnce(map) {
  map.originalSet = map.set;

  map.set = function(key, value) {
    if (this.has(key))
      throw new Error("Value has already been defined!");
    return this.originalSet(key, value);
  };

  Object.freeze(map);
  return map;
}

/**
 * @typedef DistortionConfiguration
 * @property {string}               formatVersion
 * @property {string}               dataVersion
 * @property {boolean?}             filterOwnKeys
 * @property {string[]?}            proxyTraps
 * @property {boolean?}             storeUnknownAsLocal
 * @property {boolean?}             requireLocalDelete
 * @property {boolean?}             useShadowTarget
 * @property {(number | boolean)?}  truncateArgList
 */

/**
 * @public
 */
export default class DistortionsListener {
  /**
   * @param {Membrane} membrane The owning membrane.
   */
  constructor(membrane) {
    // private
    defineNWNCProperties(this, {
      membrane,
      valueAndProtoMap: defineSetOnce(new WeakMap(/*
        object or function.prototype: JSON configuration
      */)),

      instanceMap: defineSetOnce(new WeakMap(/*
        function: JSON configuration
      */)),

      filterToConfigMap: defineSetOnce(new Map(/*
        function returning boolean: JSON configuration
      */)),

      ignorableValues: new Set(),
    }, false);
  }

  /**
   * Generate a sample configuration this DistortionsListener supports.
   *
   * @param {boolean} isFunction True if the config should be for a function.
   * @returns {DistortionConfiguration}
   * @public
   */
  sampleConfig(isFunction = false) {
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

  /**
   * Add a listener for a value (or in the case of instance or iterable, several values).
   *
   * @param {Object} value The base value to listen for.
   * @param {"value" | "prototype" | "instance" | "iterable" | "filter"} category
   *        The category of the value to listen for.
   * @param {DistortionConfiguration} config The configuration.
   *
   * @public
   */
  addListener(value, category, config) {
    if ((category === "prototype") || (category === "instance")) {
      if (typeof value !== "function")
        throw new Error(`The ${category} category requires a function value!`);
      value = value.prototype;
    }

    if ((category === "prototype") || (category === "value"))
      this.valueAndProtoMap.set(value, config);
    else if (category === "iterable")
      Array.from(value).forEach((item) => this.valueAndProtoMap.set(item, config));
    else if (category === "instance")
      this.instanceMap.set(value, config);
    else if (category === "filter") {
      if (typeof value !== "function")
        throw new Error("The filter category requires a function value!");
      this.filterToConfigMap.set(value, config);
    }
    else
      throw new Error(`Unsupported category '${category}' for value!`);
  }

  /**
   * Add a value which may be ignored.
   *
   * @param {Object} i The value to ignore.
   */
  addIgnorable(i) {
    if (valueType(i) !== "primitive")
      this.ignorableValues.add(i);
  }

  /**
   * Ignore all primordials (Object, Array, Date, Boolean, etc.)
   *
   * @public
   */
  ignorePrimordials() {
    Primordials.forEach(p => this.addIgnorable(p));
  }

  /**
   * Attach this to an object graph.
   *
   * @param {ObjectGraph | ObjectGraphHandler} handler
   *
   * @public
   */
  bindToHandler(handler) {
    if (!this.membrane.ownsHandler(handler)) {
      throw new Error("Membrane must own the first argument as an object graph handler!");
    }
    handler.addProxyListener(meta => this.handleProxyMessage(meta));

    if (handler.mayReplacePassThrough)
      handler.passThroughFilter = value => this.ignorableValues.has(value);
  }

  /**
   * Find the right DistortionConfiguration for a given real value.
   *
   * @param {ProxyMessage} message
   * @private
   */
  getConfigurationForListener(message) {
    let config = this.valueAndProtoMap.get(message.realTarget);

    // direct instances of an object
    if (!config) {
      let proto = Reflect.getPrototypeOf(message.realTarget);
      config = this.instanceMap.get(proto);
    }

    // If we don't have a configuration from our value maps, try the filter functions.
    if (!config) {
      let iter, filter;
      iter = this.filterToConfigMap.entries();
      let entry = iter.next();
      while (!entry.done && !message.stopped) {
        filter = entry.value[0];
        if (filter(message)) {
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

  /**
   * Apply the rules of a configuration to a particular proxy
   * or to all proxies deriving from an original value.
   * @param {DistortionConfiguration} config
   * @param {ProxyMessage}            message
   *
   * @private
   */
  applyConfiguration(config, message) {
    const rules = this.membrane.modifyRules;
    const graphName = message.graph.graphName;

    const modifyTarget = (message.isOriginGraph) ? message.realTarget : message.proxy;

    if (Array.isArray(config.filterOwnKeys)) {
      rules.filterOwnKeys(
        graphName,
        modifyTarget,
        config.filterOwnKeys
      );
    }

    // This sets the list of ownKeys, after filtering.
    if (!message.isOriginGraph && !Reflect.isExtensible(message.realTarget))
      Reflect.preventExtensions(message.proxy);

    // O(n^2), but n === 13
    // if we really want to optimize it, we could use a JSON reviver to convert proxyTraps to a Set
    // or we could wait for Set.prototype.difference(otherSet)...
    if (Array.isArray(config.proxyTraps)) {
      const deadTraps = allTraps.filter((key) => !config.proxyTraps.includes(key));
      rules.disableTraps(graphName, modifyTarget, deadTraps);
    }

    if (config.storeUnknownAsLocal)
      rules.storeUnknownAsLocal(graphName, modifyTarget);

    if (config.requireLocalDelete)
      rules.requireLocalDelete(graphName, modifyTarget);

    if (("truncateArgList" in config) && (config.truncateArgList !== false))
      rules.truncateArgList(graphName, modifyTarget, config.truncateArgList);
  }

  /**
   * Apply modifyRulesAPI to the object graph for a given proxy.
   *
   * @param {ProxyMessage} message
   * @public
   */
  handleProxyMessage(message) {
    const config = this.getConfigurationForListener(message);
    if (config) {
      this.applyConfiguration(config, message);
      message.stopIteration();
    }
  }
}

Object.freeze(DistortionsListener);
Object.freeze(DistortionsListener.prototype);
