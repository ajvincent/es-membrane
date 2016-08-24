function valueType(value) {
  if (value === null)
    return "primitive";
  const type = typeof value;
  if ((type != "function") && (type != "object"))
    return "primitive";
  return type;
}

function inGraphHandler(trapName, callback) {
  return function() {
    this.membrane.handlerStack.unshift(trapName);

    if (typeof this.logger == "object") {
      this.logger.trace(
        trapName + " inGraphHandler++",
        this.membrane.handlerStack.length - 2
      );
    }

    var rv;
    try {
      rv = callback.apply(this, arguments);
    }

    // We might have a catch block here to wrap exceptions crossing the membrane.

    finally {
      this.membrane.handlerStack.shift();
      if (typeof this.logger == "object") {
        this.logger.trace(
          trapName + " inGraphHandler--",
          this.membrane.handlerStack.length - 2
        );
      }
    }

    return rv;
  };
}

const NOT_YET_DETERMINED = {};
Object.defineProperty(
  NOT_YET_DETERMINED,
  "not_yet_determined",
  new DataDescriptor(true)
);
function ProxyMapping(originField) {
  this.originField = originField;
  this.proxiedFields = {
    /* field: {
     *   value: value,
     *   proxy: proxy,
     *   revoke: revoke
     * }
     */
  };

  this.originalValue = NOT_YET_DETERMINED;
  this.protoMapping = NOT_YET_DETERMINED;
}
{ // ProxyMapping definition
ProxyMapping.prototype.getOriginal = function() {
  if (this.originalValue === NOT_YET_DETERMINED)
    throw new Error("getOriginal called but the original value hasn't been set!");
  return this.originalValue;
};

ProxyMapping.prototype.hasField = function(field) {
  return Object.getOwnPropertyNames(this.proxiedFields).includes(field);
};

ProxyMapping.prototype.getValue = function(field) {
  var rv = this.proxiedFields[field];
  if (!rv)
    throw new Error("getValue called for unknown field!");
  rv = rv.value;
  return rv;
};

ProxyMapping.prototype.getProxy = function(field) {
  var rv = this.proxiedFields[field];
  if (!rv)
    throw new Error("getProxy called for unknown field!");
  rv = (field === this.originField) ? rv.value : rv.proxy;
  return rv;
};

ProxyMapping.prototype.hasProxy = function(proxy) {
  let fields = Object.getOwnPropertyNames(this.proxiedFields);
  for (let i = 0; i < fields.length; i++) {
    if (this.getProxy(fields[i]) === proxy)
      return true;
  }
  return false;
};

/**
 * Add a value to the mapping.
 *
 * @param membrane {Membrane} The owning membrane.
 * @param field    {String}   The field name of the object graph.
 * @param parts    {Object} containing:
 *   @param value    {Variant}  The value to add.
 *   @param proxy    {Proxy}    A proxy associated with the object graph and the value.
 *   @param revoke   {Function} A revocation function for the proxy, if available.
 *   @param override {Boolean}  True if the field should be overridden.
 */
ProxyMapping.prototype.set = function(membrane, field, parts) {
  let override = (typeof parts.override === "boolean") && parts.override;
  if (!override && this.hasField(field))
    throw new Error("set called for previously defined field!");

  delete parts.override;

  this.proxiedFields[field] = parts;

  if (override || (field !== this.originField))
    membrane.map.set(parts.proxy, this);
  else if (this.originalValue === NOT_YET_DETERMINED) {
    this.originalValue = parts.value;
    delete parts.proxy;
    delete parts.revoke;
  }
  
  if (!membrane.map.has(parts.value))
    membrane.map.set(parts.value, this);
  else
    assert(this === membrane.map.get(parts.value), "ProxyMapping mismatch?");
};

ProxyMapping.prototype.selfDestruct = function(membrane) {
  let fields = Object.getOwnPropertyNames(this.proxiedFields);
  for (let i = (fields.length - 1); i >= 0; i--) {
    let field = fields[i];
    if (field !== this.originField) {
      membrane.map.delete(this.proxiedFields[field].proxy);
    }
    membrane.map.delete(this.proxiedFields[field].value);
    delete this.proxiedFields[field];
  }
};

ProxyMapping.prototype.revoke = function() {
  let fields = Object.getOwnPropertyNames(this.proxiedFields);
  // fields[0] === this.originField
  for (let i = 1; i < fields.length; i++) {
    this.proxiedFields[fields[i]].revoke();
  }
};
} // end ProxyMapping definition
/* Reference:  http://soft.vub.ac.be/~tvcutsem/invokedynamic/js-membranes
 * Definitions:
 * Object graph: A collection of values that talk to each other directly.
 */

function MembraneInternal(options) {
  Object.defineProperties(this, {
    "showGraphName": {
      value: Boolean(options.showGraphName),
      writable: false,
      enumerable: false,
      configurable: false
    },

    "map": {
      value: new WeakMap(/*
        key: ProxyMapping instance

        key may be a Proxy, a value associated with a proxy, or an original value.
      */),
      writable: false,
      enumerable: false,
      configurable:false
    },

    "handlerStack": {
      /* This has two "external" strings because at all times, we require
       * two items on the handlerStack, for
       * Membrane.prototype.calledFromHandlerTrap().
       */
      value: ["external", "external"],
      writable: true,
      enumerable: false,
      configurable: false,
    },

    "handlersByFieldName": {
      value: {},
      writable: false,
      enumerable: false,
      configurable: false
    },

    "logger": {
      value: options.logger || null,
      writable: false,
      enumerable: false,
      configurable: false
    }
  });
}
{ // Membrane definition
MembraneInternal.prototype = {
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
   * @param field {String}  The field to look for.
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
   * @param field {String}  The field to look for.
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
   * @param field {String} The name of the object graph.
   * @param value {Variant} The value to assign.
   *
   * Options:
   *   @param mapping {ProxyMapping} A mapping with associated values and proxies.
   *
   * @returns {ProxyMapping} A mapping holding the value.
   */
  buildMapping: function(field, value, options = {}) {
    if (typeof field != "string")
      throw new Error("field must be a string!");
    var mapping = ("mapping" in options) ? options.mapping : null;

    if (!mapping) {
      if (this.map.has(value)) {
        mapping = this.map.get(value);
      }
  
      else {
        mapping = new ProxyMapping(field);
      }
    }
    assert(mapping instanceof ProxyMapping,
           "buildMapping requires a ProxyMapping object!");

    let handler = this.getHandlerByField(field);
    let parts = Proxy.revocable(value, handler);
    parts.value = value;
    mapping.set(this, field, parts);
    handler.addRevocable(mapping.originField === field ? mapping : parts.revoke);
    return mapping;
  },

  /**
   * Get an ObjectGraphHandler object by field name.  Build it if necessary.
   *
   * @param field {String} The field name for the object graph.
   *
   * @returns {ObjectGraphHandler} The handler for the object graph.
   */
  getHandlerByField: function(field) {
    if (!(field in this.handlersByFieldName))
      this.handlersByFieldName[field] = new ObjectGraphHandler(this, field);
    return this.handlersByFieldName[field];
  },

  /**
   * Determine if the handler is a ObjectGraphHandler for this object graph.
   *
   * XXX ajvincent With ObjectGraphHandler.replaceProxy, we must check the
   * prototype chain!
   *
   * @returns {Boolean} True if the handler is one we own.
   */
  ownsHandler: function(handler) {
    return (Boolean(handler) &&
            (this.handlersByFieldName[handler.fieldName] === handler));
  },

  /**
   * Wrap a value in the object graph for a given ObjectGraphHandler.
   *
   * @param handler {ObjectGraphHandler} The handler for the desired object graph.
   * @param arg     {Variant}            The value to wrap.
   * @param options {Object}             Options to forward to this.buildMapping.
   *
   * @returns {Variant} The value in the targeted object graph.  (NOT a Proxy.)
   */
  wrapArgumentByHandler: function(handler, arg, options = {}) {
    // XXX ajvincent Ensure all callers do not need the return argument!
    if (!(handler instanceof ObjectGraphHandler) ||
        (handler !== this.getHandlerByField(handler.fieldName)))
      throw new Error("wrapArgumentByHandler:  handler mismatch");
    const type = valueType(arg);
    if (type == "primitive")
      return arg;
    const mayLog = this.__mayLog__();

    var found = this.hasProxyForValue(handler.fieldName, arg);
    if (found)
      return arg;

    let argMap = this.map.get(arg);
    if (mayLog) {
      this.logger.trace("wrapArgumentByHandler found: " + Boolean(argMap));
    }

    let passOptions;
    if (argMap) {
      passOptions = Object.create(options, {
        "mapping": {
          "value": argMap,
          "writable": false,
          "enumerable": true,
          "configurable": true
        }
      });
    }
    else {
      passOptions = options;
    }
        
    this.buildMapping(
      handler.fieldName,
      arg,
      passOptions
    );

    return arg; // It may have changed along the way.
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

    let handler = this.getHandlerByField(mapping.originField);
    this.wrapArgumentByHandler(handler, arg, options);
    
    assert(this.map.has(arg),
           "wrapArgumentByProxyMapping should define a ProxyMapping for arg");
    let argMap = this.map.get(arg);
    assert(argMap instanceof ProxyMapping, "argMap isn't a ProxyMapping?");
    assert(argMap.getOriginal() === arg,
           "wrapArgumentByProxyMapping didn't establish the original?");
  },

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
    var override = ("override" in options) && Boolean(options.override);
    if (override) {
      let map = this.map.get(arg);
      if (map) {
        map.selfDestruct(this);
      }
    }

    if (valueType(arg) === "primitive") {
      return arg;
    }
    if (!this.ownsHandler(originHandler) ||
        !this.ownsHandler(targetHandler) ||
        (originHandler === targetHandler)) {
      throw new Error("convertArgumentToProxy requires two different ObjectGraphHandlers in the Membrane instance");
    }

    this.wrapArgumentByHandler(originHandler, arg);
    this.wrapArgumentByHandler(targetHandler, arg);

    let found, rv;
    [found, rv] = this.getMembraneProxy(
      targetHandler.fieldName, arg
    );
    if (!found)
      throw new Error("in convertArgumentToProxy(): proxy not found");
    return rv;
  },

  /**
   * Wrap the methods of a descriptor in an object graph.
   *
   * This method should NOT be exposed to the public.
   */
  wrapDescriptor: function(originField, targetField, desc) {
    if (!desc)
      return desc;
    var keys = Object.keys(desc);

    var wrappedDesc = {
      configurable: Boolean(desc.configurable),
      enumerable: Boolean(desc.enumerable)
    };
    if (keys.includes("writable")) {
      wrappedDesc.writable = Boolean(desc.writable);
      if (!wrappedDesc.configurable && !wrappedDesc.writable)
        return desc;
    }

    var originHandler = this.getHandlerByField(originField);
    var targetHandler = this.getHandlerByField(targetField);

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

  calledFromHandlerTrap: function() {
    return this.handlerStack[1] !== "external";
  },

  /**
   * Helper function to determine if anyone may log.
   * @private
   *
   * @returns {Boolean} True if logging is permitted.
   */
  __mayLog__: function() {
    return (typeof this.logger == "object") && Boolean(this.logger);
  },
};
} // end Membrane definition

/* A proxy handler designed to return only primitives and objects in a given
 * object graph, defined by the fieldName.
 */
function ObjectGraphHandler(membrane, fieldName) {
  if (typeof fieldName != "string")
    throw new Error("fieldName must be a string!");

  Object.defineProperties(this, {
    "membrane": new DataDescriptor(membrane, false, false, false),
    "fieldName": new DataDescriptor(fieldName, false, false, false),

    /* Temporary until membraneGraphName is defined on Object.prototype through
     * the object graph.
     */
    "graphNameDescriptor": new DataDescriptor(
      new DataDescriptor(fieldName), false, false, false
    ),

    "__revokeFunctions__": new DataDescriptor([], false, false, false),

    "__isDead__": new DataDescriptor(false, true, true, true),
  });
}
{ // ObjectGraphHandler definition
ObjectGraphHandler.prototype = {
  /* Strategy for each handler trap:
   * (1) Determine the target's origin field name.
   * (2) Wrap all non-primitive arguments for Reflect in the target field.
   * (3) var rv = Reflect[trapName].call(argList);
   * (4) Wrap rv in this.fieldName's field.
   * (5) return rv.
   *
   * Error stack trace hiding will be determined by the membrane itself.
   *
   * Hiding of properties should be done by another proxy altogether.
   * See replaceProxy method for details.
   */

  // ProxyHandler
  ownKeys: inGraphHandler("ownKeys", function(target) {
    var targetMap = this.membrane.map.get(target);
    var _this = targetMap.getOriginal();
    var rv = this.externalHandler(function() {
      return Reflect.ownKeys(_this);
    });

    if (this.membrane.showGraphName && !rv.includes("membraneGraphName")) {
      rv.push("membraneGraphName");
    }
    return rv;
  }),

  // ProxyHandler
  has: inGraphHandler("has", function(target, propName) {
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

    {
      let type = typeof propName;
      if ((type != "string") && (type != "symbol"))
        throw new Error("propName is not a symbol or a string!");
    }

    var hasOwn;
    while (target !== null) {
      hasOwn = this.getOwnPropertyDescriptor(target, propName);
      if (typeof hasOwn !== "undefined")
        return true;
      target = this.getPrototypeOf(target);
    }
    return false;
  }),

  // ProxyHandler
  get: inGraphHandler("get", function(target, propName, receiver) {
    var found = false, rv;
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

    {
      // 1. Assert: IsPropertyKey(P) is true.
      let type = typeof propName;
      if ((type != "string") && (type != "symbol"))
        throw new Error("propName is not a symbol or a string!");
    }

    var desc;
    /*
    2. Let desc be ? O.[[GetOwnProperty]](P).
    3. If desc is undefined, then
         a. Let parent be ? O.[[GetPrototypeOf]]().
         b. If parent is null, return undefined.
         c. Return ? parent.[[Get]](P, Receiver).
     */
    desc = this.getOwnPropertyDescriptor(target, propName);
    {
      if (!desc) {
        let parent = this.getPrototypeOf(target);
        if (parent === null)
          return undefined;
        // This will call this.get(parent, propName, receiver);
        rv = this.externalHandler(function() {
          return Reflect.get(parent, propName, receiver);
        });
        found = true;
      }
    }

    // 4. If IsDataDescriptor(desc) is true, return desc.[[Value]].
    if (!found && isDataDescriptor(desc)) {
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
        rv = this.externalHandler(function() {
          return Reflect.apply(getter, receiver, []);
        });
        found = true;
      }
    }

    if (!found) {
      // end of the algorithm
      throw new Error("Membrane fall-through: we should not get here");
    }

    {
      let targetMap = this.membrane.map.get(target);
      return this.membrane.convertArgumentToProxy(
        this.membrane.getHandlerByField(targetMap.originField),
        this,
        rv
      );
    }
  }),

  // ProxyHandler
  getOwnPropertyDescriptor:
  inGraphHandler("getOwnPropertyDescriptor", function(target, propName) {
    const mayLog = this.membrane.__mayLog__();
    if (mayLog) {
      this.membrane.logger.debug("propName: " + propName.toString());
    }

    if (this.membrane.showGraphName && (propName == "membraneGraphName")) {
      return this.graphNameDescriptor;
    }

    try {
      var targetMap = this.membrane.map.get(target);
      var _this = targetMap.getOriginal();

      var desc = this.externalHandler(function() {
        return Reflect.getOwnPropertyDescriptor(_this, propName);
      });
      desc = this.membrane.wrapDescriptor(
        targetMap.originField,
        this.fieldName,
        desc
      );
      return desc;
    }
    catch (e) {
      if (mayLog) {
        this.membrane.logger.error(e.message, e.stack);
      }
      throw e;
    }
  }),

  // ProxyHandler
  getPrototypeOf: inGraphHandler("getPrototypeOf", function(target) {
    try {
      var targetMap = this.membrane.map.get(target);
      if (targetMap.protoMapping === NOT_YET_DETERMINED) {
        let proto = this.externalHandler(function() {
          return Reflect.getPrototypeOf(target);
        });
        let pType = valueType(proto);
        if (pType == "primitive") {
          assert(proto === null,
                 "Reflect.getPrototypeOf(target) should return Object or null");
          targetMap.protoMapping = null;
        }
        else {
          let pMapping = this.membrane.map.get(proto);
          if (!pMapping) {
            this.membrane.wrapArgumentByProxyMapping(targetMap, proto);
            pMapping = this.membrane.map.get(proto);
            assert(pMapping instanceof ProxyMapping,
                   "We didn't get a proxy mapping for proto?");
          }
          targetMap.protoMapping = pMapping;
        }
      }

      {
        let pMapping = targetMap.protoMapping;
        if (pMapping === null)
          return null;
        assert(pMapping instanceof ProxyMapping,
               "We must have a property mapping by now!");
        if (!pMapping.hasField(this.fieldName)) {
          let proto = pMapping.getOriginal();
          this.membrane.wrapArgumentByHandler(this, proto);
          assert(pMapping.hasField(this.fieldName),
                 "wrapArgumentByHandler should've established a field name!");
        }

        let proxy = pMapping.getProxy(this.fieldName);
        return proxy;
      }
    }
    catch (e) {
      if (this.membrane.__mayLog__()) {
        this.membrane.logger.error(e.message, e.stack);
      }
      throw e;
    }
  }),

  // ProxyHandler
  isExtensible: inGraphHandler("isExtensible", function(target) {
    var targetMap = this.membrane.map.get(target);
    var _this = targetMap.getOriginal();
    return this.externalHandler(function() {
      return Reflect.isExtensible(_this);
    });
  }),

  // ProxyHandler
  preventExtensions: inGraphHandler("preventExtensions", function(target) {
    if (!this.isExtensible(target))
      return true;
    var targetMap = this.membrane.map.get(target);
    var _this = targetMap.getOriginal();
    return this.externalHandler(function() {
      return Reflect.preventExtensions(_this);
    });
  }),

  // ProxyHandler
  deleteProperty: inGraphHandler("deleteProperty", function(target, propName) {
    const mayLog = this.membrane.__mayLog__();
    if (mayLog) {
      this.membrane.logger.debug("propName: " + propName.toString());
    }
    try {
      var targetMap = this.membrane.map.get(target);
      var _this = targetMap.getOriginal();
      return this.externalHandler(function() {
        return Reflect.deleteProperty(_this, propName);
      });
    }
    catch (e) {
      if (mayLog) {
        this.membrane.logger.error(e.message, e.stack);
      }
      throw e;
    }
  }),

  // ProxyHandler
  defineProperty:
  inGraphHandler("defineProperty", function(target, propName, desc) {
    const mayLog = this.membrane.__mayLog__();
    if (mayLog) {
      this.membrane.logger.debug("propName: " + propName.toString());
    }

    try {
      var targetMap = this.membrane.map.get(target);
      var _this = targetMap.getOriginal();
      desc = this.membrane.wrapDescriptor(
        this.fieldName,
        targetMap.originField,
        desc
      );
      return this.externalHandler(function() {
        return Reflect.defineProperty(_this, propName, desc);
      });
    }
    catch (e) {
      if (mayLog) {
        this.membrane.logger.error(e.message, e.stack);
      }
      throw e;
    }
  }),

  // ProxyHandler
  set: inGraphHandler("set", function(target, propName, value, receiver) {
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

    const mayLog = this.membrane.__mayLog__();
    if (mayLog) {
      this.membrane.logger.debug("set propName: " + propName);
    }
    {
      // 1. Assert: IsPropertyKey(P) is true.
      let type = typeof propName;
      if ((type != "string") && (type != "symbol"))
        throw new Error("propName is not a symbol or a string!");
    }

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
    let ownDesc;
    {
      ownDesc = this.getOwnPropertyDescriptor(target, propName);
      if (!ownDesc) {
        let parent = this.getPrototypeOf(target);
        if (parent) {
          // This will call this.set(parent, propName, value, receiver);
          return this.externalHandler(function() {
            return Reflect.set(parent, propName, value, receiver);
          });
        }
        else
          ownDesc = new DataDescriptor(undefined, true);
      }
    }

    // Special step:  convert receiver to unwrapped value.
    let receiverMap = this.membrane.map.get(receiver);
    if (!receiverMap) {
      // We may be under construction.
      let proto = Object.getPrototypeOf(receiver);
      let protoMap = this.membrane.map.get(proto);
      let pHandler = this.membrane.getHandlerByField(protoMap.originField);

      if (this.membrane.map.has(receiver)) {
        /* XXX ajvincent If you're stepping through in a debugger, the debugger
         * may have set this.membrane.map.get(receiver) between actions.
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
      
      receiverMap = this.membrane.map.get(receiver);
      if (!receiverMap)
        throw new Error("How do we still not have a receiverMap?");
      if (receiverMap.originField === this.fieldName)
        throw new Error("Receiver's field name should not match!");
    }
    receiver = receiverMap.getOriginal();
    
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
      
      let existingDesc = this.externalHandler(function() {
        return Reflect.getOwnPropertyDescriptor(receiver, propName);
      });
      if (existingDesc !== undefined) {
        if (isAccessorDescriptor(existingDesc) || !existingDesc.writable)
          return false;
      }

      let rvProxy = new DataDescriptor(
        // Only now do we convert the value to the target object graph.
        this.membrane.convertArgumentToProxy(
          this,
          this.membrane.getHandlerByField(receiverMap.originField),
          value
        ),
        true
      );
      return this.externalHandler(function() {
        return Reflect.defineProperty(receiver, propName, rvProxy);
      });
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
    // 8. Perform ? Call(setter, Receiver, « V »).
    {
      // Only now do we convert the value to the target object graph.
      let rvProxy = this.membrane.convertArgumentToProxy(
        this,
        this.membrane.getHandlerByField(receiverMap.originField),
        value
      );
      this.externalHandler(function() {
        Reflect.apply(setter, receiver, [ rvProxy ]);
      });
    }

    // 9. Return true.
    return true;
  }),

  // ProxyHandler
  setPrototypeOf: inGraphHandler("setPrototypeOf", function(target, proto) {
    try {
      var targetMap = this.membrane.map.get(target);
      var _this = targetMap.getOriginal();
      let protoProxy = this.membrane.convertArgumentToProxy(
        this,
        this.membrane.getHandlerByField(targetMap.originField),
        proto
      );
      var rv = this.externalHandler(function() {
        return Reflect.setPrototypeOf(_this, protoProxy);
      });

      // We want to break any links that this.getPrototypeOf might have cached.
      targetMap.protoMapping = NOT_YET_DETERMINED;

      return rv;
    }
    catch (e) {
      const mayLog = this.membrane.__mayLog__();
      if (mayLog) {
        this.membrane.logger.error(e.message, e.stack);
      }
      throw e;
    }
  }),

  // ProxyHandler
  apply: inGraphHandler("apply", function(target, thisArg, argumentsList) {
    var _this, args = [];
    let targetMap  = this.membrane.map.get(target);
    let argHandler = this.membrane.getHandlerByField(targetMap.originField);

    const mayLog = this.membrane.__mayLog__();
    if (mayLog) {
      this.membrane.logger.debug([
        "apply originFields: inbound = ",
        argHandler.fieldName,
        ", outbound = ",
        this.fieldName
      ].join(""));
    }

    _this = this.membrane.convertArgumentToProxy(
      this,
      argHandler,
      thisArg
    );

    if (mayLog) {
      this.membrane.logger.debug("apply this.membraneGraphName: " + _this.membraneGraphName);
    }
    for (var i = 0; i < argumentsList.length; i++) {
      let nextArg = argumentsList[i];
      nextArg = this.membrane.convertArgumentToProxy(
        this,
        argHandler,
        nextArg
      );
      args.push(nextArg);

      if (mayLog && (valueType(nextArg) != "primitive")) {
        this.membrane.logger.debug("apply argument " + i + "'s membraneGraphName: " + nextArg.membraneGraphName);
      }
    }

    if (mayLog) {
      this.membrane.logger.debug("apply about to call function");
    }
    var rv = this.externalHandler(function() {
      return Reflect.apply(target, _this, args);
    });
    if (mayLog) {
      this.membrane.logger.debug("apply wrapping return value");
    }

    rv = this.membrane.convertArgumentToProxy(
      argHandler,
      this,
      rv
    );

    if (mayLog) {
      this.membrane.logger.debug("apply exiting");
    }
    return rv;
  }),

  // ProxyHandler
  construct:
  inGraphHandler("construct", function(target, argumentsList, newTarget) {
    var args = [];
    let targetMap  = this.membrane.map.get(target);
    let argHandler = this.membrane.getHandlerByField(targetMap.originField);

    const mayLog = this.membrane.__mayLog__();
    if (mayLog) {
      this.membrane.logger.debug([
        "construct originFields: inbound = ",
        argHandler.fieldName,
        ", outbound = ",
        this.fieldName
      ].join(""));
    }

    for (var i = 0; i < argumentsList.length; i++) {
      let nextArg = argumentsList[i];
      nextArg = this.membrane.convertArgumentToProxy(
        this,
        argHandler,
        nextArg
      );
      args.push(nextArg);

      if (mayLog && (valueType(nextArg) != "primitive")) {
        this.membrane.logger.debug("construct argument " + i + "'s membraneGraphName: " + nextArg.membraneGraphName);
      }
    }

    var rv = this.externalHandler(function() {
      return Reflect.construct(target, args, newTarget);
    });

    rv = this.membrane.convertArgumentToProxy(
      argHandler,
      this,
      rv
    );

    let proto = this.get(target, "prototype");
    this.setPrototypeOf(rv, proto);

    if (mayLog) {
      this.membrane.logger.debug("construct exiting");
    }
    return rv;
  }),

  /**
   * Handle a call to code the membrane doesn't control.
   *
   * @private
   */
  externalHandler: function(callback) {
    return inGraphHandler("external", callback).apply(this);
  },

  /**
   * Add a ProxyMapping or a Proxy.revoke function to our list.
   *
   * @private
   */
  addRevocable: function(revoke) {
    if (this.__isDead__)
      throw new Error("This membrane handler is dead!");
    this.__revokeFunctions__.push(revoke);
  },

  /**
   * Revoke the entire object graph.
   *
   * @private
   */
  revokeEverything: function() {
    if (this.__isDead__)
      throw new Error("This membrane handler is dead!");
    Object.defineProperty(this, "__isDead__", {
      value: true,
      writable: false,
      enumerable: true,
      configurable: false
    });
    let length = this.__revokeFunctions__.length;
    for (var i = 0; i < length; i++) {
      let revocable = this.__revokeFunctions__[i];
      if (revocable instanceof ProxyMapping)
        revocable.revoke();
      else // typeof revocable == "function"
        revocable();
    }
  },

  replaceProxy: function(oldProxy, handler) {
    if (this.__isDead__)
      throw new Error("This membrane handler is dead!");

    /* These assertions are to make sure the proxy we're replacing is safe to
     * use in the membrane.
     *
     * First, ensure the proxy actually belongs to the object graph this
     * handler represents.
     */
    let map = this.membrane.map.get(oldProxy);
    let thisMsg = "this ObjectGraphHandler (" + this.fieldName + ")";
    if (!map || map.getProxy(this.fieldName) != oldProxy) {
      throw new Error("You cannot replace a proxy that doesn't belong to " + thisMsg + "!");
    }

    /* Second, to try and ensure the handler respects the rules of the
     * membrane and the object graph, ensure it has an appropriate
     * ProxyHandler on its prototype chain.  If the old proxy is actually the
     * original value, the handler must have Reflect on its prototype chain.
     * Otherwise, the handler must have this on its prototype chain.
     *
     * Note that the handler can be Reflect or this, respectively:  that's
     * perfectly legal, as a way of restoring original behavior for the given
     * object graph.
     */
    let isOrigin = (this.fieldName === map.originField);
    let baseProto = isOrigin ? Reflect : this;
    let desiredProto = handler;
    while (desiredProto !== baseProto) {
      desiredProto = Object.getPrototypeOf(desiredProto);
      if (!desiredProto)
        throw new Error("ProxyHandler must inherit from " + (isOrigin ? "Reflect" : thisMsg) + "!");
    }

    // Finally, do the actual proxy replacement.
    let original = map.getOriginal();
    let parts = Proxy.revocable(original, handler);
    parts.value = original;
    parts.override = true;
    map.set(this.membrane, this.fieldName, parts);
    this.addRevocable(map.originField === this.fieldName ? mapping : parts.revoke);
    return parts.proxy;
  },
};

} // end ObjectGraphHandler definition
/*
We will wrap the Membrane constructor in a Membrane, to protect the internal API
from public usage.  This is known as "eating your own dogfood" in software
engineering parlance.  Not only is it an additional proof-of-concept that the
Membrane works, but it will help ensure external consumers of the membrane
module cannot rewrite how each individual Membrane works.
*/
var Membrane;
var DogfoodMembrane;
if (false) {
  DogfoodMembrane = new MembraneInternal({
    /* configuration options here */
  });
  let publicAPI   = DogfoodMembrane.getHandlerByField("public");
  let internalAPI = DogfoodMembrane.getHandlerByField("internal");

  // lockdown of the public API here

  // Define our Membrane constructor properly.
  Membrane = DogfoodMembrane.convertArgumentToProxy(
    internalAPI, publicAPI, MembraneInternal
  );

  // Protect the dogfood membrane as well.
  DogfoodMembrane = DogfoodMembrane.convertArgumentToProxy(
    internalAPI, publicAPI, DogfoodMembrane
  );
}
else {
  Membrane = MembraneInternal;
}
