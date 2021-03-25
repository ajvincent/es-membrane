import {
  DataDescriptor,
  NOT_YET_DETERMINED,
  Primordials,
  allTraps,
  assert,
  defineNWNCProperties,
  isDataDescriptor,
  makeShadowTarget,
  returnFalse,
  valueType,
} from "./utilities/shared.mjs";

import {
  ProxyNotify,
} from "./ProxyNotify.mjs";

import ModifyRulesAPI from "./ModifyRulesAPI.mjs";

import ObjectGraphHandler from "./ObjectGraphHandler-old.mjs";

import ObjectGraph from "./ObjectGraph.mjs";

import {
  ProxyCylinderMap,
} from "./ProxyCylinder.mjs";

import RevocableMultiMap from "./utilities/RevocableMultiMap.mjs";


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
  if (!membrane.ownsGraph(handler))
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

/**
 * @public
 */
export default class Membrane {
  /**
   * @param {Object} options
   */
  constructor(options = {}) {
    let passThrough = (typeof options.passThroughFilter === "function") ?
                      options.passThroughFilter :
                      returnFalse;

    defineNWNCProperties(this, {
      /**
       * @private
       */
      showGraphName: Boolean(options.showGraphName),

      /**
       * @private
       */
      refactor: options.refactor || "",

      /**
       * @private
       */
      handlersByGraphName: {},

      /**
       * @private
       */
      warnOnceSet: (options.logger ? new Set() : null),

      /**
       * @package
       */
      cylinderMap: new ProxyCylinderMap,

      /**
       * @package
       */
      revokerMultiMap: new RevocableMultiMap,

      /**
       * @package
       */
      logger: options.logger || null,

      /**
       * @package
       */
      passThroughFilter: passThrough,
    }, false);

    defineNWNCProperties(this, {
      /**
       * @public
       */
       modifyRules: new ModifyRulesAPI(this),
    }, true);
  
    /* XXX ajvincent Somehow adding this line breaks not only npm test, but the
       ability to build as well.  The breakage comes in trying to create a mock of
       a dogfood membrane.
    Object.seal(this);
    */
  }

  /**
   * Returns true if we have a proxy for the value.
   * @param {string | symbol} graph The graph to look for.
   * @param {Variant}         value The key for the ProxyCylinder map.
   *
   * @public
   */
  hasProxyForValue(graph, value) {
    var cylinder = this.cylinderMap.get(value);
    return Boolean(cylinder) && cylinder.hasGraph(graph);
  }

  /**
   * Get the value associated with a graph name and another known value.
   *
   * @param {string | symbol} graph The graph to look for.
   * @param {Variant}         value The key for the ProxyCylinder map.
   *
   * @package
   *
   * @returns [
   *    {Boolean} True if the value was found.
   *    {Variant} The value for that graph.
   * ]
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
   * @param {string | symbol} graphName The graph to look for.
   * @param {Variant}         value     The key for the ProxyCylinder map.
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
  getMembraneProxy(graphName, value) {
    var cylinder = this.cylinderMap.get(value);
    if (cylinder && cylinder.hasGraph(graphName)) {
      return [true, cylinder.getProxy(graphName)];
    }
    return [false, NOT_YET_DETERMINED];
  }

  /**
   * Assign a value to an object graph.
   *
   * @param {ObjectGraph | ObjectGraphHandler} graph A graph handler to bind to the value.
   * @param {Variant}                          value The value to assign.
   * @param {Object}                           options
   *
   * Options:
   *   @param {ProxyCylinder} cylinder
   *   @param {Variant}       shadowTarget
   *   @param {boolean}       storeAsValue
   *
   * @returns {ProxyCylinder}
   * @package
   */
  addPartsToCylinder(graph, value, options = {}) {
    if (!this.ownsGraph(graph))
      throw new Error("handler is not an ObjectGraphHandler we own!");
    let cylinder = ("cylinder" in options) ? options.cylinder : null;

    const graphName = graph.graphName;

    if (!cylinder) {
      if (this.cylinderMap.has(value)) {
        cylinder = this.cylinderMap.get(value);
      }

      else {
        cylinder = this.cylinderMap.buildCylinder(graphName);
      }
    }

    const isOriginal = (cylinder.originGraph === graphName);
    assert(isOriginal || this.ownsGraph(options.originHandler),
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
      else if (graph instanceof ObjectGraph) {
        obj = Proxy.revocable(shadowTarget, graph.masterProxyHandler);
      }
      else {
        obj = Proxy.revocable(shadowTarget, graph);
      }

      parts = {
        proxy: obj.proxy,
        shadowTarget,
        storeAsValue: false,
      };
      revoke = obj.revoke;

      this.revokerMultiMap.set(cylinder, revoke);
      this.revokerMultiMap.set(cylinder, () => cylinder.removeGraph(graphName));
      this.revokerMultiMap.set(graph, revoke);
      this.revokerMultiMap.set(graph, () => cylinder.removeGraph(graphName));
    }

    cylinder.setMetadata(graphName, parts);

    if (!isOriginal) {
      const notifyOptions = {
        isThis: false,
        originGraph: options.originHandler,
        targetGraph: graph,
      };
      ["trapName", "callable", "isThis", "argIndex"].forEach(function(propName) {
        if (Reflect.has(options, propName))
          notifyOptions[propName] = options[propName];
      });

      ProxyNotify(parts, options.originHandler, true, notifyOptions);
      ProxyNotify(parts, graph, false, notifyOptions);

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
   * Report if a a particular graph name exists in this membrane.
   *
   * @param {string | symbol} graphName The graph to look for.
   *
   * @returns {boolean}
   * @public
   */
  hasGraphByName(graphName) {
    {
      let t = typeof graphName;
      if ((t !== "string") && (t !== "symbol"))
        throw new Error("graph must be a string or a symbol!");
    }
    return Reflect.ownKeys(this.handlersByGraphName).includes(graphName);
  }

  /**
   * Get an ObjectGraphHandler object by graph name.  Build it if necessary.
   *
   * @param {Symbol|String} graph   The graph name for the object graph.
   * @param {Object}        options Broken down as follows:
   * - {Boolean} mustCreate  True if we must create a missing graph handler.
   *
   * @returns {ObjectGraph | ObjectGraphHandler} The handler for the object graph.
   * @public
   */
  getGraphByName(graphName, options) {
    let mustCreate = (typeof options == "object") ?
                     Boolean(options.mustCreate) :
                     false;
    if (mustCreate && !this.hasGraphByName(graphName)) {
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
   * @param {ObjectGraph | ObjectGraphHandler} graph
   *
   * @returns {Boolean} True if the handler is one we own.
   * @public
   */
  ownsGraph(graph) {
    return (((graph instanceof ObjectGraphHandler) ||
             (graph instanceof ObjectGraph)) &&
            (this.handlersByGraphName[graph.graphName] === graph));
  }

  /**
   * @public
   * @note this will be replaced by getters/setters soon
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
        cylinder.clearAllGraphs();
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

    if (!this.ownsGraph(originHandler) ||
        !this.ownsGraph(targetHandler) ||
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
      }
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

    var originHandler = this.getGraphByName(originGraph);
    var targetHandler = this.getGraphByName(targetGraph);

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
   * Send a warning to the registered membrane logger, if that warning hasn't been sent yet.
   * @param {string} message
   * @package
   */
  warnOnce(message) {
    if (this.logger && !this.warnOnceSet.has(message)) {
      this.warnOnceSet.add(message);
      this.logger.warn(message);
    }
  }

  /**
   * Helper function to determine if anyone may log.
   *
   * @returns {Boolean} True if logging is permitted.
   * @private
   */
  __mayLog__() {
    return (typeof this.logger == "object") && Boolean(this.logger);
  }
}

defineNWNCProperties(
  Membrane, {
    /**
     * @public
     * @static
     */
    Primordials,

    /**
     * @public
     * @static
     */
    allTraps,
  },
  true
);

/**
 * A flag indicating if internal properties of the Membrane are private.
 *
 * @public
 */
Membrane.prototype.secured = false;

Object.seal(Membrane);
