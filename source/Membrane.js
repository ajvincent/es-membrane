/* Reference:  http://soft.vub.ac.be/~tvcutsem/invokedynamic/js-membranes
 * Definitions:
 * Object graph: A collection of values that talk to each other directly.
 */

function MembraneInternal(options = {}) {
  let passThrough = (typeof options.passThroughFilter === "function") ?
                    options.passThroughFilter :
                    returnFalse;

  Object.defineProperties(this, {
    "showGraphName": new NWNCDataDescriptor(
      Boolean(options.showGraphName), false
    ),

    "map": new NWNCDataDescriptor(
      new WeakMap(/*
        key: ProxyMapping instance

        key may be a Proxy, a value associated with a proxy, or an original value.
      */), false),

    "handlersByFieldName": new NWNCDataDescriptor({}, false),

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

Reflect.defineProperty(
  MembraneInternal,
  "Primordials",
  new NWNCDataDescriptor(Primordials, true) // this should be visible
);

/**
 * @private
 */
MembraneInternal.createPriorityQueue = function(levels) {
  return new PriorityQueue(levels);
};

{ // Membrane definition
MembraneInternal.prototype = Object.seal({
  allTraps: allTraps,

  /**
   * Returns true if we have a proxy for the value.
   */
  hasProxyForValue: function(field, value) {
    var mapping = this.map.get(value);
    return Boolean(mapping) && mapping.hasField(field);
  },

  /**
   * Get the value associated with a field name and another known value.
   *
   * @param field {Symbol|String}  The field to look for.
   * @param value {Variant} The key for the ProxyMapping map.
   *
   * @returns [
   *    {Boolean} True if the value was found.
   *    {Variant} The value for that field.
   * ]
   *
   * @note This method is not used internally in the membrane, but only by debug
   * code to assert that we have the right values stored.  Therefore you really
   * shouldn't use it in Production.
   */
  getMembraneValue: function(field, value) {
    var mapping = this.map.get(value);
    if (mapping && mapping.hasField(field)) {
      return [true, mapping.getValue(field)];
    }
    return [false, NOT_YET_DETERMINED];
  },

  /**
   * Get the proxy associated with a field name and another known value.
   *
   * @param field {Symbol|String}  The field to look for.
   * @param value {Variant} The key for the ProxyMapping map.
   *
   * @returns [
   *    {Boolean} True if the value was found.
   *    {Proxy}   The proxy for that field.
   * ] if field is not the value's origin field
   * 
   * @returns [
   *    {Boolean} True if the value was found.
   *    {Variant} The actual value
   * ] if field is the value's origin field
   *
   * @returns [
   *    {Boolean} False if the value was not found.
   *    {Object}  NOT_YET_DETERMINED
   * ]
   */
  getMembraneProxy: function(field, value) {
    var mapping = this.map.get(value);
    if (mapping && mapping.hasField(field)) {
      return [true, mapping.getProxy(field)];
    }
    return [false, NOT_YET_DETERMINED];
  },

  /**
   * Assign a value to an object graph.
   *
   * @param handler {ObjectGraphHandler} A graph handler to bind to the value.
   * @param value   {Variant} The value to assign.
   *
   * Options:
   *   @param mapping {ProxyMapping} A mapping with associated values and proxies.
   *
   * @returns {ProxyMapping} A mapping holding the value.
   *
   * @private
   */
  buildMapping: function(handler, value, options = {}) {
    if (!this.ownsHandler(handler))
      throw new Error("handler is not an ObjectGraphHandler we own!");
    let mapping = ("mapping" in options) ? options.mapping : null;

    if (!mapping) {
      if (this.map.has(value)) {
        mapping = this.map.get(value);
      }
  
      else {
        mapping = new ProxyMapping(handler.fieldName);
      }
    }
    assert(mapping instanceof ProxyMapping,
           "buildMapping requires a ProxyMapping object!");

    const isOriginal = (mapping.originField === handler.fieldName);
    assert(isOriginal || this.ownsHandler(options.originHandler),
           "Proxy requests must pass in an origin handler");
    let shadowTarget = makeShadowTarget(value);

    var parts;
    if (isOriginal) {
      parts = { value: value };
      if (!Reflect.isExtensible(value)) {
        const keys = Reflect.ownKeys(value);
        keys.forEach(function(key) {
          const desc = Reflect.getOwnPropertyDescriptor(value, key);
          Reflect.defineProperty(shadowTarget, key, desc);
        });
        Reflect.preventExtensions(shadowTarget);
      }
    }
    else {
      parts = Proxy.revocable(shadowTarget, handler);
      parts.value = value;
    }

    parts.shadowTarget = shadowTarget;
    mapping.set(this, handler.fieldName, parts);
    makeRevokeDeleteRefs(parts, mapping, handler.fieldName);

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

    handler.addRevocable(isOriginal ? mapping : parts.revoke);
    return mapping;
  },

  hasHandlerByField: function(field) {
    {
      let t = typeof field;
      if ((t != "string") && (t != "symbol"))
        throw new Error("field must be a string or a symbol!");
    }
    return Reflect.ownKeys(this.handlersByFieldName).includes(field);
  },

  /**
   * Get an ObjectGraphHandler object by field name.  Build it if necessary.
   *
   * @param field      {Symbol|String}  The field name for the object graph.
   * @param options    {Object} Broken down as follows:
   * - mustCreate {Boolean} True if we must create a missing graph handler.
   *
   * @returns {ObjectGraphHandler} The handler for the object graph.
   */
  getHandlerByName: function(field, options) {
    if (typeof options === "boolean")
      throw new Error("fix me!");
    let mustCreate = (typeof options == "object") ?
                     Boolean(options.mustCreate) :
                     false;
    if (mustCreate && !this.hasHandlerByField(field))
      this.handlersByFieldName[field] = new ObjectGraphHandler(this, field);
    return this.handlersByFieldName[field];
  },

  /**
   * Determine if the handler is a ObjectGraphHandler for this object graph.
   *
   * @returns {Boolean} True if the handler is one we own.
   */
  ownsHandler: function(handler) {
    if (ChainHandlers.has(handler))
      handler = handler.baseHandler;
    return (handler instanceof ObjectGraphHandler) &&
           (this.handlersByFieldName[handler.fieldName] === handler);
  },

  /**
   * Wrap a value for the first time in an object graph.
   *
   * @param mapping {ProxyMapping}  A mapping whose origin field refers to the
   *                                value's object graph.
   * @param arg     {Variant}       The value to wrap.
   *
   * @note This marks the value as the "original" in the new ProxyMapping it
   * creates.
   */
  wrapArgumentByProxyMapping: function(mapping, arg, options = {}) {
    if (this.map.has(arg) || (valueType(arg) === "primitive"))
      return;

    let handler = this.getHandlerByName(mapping.originField);
    this.buildMapping(handler, arg, options);
    
    assert(this.map.has(arg),
           "wrapArgumentByProxyMapping should define a ProxyMapping for arg");
    let argMap = this.map.get(arg);
    assert(argMap instanceof ProxyMapping, "argMap isn't a ProxyMapping?");
    assert(argMap.getOriginal() === arg,
           "wrapArgumentByProxyMapping didn't establish the original?");
  },

  passThroughFilter: () => false,

  /**
   * Ensure an argument is properly wrapped in a proxy.
   *
   * @param origin {ObjectGraphHandler} Where the argument originated from
   * @param target {ObjectGraphHandler} The object graph we're returning the arg to.
   * @param arg    {Variant}         The argument.
   *
   * @returns {Proxy}   The proxy for that field
   *   if field is not the value's origin field
   * 
   * @returns {Variant} The actual value
   *   if field is the value's origin field
   *
   * @throws {Error} if failed (this really should never happen)
   */
  convertArgumentToProxy:
  function(originHandler, targetHandler, arg, options = {}) {
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

    let found, rv;
    [found, rv] = this.getMembraneProxy(
      targetHandler.fieldName, arg
    );
    if (found)
      return rv;

    if (!this.ownsHandler(originHandler) ||
        !this.ownsHandler(targetHandler) ||
        (originHandler.fieldName === targetHandler.fieldName)) {
      throw new Error("convertArgumentToProxy requires two different ObjectGraphHandlers in the Membrane instance");
    }

    if (this.passThroughFilter(arg) ||
        (originHandler.passThroughFilter(arg) && targetHandler.passThroughFilter(arg))) {
      return arg;
    }

    if (!this.hasProxyForValue(originHandler.fieldName, arg)) {
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
    
    if (!this.hasProxyForValue(targetHandler.fieldName, arg)) {
      let argMap = this.map.get(arg);
      let passOptions = Object.create(options, {
        "originHandler": new DataDescriptor(originHandler)
      });
      assert(argMap, "ProxyMapping not created before invoking target handler?");

      Reflect.defineProperty(
        passOptions, "mapping", new DataDescriptor(argMap)
      );

      this.buildMapping(targetHandler, arg, passOptions);
    }

    [found, rv] = this.getMembraneProxy(
      targetHandler.fieldName, arg
    );
    if (!found)
      throw new Error("in convertArgumentToProxy(): proxy not found");
    return rv;
  },

  /**
   * Link two values together across object graphs.
   *
   * @param handler0 {ObjectGraphHandler} The graph handler that should own value0.
   * @param value0   {Object}             The first value to store.
   * @param handler1 {ObjectGraphHandler} The graph handler that should own value1.
   * @param value1   {Variant}            The second value to store.
   */
  bindValuesByHandlers: function(handler0, value0, handler1, value1) {
    /** XXX ajvincent The logic here is convoluted, I admit.  Basically, if we
     * succeed:
     * handler0 must own value0
     * handler1 must own value1
     * the ProxyMapping instances for value0 and value1 must be the same
     * there must be no collisions between any properties of the ProxyMapping
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
        const field = rv.handler.fieldName;
        const valid = (!rv.proxyMap ||
                        (rv.proxyMap.hasField(field) &&
                        (rv.proxyMap.getProxy(field) === v)));
        if (!valid)
          throw new Error("Value argument does not belong to proposed ObjectGraphHandler");
      }

      return rv;
    }

    function checkField(bag) {
      if (proxyMap.hasField(bag.handler.fieldName)) {
        let check = proxyMap.getProxy(bag.handler.fieldName);
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
      if (proxyMap.originField === bag.handler.fieldName)
        parts.value = bag.value;
      else
        parts.value = proxyMap.getOriginal();
      proxyMap.set(this, bag.handler.fieldName, parts);
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
        proxyMap = new ProxyMapping(propBag0.handler.fieldName);
      }
      else
        proxyMap = propBag1.proxyMap;
    }

    checkField(propBag0);
    checkField(propBag1);

    if (propBag0.handler.fieldName === propBag1.handler.fieldName) {
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
      let [found, check] = this.getMembraneProxy(propBag0.handler.fieldName, propBag0.value);
      assert(found, "value0 mapping not found?");
      assert(check === propBag0.value, "value0 not found in handler0 field name?");

      [found, check] = this.getMembraneProxy(propBag1.handler.fieldName, propBag0.value);
      assert(found, "value0 mapping not found?");
      assert(check === propBag1.value, "value0 not found in handler0 field name?");
    }

    if (propBag1.type !== "primitive") {
      let [found, check] = this.getMembraneProxy(propBag0.handler.fieldName, propBag1.value);
      assert(found, "value1 mapping not found?");
      assert(check === propBag0.value, "value0 not found in handler0 field name?");

      [found, check] = this.getMembraneProxy(propBag1.handler.fieldName, propBag1.value);
      assert(found, "value1 mapping not found?");
      assert(check === propBag1.value, "value1 not found in handler1 field name?");
    }
  },

  /**
   * Wrap the methods of a descriptor in an object graph.
   *
   * This method should NOT be exposed to the public.
   */
  wrapDescriptor: function(originField, targetField, desc) {
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

    var originHandler = this.getHandlerByName(originField);
    var targetHandler = this.getHandlerByName(targetField);
    var membrane = this;

    ["value", "get", "set"].forEach(function(descProp) {
      if (keys.includes(descProp))
        wrappedDesc[descProp] = this.convertArgumentToProxy(
          originHandler,
          targetHandler,
          desc[descProp]
        );
    }, this);

    return wrappedDesc;
  },

  /* Disabled, dead API.
  calledFromHandlerTrap: function() {
    return this.handlerStack[1] !== "external";
  },
  */

  /**
   * Add a listener for function entry, return and throw operations.
   *
   * @param listener {Function} The listener to add.
   *
   * @see ObjectGraphHandler.prototype.notifyFunctionListeners for what each
   * listener will get for its arguments.
   */
  addFunctionListener: function(listener) {
    if (typeof listener != "function")
      throw new Error("listener is not a function!");
    if (!this.__functionListeners__.includes(listener))
      this.__functionListeners__.push(listener);
  },

  /**
   * Add a listener for function entry, return and throw operations.
   *
   * @param listener {Function} The listener to remove.
   */
  removeFunctionListener: function(listener) {
    let index = this.__functionListeners__.indexOf(listener);
    if (index == -1)
      throw new Error("listener is not registered!");
    this.__functionListeners__.splice(index, 1);
  },

  /**
   * A flag indicating if internal properties of the Membrane are private.
   * 
   * @public
   */
  secured: false,

  __mayLog__: MembraneMayLog,

  warnOnce: function(message) {
    if (this.logger && !this.warnOnceSet.has(message)) {
      this.warnOnceSet.add(message);
      this.logger.warn(message);
    }
  },

  get constants() {
    return Constants;
  }
});

} // end Membrane definition
Object.seal(MembraneInternal);
