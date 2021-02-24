import {
  DataDescriptor,
  NOT_YET_DETERMINED,
  NWNCDataDescriptor,
  Primordials,
  allTraps,
  assert,
  isDataDescriptor,
  makeRevokeDeleteRefs,
  makeShadowTarget,
  returnFalse,
  valueType,
} from "./sharedUtilities.mjs";

import ProxyNotify from "./ProxyNotify.mjs";

import {
  ChainHandlers,
  ModifyRulesAPI,
} from "./ModifyRulesAPI.mjs";

import ObjectGraphHandler from "./ObjectGraphHandler-old.mjs";
import ObjectGraph from "./ObjectGraph.mjs";
import ProxyCylinder from "./ProxyCylinder.mjs";
import WeakMapOfProxyCylinders from "./WeakMapOfProxyCylinders.mjs";

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
  
    let map = new WeakMap(/*
      key: ProxyCylinder instance
  
      key may be a Proxy, a value associated with a proxy, or an original value.
    */);
    WeakMapOfProxyCylinders(map);

    Object.defineProperties(this, {
      "showGraphName": new NWNCDataDescriptor(
        Boolean(options.showGraphName), false
      ),
  
      "refactor": new NWNCDataDescriptor(options.refactor || "", false),
  
      "map": new NWNCDataDescriptor(map, false),
  
      handlersByGraphName: new NWNCDataDescriptor({}, false),
  
      "logger": new NWNCDataDescriptor(options.logger || null, false),
  
      "__functionListeners__": new NWNCDataDescriptor([], false),
  
      "warnOnceSet": new NWNCDataDescriptor(
        (options.logger ? new Set() : null), false
      ),
  
      "modifyRules": new NWNCDataDescriptor(new ModifyRulesAPI(this)),
  
      "passThroughFilter": new NWNCDataDescriptor(passThrough, false)
    });
  
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
    var mapping = this.map.get(value);
    return Boolean(mapping) && mapping.hasGraph(graph);
  }

  /**
   * Get the value associated with a graph name and another known value.
   *
   * @param {Symbol|String} graph The graph to look for.
   * @param {Variant}       value The key for the ProxyCylinder map.
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
    var mapping = this.map.get(value);
    if (mapping && mapping.hasGraph(graph)) {
      return [true, mapping.getOriginal()];
    }
    return [false, NOT_YET_DETERMINED];
  }

  /**
   * Get the proxy associated with a graph name and another known value.
   *
   * @param {Symbol|String} graph The graph to look for.
   * @param {Variant}       value The key for the ProxyCylinder map.
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
    var mapping = this.map.get(value);
    if (mapping && mapping.hasGraph(graph)) {
      return [true, mapping.getProxy(graph)];
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
   *   @param {ProxyCylinder} mapping  A mapping with associated values and proxies.
   *
   * @returns {ProxyCylinder} A mapping holding the value.
   *
   * @private
   */
  buildMapping(handler, value, options = {}) {
    if (!this.ownsHandler(handler))
      throw new Error("handler is not an ObjectGraphHandler we own!");
    let cylinder = ("mapping" in options) ? options.mapping : null;

    const graphKey = (this.refactor === "0.10") ? "graphName" : "fieldName";

    if (!cylinder) {
      if (this.map.has(value)) {
        cylinder = this.map.get(value);
      }

      else {
        cylinder = new ProxyCylinder(handler[graphKey]);
      }
    }
    assert(cylinder instanceof ProxyCylinder,
           "buildMapping requires a ProxyCylinder object!");

    const isOriginal = (cylinder.originGraph === handler[graphKey]);
    assert(isOriginal || this.ownsHandler(options.originHandler),
           "Proxy requests must pass in an origin handler");

    var parts;
    if (isOriginal) {
      parts = { value };
    }
    else {
      const shadowTarget = makeShadowTarget(value);
      if (handler instanceof ObjectGraph)
        parts = Proxy.revocable(shadowTarget, handler.masterProxyHandler);
      else
        parts = Proxy.revocable(shadowTarget, handler);
      parts.shadowTarget = shadowTarget;
    }

    cylinder.setMetadata(this, handler[graphKey], parts);
    makeRevokeDeleteRefs(parts, cylinder, handler[graphKey]);

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

      if (!Reflect.isExtensible(value)) {
        try {
          Reflect.preventExtensions(parts.proxy);
        }
        catch (e) {
          // do nothing
        }
      }
    }

    handler.addRevocable(isOriginal ? cylinder : parts.revoke);
    return cylinder;
  }

  /**
   *
   * @param {Symbol|String} graph The graph to look for.
   *
   * @returns {Boolean}
   */
  hasHandlerByField(graph) {
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
    if (mustCreate && !this.hasHandlerByField(graphName)) {
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
    if (handler instanceof ObjectGraph) {
      return this.handlersByGraphName[handler.graphName] === handler;
    }
    if (ChainHandlers.has(handler))
      handler = handler.baseHandler;
    return ((handler instanceof ObjectGraphHandler) &&
            (this.handlersByGraphName[handler.fieldName] === handler));
  }

  /**
   * Wrap a value for the first time in an object graph.
   *
   * @param {ProxyCylinder} mapping A mapping whose origin graph refers to the value's object graph.
   * @param {Variant}       arg     The value to wrap.
   *
   * @note This marks the value as the "original" in the new ProxyCylinder it
   * creates.
   */
  wrapArgumentByProxyCylinder(mapping, arg, options = {}) {
    if (this.map.has(arg) || (valueType(arg) === "primitive"))
      return;

    let handler = this.getHandlerByName(mapping.originGraph);
    this.buildMapping(handler, arg, options);
    
    assert(this.map.has(arg),
           "wrapArgumentByProxyCylinder should define a ProxyCylinder for arg");
    let argMap = this.map.get(arg);
    assert(argMap instanceof ProxyCylinder, "argMap isn't a ProxyCylinder?");
    assert(argMap.getOriginal() === arg,
           "wrapArgumentByProxyCylinder didn't establish the original?");
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
   */
  convertArgumentToProxy(originHandler, targetHandler, arg, options = {}) {
    var override = ("override" in options) && (options.override === true);
    if (override) {
      let map = this.map.get(arg);
      if (map) {
        map.selfDestruct(this);
      }
    }

    if (valueType(arg) === "primitive") {
      return arg;
    }

    const graphKey = (this.refactor === "0.10") ? "graphName" : "fieldName";

    let found, rv;
    [found, rv] = this.getMembraneProxy(
      targetHandler[graphKey], arg
    );
    if (found)
      return rv;

    if (!this.ownsHandler(originHandler) ||
        !this.ownsHandler(targetHandler) ||
        (originHandler[graphKey] === targetHandler[graphKey]))
      throw new Error("convertArgumentToProxy requires two different ObjectGraphHandlers in the Membrane instance");

    if (this.passThroughFilter(arg) ||
        (originHandler.passThroughFilter(arg) && targetHandler.passThroughFilter(arg))) {
      return arg;
    }

    if (!this.hasProxyForValue(originHandler[graphKey], arg)) {
      let argMap = this.map.get(arg);
      let passOptions;
      if (argMap) {
        passOptions = Object.create(options, {
          "mapping": new DataDescriptor(argMap)
        });
      }
      else
        passOptions = options;

      this.buildMapping(originHandler, arg, passOptions);
    }
    
    if (!this.hasProxyForValue(targetHandler[graphKey], arg)) {
      let argMap = this.map.get(arg);
      let passOptions = Object.create(options, {
        "originHandler": new DataDescriptor(originHandler)
      });
      assert(argMap, "ProxyCylinder not created before invoking target handler?");

      Reflect.defineProperty(
        passOptions, "mapping", new DataDescriptor(argMap)
      );

      this.buildMapping(targetHandler, arg, passOptions);
    }

    [found, rv] = this.getMembraneProxy(
      targetHandler[graphKey], arg
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
   */
  bindValuesByHandlers(handler0, value0, handler1, value1) {
    /** XXX ajvincent The logic here is convoluted, I admit.  Basically, if we
     * succeed:
     * handler0 must own value0
     * handler1 must own value1
     * the ProxyCylinder instances for value0 and value1 must be the same
     * there must be no collisions between any properties of the ProxyCylinder
     *
     * If we fail, there must be no side-effects.
     */
    function bag(h, v) {
      if (!this.ownsHandler(h))
        throw new Error("bindValuesByHandlers requires two ObjectGraphHandlers from different graphs");
      let rv = {
        handler: h,
        value: v,
        type: valueType(v),
      };
      if (rv.type !== "primitive") {
        rv.proxyMap = this.map.get(v);
        const graph = rv.handler.graphName;
        const valid = (!rv.proxyMap ||
                        (rv.proxyMap.hasGraph(graph) &&
                        (rv.proxyMap.getProxy(graph) === v)));
        if (!valid)
          throw new Error("Value argument does not belong to proposed ObjectGraphHandler");
      }

      return rv;
    }

    function checkGraph(bag) {
      if (proxyMap.hasGraph(bag.handler.graphName)) {
        let check = proxyMap.getProxy(bag.handler.graphName);
        if (check !== bag.value)
          throw new Error("Value argument does not belong to proposed object graph");
        bag.maySet = false;
      }
      else
        bag.maySet = true;
    }

    function applyBag(bag) {
      if (!bag.maySet)
        return;
      let parts = { proxy: bag.value };
      if (proxyMap.originGraph === bag.handler.graphName)
        parts.value = bag.value;
      else
        parts.value = proxyMap.getOriginal();
      proxyMap.set(this, bag.handler.graphName, parts);
    }

    var propBag0 = bag.apply(this, [handler0, value0]);
    var propBag1 = bag.apply(this, [handler1, value1]);
    var proxyMap = propBag0.proxyMap;

    if (propBag0.type === "primitive") {
      if (propBag1.type === "primitive") {
        throw new Error("bindValuesByHandlers requires two non-primitive values");
      }

      proxyMap = propBag1.proxyMap;

      let temp = propBag0;
      propBag0 = propBag1;
      propBag1 = temp;
    }

    if (propBag0.proxyMap && propBag1.proxyMap) {
      if (propBag0.proxyMap !== propBag1.proxyMap) {
        // See https://github.com/ajvincent/es-membrane/issues/77 .
        throw new Error("Linking two ObjectGraphHandlers in this way is not safe.");
      }
    }
    else if (!propBag0.proxyMap) {
      if (!propBag1.proxyMap) {
        proxyMap = new ProxyCylinder(propBag0.handler.graphName);
      }
      else
        proxyMap = propBag1.proxyMap;
    }

    checkGraph(propBag0);
    checkGraph(propBag1);

    if (propBag0.handler.graphName === propBag1.handler.graphName) {
      if (propBag0.value !== propBag1.value)
        throw new Error("bindValuesByHandlers requires two ObjectGraphHandlers from different graphs");
      // no-op
      propBag0.maySet = false;
      propBag1.maySet = false;
    }

    applyBag.apply(this, [propBag0]);
    applyBag.apply(this, [propBag1]);

    // Postconditions
    if (propBag0.type !== "primitive") {
      let [found, check] = this.getMembraneProxy(propBag0.handler.graphName, propBag0.value);
      assert(found, "value0 mapping not found?");
      assert(check === propBag0.value, "value0 not found in handler0 graph name?");

      [found, check] = this.getMembraneProxy(propBag1.handler.graphName, propBag0.value);
      assert(found, "value0 mapping not found?");
      assert(check === propBag1.value, "value0 not found in handler0 graph name?");
    }

    if (propBag1.type !== "primitive") {
      let [found, check] = this.getMembraneProxy(propBag0.handler.graphName, propBag1.value);
      assert(found, "value1 mapping not found?");
      assert(check === propBag0.value, "value0 not found in handler0 graph name?");

      [found, check] = this.getMembraneProxy(propBag1.handler.graphName, propBag1.value);
      assert(found, "value1 mapping not found?");
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
   * @param key
   */
  revokeMapping(key) {
    this.map.revoke(key);
  }

  /**
   * Add a listener for function entry, return and throw operations.
   *
   * @param {Function} listener The listener to add.
   *
   * @see ObjectGraphHandler.prototype.notifyFunctionListeners for what each
   * listener will get for its arguments.
   */
  addFunctionListener(listener) {
    if (typeof listener != "function")
      throw new Error("listener is not a function!");
    if (!this.__functionListeners__.includes(listener))
      this.__functionListeners__.push(listener);
  }

  /**
   * Add a listener for function entry, return and throw operations.
   *
   * @param {Function} listener The listener to remove.
   */
  removeFunctionListener(listener) {
    let index = this.__functionListeners__.indexOf(listener);
    if (index == -1)
      throw new Error("listener is not registered!");
    this.__functionListeners__.splice(index, 1);
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
