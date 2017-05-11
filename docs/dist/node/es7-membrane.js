"use strict"
var assert = require("assert");
var {
    NOT_IMPLEMENTED,
    NOT_IMPLEMENTED_DESC,
    DataDescriptor,
    AccessorDescriptor,
    isDataDescriptor,
    isAccessorDescriptor,
    allTraps,
} = require("./utilities.js");
function valueType(value) {
  if (value === null)
    return "primitive";
  const type = typeof value;
  if ((type != "function") && (type != "object"))
    return "primitive";
  return type;
}

var ShadowKeyMap = new WeakMap();

/**
 * Define a shadow target, so we can manipulate the proxy independently of the
 * original target.
 *
 * @argument value {Object} The original target.
 *
 * @returns {Object} A shadow target to minimally emulate the real one.
 * @private
 */
function makeShadowTarget(value) {
  "use strict";
  var rv;
  if (Array.isArray(value))
    rv = [];
  else if (typeof value == "object")
    rv = {};
  else if (typeof value == "function") {
    rv = function() {};
    /* ES7 specification says that functions in strict mode do not have their
     * own "arguments" or "length" properties naturally.  But in non-strict
     * code, V8 adds those properties.  (Mozilla adds them for both strict code
     * and non-strict code, which technically is a spec violation.)  So to make
     * the membrane code work correctly with shadow targets, we start with the
     * minimalist case (strict mode explicitly on), and add missing properties.
     */
    let keys = Reflect.ownKeys(value);
    keys.forEach(function(key) {
      if (Reflect.getOwnPropertyDescriptor(rv))
        return;
      let desc = Reflect.getOwnPropertyDescriptor(value, key);
      Reflect.defineProperty(rv, key, desc);
    });
  }
  else
    throw new Error("Unknown value for makeShadowTarget");
  ShadowKeyMap.set(rv, value);
  return rv;
}

function getRealTarget(target) {
  return ShadowKeyMap.has(target) ? ShadowKeyMap.get(target) : target;
}

/**
 * @deprecated
 */
function inGraphHandler(trapName, callback) {
  return callback;
  /* This seemed like a good idea at the time.  I wanted to know
     when the membrane was executing internal code or not.  But practically
     speaking, it's useless...

  return function() {
    if (this.__isDead__)
      throw new Error("This membrane handler is dead!");

    let mayLog = this.membrane.__mayLog__();

    this.membrane.handlerStack.unshift(trapName);
    if (mayLog) {
      this.membrane.logger.trace(
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
      if (mayLog) {
        this.membrane.logger.trace(
          trapName + " inGraphHandler--",
          this.membrane.handlerStack.length - 2
        );
      }
    }

    return rv;
  };
  */
}

const NOT_YET_DETERMINED = {};
Object.defineProperty(
  NOT_YET_DETERMINED,
  "not_yet_determined",
  new DataDescriptor(true)
);

function makeRevokeDeleteRefs(parts, mapping, field) {
  let oldRevoke = parts.revoke;
  if (!oldRevoke)
    return;
  parts.revoke = function() {
    oldRevoke.apply(parts);
    mapping.remove(field);
  };
}

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

function AssertIsPropertyKey(propName) {
  var type = typeof propName;
  if ((type != "string") && (type != "symbol"))
    throw new Error("propName is not a symbol or a string!");
  return true;
}

const Constants = {
  warnings: {
    FILTERED_KEYS_WITHOUT_LOCAL: "Filtering own keys without allowing local property defines or deletes is dangerous"
  }
};

Object.freeze(Constants.warnings);
Object.freeze(Constants);
/**
 * @private
 *
 * In Production, instances of ProxyMapping must NEVER be exposed outside of the
 * membrane module!  (Neither should instances Membrane or ObjectGraphHandler,
 * but the ProxyMapping is strictly for internal use of the module.)
 */

function ProxyMapping(originField) {
  this.originField = originField;
  this.proxiedFields = {
    /* field: {
     *   value: value,
     *   proxy: proxy,
     *   revoke: revoke
     *   (other properties as necessary)
     * }
     */
  };

  this.originalValue = NOT_YET_DETERMINED;
  this.protoMapping = NOT_YET_DETERMINED;

  /**
   * @private
   *
   * Local flags determining behavior.
   */
  //this.localFlags = null
}
{ // ProxyMapping definition
Object.defineProperties(ProxyMapping.prototype, {
  "getOriginal": new DataDescriptor(function() {
    if (this.originalValue === NOT_YET_DETERMINED)
      throw new Error("getOriginal called but the original value hasn't been set!");
    return this.getProxy(this.originField);
  }),

  "hasField": new DataDescriptor(function(field) {
    return Reflect.ownKeys(this.proxiedFields).includes(field);
  }),

  "getValue": new DataDescriptor(function(field) {
    var rv = this.proxiedFields[field];
    if (!rv)
      throw new Error("getValue called for unknown field!");
    rv = rv.value;
    return rv;
  }),

  "getProxy": new DataDescriptor(function(field) {
    var rv = this.proxiedFields[field];
    if (!rv)
      throw new Error("getProxy called for unknown field!");
    rv = (!rv.override && (field === this.originField)) ? rv.value : rv.proxy;
    return rv;
  }),

  "hasProxy": new DataDescriptor(function(proxy) {
    let fields = Object.getOwnPropertyNames(this.proxiedFields);
    for (let i = 0; i < fields.length; i++) {
      if (this.getProxy(fields[i]) === proxy)
        return true;
    }
    return false;
  }),

  "getShadowTarget": new DataDescriptor(function(field) {
    var rv = this.proxiedFields[field];
    if (!rv)
      throw new Error("getValue called for unknown field!");
    rv = rv.shadowTarget;
    return rv;
  }),

  /**
   * Add a value to the mapping.
   *
   * @param membrane {Membrane} The owning membrane.
   * @param field    {Symbol|String}   The field name of the object graph.
   * @param parts    {Object} containing:
   *   @param value    {Variant}  The value to add.
   *   @param proxy    {Proxy}    A proxy associated with the object graph and
   *                              the value.
   *   @param revoke   {Function} A revocation function for the proxy, if
   *                              available.
   *   @param override {Boolean}  True if the field should be overridden.
   */
  "set": new DataDescriptor(function(membrane, field, parts) {
    let override = (typeof parts.override === "boolean") && parts.override;
    if (!override && this.hasField(field))
      throw new Error("set called for previously defined field!");

    this.proxiedFields[field] = parts;

    if (override || (field !== this.originField)) {
      if (DogfoodMembrane && (membrane !== DogfoodMembrane))
        DogfoodMembrane.ProxyToMembraneMap.add(parts.proxy);
      membrane.map.set(parts.proxy, this);
    }
    else if (this.originalValue === NOT_YET_DETERMINED) {
      this.originalValue = parts.value;
      delete parts.proxy;
      delete parts.revoke;
    }
  
    if (!membrane.map.has(parts.value)) {
      if (DogfoodMembrane && (membrane !== DogfoodMembrane))
        DogfoodMembrane.ProxyToMembraneMap.add(parts.value);
      membrane.map.set(parts.value, this);
    }
    else
      assert(this === membrane.map.get(parts.value), "ProxyMapping mismatch?");
  }),

  "remove": new DataDescriptor(function(field) {
    delete this.proxiedFields[field];
  }),

  "selfDestruct": new DataDescriptor(function(membrane) {
    let fields = Object.getOwnPropertyNames(this.proxiedFields);
    for (let i = (fields.length - 1); i >= 0; i--) {
      let field = fields[i];
      if (field !== this.originField) {
        membrane.map.delete(this.proxiedFields[field].proxy);
      }
      membrane.map.delete(this.proxiedFields[field].value);
      delete this.proxiedFields[field];
    }
  }),

  "revoke": new DataDescriptor(function() {
    let fields = Object.getOwnPropertyNames(this.proxiedFields);
    // fields[0] === this.originField
    for (let i = 1; i < fields.length; i++) {
      this.proxiedFields[fields[i]].revoke();
    }
  }),

  "setLocalFlag":
  new DataDescriptor(
    /**
     * fieldName: {Symbol|String} The object graph's field name.
     * flagName:  {String} The flag to set.
     * value:     {Boolean} The value to set.
     */
    function(fieldName, flagName, value) {
      if (typeof fieldName == "string") {
        if (!this.localFlags)
          this.localFlags = new Set();
  
        let flag = flagName + ":" + fieldName;
        if (value)
          this.localFlags.add(flag);
        else
          this.localFlags.delete(flag);
      }
      else if (typeof fieldName == "symbol") {
        // It's harder to combine symbols and strings into a string...
        if (!this.localFlagsSymbols)
          this.localFlagsSymbols = new Map();
        let obj = this.localFlagsSymbols.get(fieldName) || {};
        obj[flagName] = value;
        this.localFlagsSymbols.set(fieldName, obj);
      }
      else
        throw new Error("fieldName is neither a symbol nor a string!");
    }
  ),

  "getLocalFlag":
  new DataDescriptor(
    /**
     * fieldName: {Symbol|String} The object graph's field name.
     * flagName:  {String} The flag to set.
     *
     * @returns {Boolean} The value to set.
     */
    function(fieldName, flagName) {
      if (typeof fieldName == "string") {
        if (!this.localFlags)
          return false;
        let flag = flagName + ":" + fieldName;
        return this.localFlags.has(flag);
      }
      else if (typeof fieldName == "symbol") {
        if (!this.localFlagsSymbols)
          return false;
        let obj = this.localFlagsSymbols.get(fieldName);
        if (!obj || !obj[flagName])
          return false;
        return true;
      }
      else
        throw new Error("fieldName is neither a symbol nor a string!");
    }
  ),

  "getLocalDescriptor":
  new DataDescriptor(function(fieldName, propName) {
    let desc;
    let metadata = this.proxiedFields[fieldName];
    if (metadata.localDescriptors)
      desc = metadata.localDescriptors.get(propName);
    return desc;
  }),

  "setLocalDescriptor":
  new DataDescriptor(function(fieldName, propName, desc) {
    this.unmaskDeletion(fieldName, propName);
    let metadata = this.proxiedFields[fieldName];

    if (!metadata.localDescriptors) {
      metadata.localDescriptors = new Map();
    }

    metadata.localDescriptors.set(propName, desc);
    return true;
  }),

  "deleteLocalDescriptor":
  new DataDescriptor(function(fieldName, propName, recordLocalDelete) {
    let metadata = this.proxiedFields[fieldName];
    if (recordLocalDelete) {
      if (!metadata.deletedLocals)
        metadata.deletedLocals = new Set();
      metadata.deletedLocals.add(propName);
    }
    else
      this.unmaskDeletion(fieldName, propName);

    if ("localDescriptors" in metadata) {
      metadata.localDescriptors.delete(propName);
      if (metadata.localDescriptors.size === 0)
        delete metadata.localDescriptors;
    }
  }),

  "cachedOwnKeys": new DataDescriptor(function (fieldName) {
    if (!this.hasField(fieldName))
      return null;
    let metadata = this.proxiedFields[fieldName];
    if ("cachedOwnKeys" in metadata)
      return metadata.cachedOwnKeys;
    return null;
  }),

  "setCachedOwnKeys": new DataDescriptor(function(fieldName, keys, original) {
    this.proxiedFields[fieldName].cachedOwnKeys = {
      keys: keys,
      original: original
    };
  }),

  "localOwnKeys": new DataDescriptor(function(fieldName) {
    let metadata = this.proxiedFields[fieldName], rv = [];
    if ("localDescriptors" in metadata)
      rv = Array.from(metadata.localDescriptors.keys());
    return rv;
  }),

  "appendDeletedNames":
  new DataDescriptor(function(fieldName, set) {
    if (!this.hasField(fieldName))
      return;
    var locals = this.proxiedFields[fieldName].deletedLocals;
    if (!locals || !locals.size)
      return;
    var iter = locals.values(), next;
    do {
      next = iter.next();
      if (!next.done)
        set.add(next.value);
    } while (!next.done);
  }),

  "wasDeletedLocally":
  new DataDescriptor(function(fieldName, propName) {
    if (!this.hasField(fieldName))
      return false;
    var locals = this.proxiedFields[fieldName].deletedLocals;
    return Boolean(locals) && locals.has(propName);
  }),

  "unmaskDeletion":
  new DataDescriptor(function(fieldName, propName) {
    if (!this.hasField(fieldName))
      return;
    var metadata = this.proxiedFields[fieldName];
    if (!metadata.deletedLocals)
      return;
    metadata.deletedLocals.delete(propName);
    if (metadata.deletedLocals.size === 0)
      delete metadata.deletedLocals;
  }),

  "getOwnKeysFilter":
  new DataDescriptor(function(fieldName) {
    if (!this.hasField(fieldName))
      return null;
    var metadata = this.proxiedFields[fieldName];
    return (typeof metadata.ownKeysFilter == "function") ?
           metadata.ownKeysFilter :
           null;
  }),

  "setOwnKeysFilter":
  new DataDescriptor(function(fieldName, filter) {
    this.proxiedFields[fieldName].ownKeysFilter = filter;
  }),
});

Object.seal(ProxyMapping.prototype);
} // end ProxyMapping definition

Object.seal(ProxyMapping);
/* Reference:  http://soft.vub.ac.be/~tvcutsem/invokedynamic/js-membranes
 * Definitions:
 * Object graph: A collection of values that talk to each other directly.
 */

function MembraneInternal(options = {}) {
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

    /* Disabled, dead API.
    "handlerStack": {
      // This has two "external" strings because at all times, we require
      // two items on the handlerStack, for
      // Membrane.prototype.calledFromHandlerTrap().
      value: ["external", "external"],
      writable: true,
      enumerable: false,
      configurable: false,
    },
    */

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
    },

    "warnOnceSet": {
      value: (options.logger ? new Set() : null),
      writable: false,
      enumerable: false,
      configurable: false
    },

    "modifyRules": {
      value: new ModifyRulesAPI(this),
      writable: false,
      enumerable: true,
      configurable: false
    }
  });
}
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
   * @param field {Symbol|String} The name of the object graph.
   * @param value {Variant} The value to assign.
   *
   * Options:
   *   @param mapping {ProxyMapping} A mapping with associated values and proxies.
   *
   * @returns {ProxyMapping} A mapping holding the value.
   */
  buildMapping: function(field, value, options = {}) {
    {
      let t = typeof field;
      if ((t != "string") && (t != "symbol"))
        throw new Error("field must be a string or a symbol!");
    }

    let handler = this.getHandlerByField(field);
    if (!handler)
      throw new Error("We don't have an ObjectGraphHandler with that name!");

    let mapping = ("mapping" in options) ? options.mapping : null;

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

    const isOriginal = (mapping.originField === field);
    let newTarget = makeShadowTarget(value);
    if (!Reflect.isExtensible(value))
      Reflect.preventExtensions(newTarget);
    let parts = Proxy.revocable(newTarget, handler);
    parts.shadowTarget = newTarget;
    parts.value = value;
    mapping.set(this, field, parts);
    makeRevokeDeleteRefs(parts, mapping, field);

    if (!isOriginal) {
      let notifyOptions = { isThis: false };
      ["trapName", "callable", "isThis", "argIndex"].forEach(function(propName) {
        if (Reflect.has(options, propName))
          notifyOptions[propName] = options[propName];
      });
      
      ProxyNotify(parts, handler, notifyOptions);
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
   * @param mustCreate {Boolean} True if we must create a missing graph handler.
   *
   * @returns {ObjectGraphHandler} The handler for the object graph.
   */
  getHandlerByField: function(field, mustCreate = false) {
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
    if (ChainHandlers.has(handler))
      handler = handler.baseHandler;
    if (!(handler instanceof ObjectGraphHandler) ||
        (handler !== this.getHandlerByField(handler.fieldName)))
      throw new Error("wrapArgumentByHandler:  handler mismatch");
    const type = valueType(arg);
    if (type == "primitive")
      return arg;
    const mayLog = this.__mayLog__();

    let found = this.hasProxyForValue(handler.fieldName, arg);
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
        (originHandler.fieldName === targetHandler.fieldName)) {
      throw new Error("convertArgumentToProxy requires two different ObjectGraphHandlers in the Membrane instance");
    }

    this.wrapArgumentByHandler(originHandler, arg, options);
    this.wrapArgumentByHandler(targetHandler, arg, options);

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

    // XXX ajvincent This optimization may need to go away for wrapping primitives.
    if (isDataDescriptor(desc) && (valueType(desc.value) === "primitive"))
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

  /* Disabled, dead API.
  calledFromHandlerTrap: function() {
    return this.handlerStack[1] !== "external";
  },
  */

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
/* A proxy handler designed to return only primitives and objects in a given
 * object graph, defined by the fieldName.
 */
function ObjectGraphHandler(membrane, fieldName) {
  {
    let t = typeof fieldName;
    if ((t != "string") && (t != "symbol"))
      throw new Error("field must be a string or a symbol!");
  }

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

    "__proxyListeners__": new DataDescriptor([], false, false, false),
  });
}
{ // ObjectGraphHandler definition
ObjectGraphHandler.prototype = Object.seal({
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
   * See modifyRules.replaceProxy method for details.
   */

  // ProxyHandler
  ownKeys: inGraphHandler("ownKeys", function(shadowTarget) {
    var target = getRealTarget(shadowTarget);
    var targetMap = this.membrane.map.get(target);

    // cached keys are only valid if original keys have not changed
    var cached = targetMap.cachedOwnKeys(this.fieldName);
    if (cached) {
      let _this = targetMap.getOriginal();
      let check = this.externalHandler(function() {
        return Reflect.ownKeys(_this);
      });

      let pass = ((check.length == cached.original.length) &&
        (check.every(function(elem) {
          return cached.original.includes(elem);
        })));
      if (pass)
        return cached.keys.slice(0);
    }
    return this.setOwnKeys(shadowTarget);
  }),

  // ProxyHandler
  has: inGraphHandler("has", function(shadowTarget, propName) {
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
      hasOwn = this.getOwnPropertyDescriptor(target, propName);
      if (typeof hasOwn !== "undefined")
        return true;
      target = this.getPrototypeOf(target);
      if (target === null)
        break;
      let foundProto;
      [foundProto, target] = this.membrane.getMembraneValue(
        this.fieldName,
        target
      );
      assert(foundProto, "Must find membrane value for prototype");
    }
    return false;
  }),

  // ProxyHandler
  get: inGraphHandler("get", function(shadowTarget, propName, receiver) {
    var desc, target, found, rv, protoLookups = 0;
    target = getRealTarget(shadowTarget);
    shadowTarget = null;

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
      {
        /* Special case:  Look for a local property descriptors first, and if we
         * find it, return it unwrapped.
         */
        let targetMap = this.membrane.map.get(target);
        desc = targetMap.getLocalDescriptor(this.fieldName, propName);

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
      desc = this.getOwnPropertyDescriptor(target, propName);
      if (!desc) {
        protoLookups++;
        let parent = this.getPrototypeOf(target);
        if (parent === null)
          return undefined;

        let [foundProto, other] = this.membrane.getMembraneProxy(
          this.fieldName,
          parent
        );
        assert(foundProto, "Must find membrane proxy for prototype");
        assert(other === parent, "Retrieved prototypes must match");
        [foundProto, target] = this.membrane.getMembraneValue(
          this.fieldName,
          parent
        );
        assert(foundProto, "Must find membrane proxy for prototype");
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
  inGraphHandler("getOwnPropertyDescriptor", function(shadowTarget, propName) {
    const mayLog = this.membrane.__mayLog__();
    if (mayLog) {
      this.membrane.logger.debug("propName: " + propName.toString());
    }
    var target = getRealTarget(shadowTarget);
    {
      let [found, unwrapped] = this.membrane.getMembraneValue(this.fieldName, target);
      assert(found, "Original target must be found after calling getRealTarget");
      assert(unwrapped === target, "Original target must match getMembraneValue's return value");
    }
    var targetMap = this.membrane.map.get(target);

    if (this.membrane.showGraphName && (propName == "membraneGraphName")) {
      return this.graphNameDescriptor;
    }

    try {
      /* Order of operations:
       * (1) locally deleted property:  undefined
       * (2) locally set property:  the property
       * (3) own keys filtered property: undefined
       * (4) original property:  wrapped property.
       */
      if (targetMap.wasDeletedLocally(targetMap.originField, propName) ||
          targetMap.wasDeletedLocally(this.fieldName, propName))
        return undefined;

      var desc = targetMap.getLocalDescriptor(this.fieldName, propName);
      if (desc !== undefined)
        return desc;

      {
        let originFilter = targetMap.getOwnKeysFilter(targetMap.originField);
        if (originFilter && !originFilter(propName))
          return undefined;
      }
      {
        let localFilter  = targetMap.getOwnKeysFilter(this.fieldName);
        if (localFilter && !localFilter(propName))
          return undefined;
      }

      var _this = targetMap.getOriginal();
      desc = this.externalHandler(function() {
        return Reflect.getOwnPropertyDescriptor(_this, propName);
      });
      if ((desc !== undefined) && (targetMap.originField !== this.fieldName)) {
        desc = this.membrane.wrapDescriptor(
          targetMap.originField,
          this.fieldName,
          desc
        );
      }

      // Non-configurable descriptors must apply on the actual proxy target.
      // XXX ajvincent Somehow shadowTarget is a proxy... that seems bad.
      if (desc && !desc.configurable &&
          !Reflect.getOwnPropertyDescriptor(shadowTarget, propName)) {
        Reflect.defineProperty(shadowTarget, propName, desc);
      }

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
  getPrototypeOf: inGraphHandler("getPrototypeOf", function(shadowTarget) {
    var target = getRealTarget(shadowTarget);
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
  isExtensible: inGraphHandler("isExtensible", function(shadowTarget) {
    if (!Reflect.isExtensible(shadowTarget))
      return false;
    var target = getRealTarget(shadowTarget);
    var shouldBeLocal = this.getLocalFlag(target, "storeUnknownAsLocal", true);
    if (shouldBeLocal)
      return true;
    
    var targetMap = this.membrane.map.get(target);
    var _this = targetMap.getOriginal();
    var rv = this.externalHandler(function() {
      return Reflect.isExtensible(_this);
    });
    if (!rv) {
      // This is our one and only chance to set properties on the shadow target.
      let keys = this.setOwnKeys(shadowTarget);
      keys.forEach(this.copyProperty.bind(this, _this, shadowTarget));
      Reflect.preventExtensions(shadowTarget);
    }
    return rv;
  }),

  // ProxyHandler
  preventExtensions: inGraphHandler("preventExtensions", function(shadowTarget) {
    var target = getRealTarget(shadowTarget);
    var targetMap = this.membrane.map.get(target);
    var _this = targetMap.getOriginal();


    // Walk the prototype chain to look for shouldBeLocal.
    var shouldBeLocal = this.getLocalFlag(target, "storeUnknownAsLocal", true);
    if (shouldBeLocal) {
      /* We must set the ownKeys of the shadow target always.  But, if the
       * ownKeys hasn't been set yet, ever, now is our one and only chance to
       * copy the properties from the real target to the shadow target.  This is
       * necessary to maintain the assertions that a property may not appear
       * magically later, say, when calling Reflect.ownKeys().
       */
      let mustSetProps = (!targetMap.cachedOwnKeys(this.fieldName));
      let keys = this.setOwnKeys(shadowTarget);
      if (mustSetProps) {
        keys.forEach(this.copyProperty.bind(this, _this, shadowTarget));
      }
      return Reflect.preventExtensions(shadowTarget);
    }

    if (!this.isExtensible(target))
      return true;

    var rv = this.externalHandler(function() {
      return Reflect.preventExtensions(_this);
    });
    if (rv) {
      // This is our one and only chance to set properties on the shadow target.
      let keys = this.setOwnKeys(shadowTarget);
      keys.forEach(this.copyProperty.bind(this, _this, shadowTarget));
      Reflect.preventExtensions(shadowTarget);
    }
    return rv;
  }),

  // ProxyHandler
  deleteProperty: inGraphHandler("deleteProperty", function(shadowTarget, propName) {
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

    try {
      var targetMap = this.membrane.map.get(target);
      var shouldBeLocal = this.requiresDeletesBeLocal(target);

      if (!shouldBeLocal) {
        /* See .defineProperty trap for why.  Basically, if the property name
         * is blacklisted, we should treat it as if the property doesn't exist
         * on the original target.  The spec says if GetOwnProperty returns
         * undefined (which it will for our proxy), we should return true.
         */
        let originFilter = targetMap.getOwnKeysFilter(targetMap.originField);
        let localFilter  = targetMap.getOwnKeysFilter(this.fieldName);
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

    let desc = this.getOwnPropertyDescriptor(target, propName);
    if (!desc)
      return true;

    if (!desc.configurable)
      return false;

    try {
      targetMap.deleteLocalDescriptor(this.fieldName, propName, shouldBeLocal);

      if (!shouldBeLocal) {
        var _this = targetMap.getOriginal();
        this.externalHandler(function() {
          return Reflect.deleteProperty(_this, propName);
        });
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
  }),

  /**
   * Define a property on a target.
   *
   * @param {Object}  target   The target object.
   * @param {String}  propName The name of the property to define.
   * @param {Object}  desc     The descriptor for the property being defined
   *                           or modified.
   * @param {Boolean} shouldBeLocal True if the property must be defined only
   *                                on the proxy (versus carried over to the
   *                                actual target).
   *
   * @note This is a ProxyHandler trap for defineProperty, modified to include 
   *       the shouldBeLocal argument.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/defineProperty
   */
  defineProperty:
  inGraphHandler("defineProperty", function(shadowTarget, propName, desc,
                                            shouldBeLocal = false) {
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

    try {
      if (!this.isExtensible(shadowTarget))
        return false;
      var targetMap = this.membrane.map.get(target);
      var _this = targetMap.getOriginal();

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
        originFilter = targetMap.getOwnKeysFilter(targetMap.originField);
        localFilter  = targetMap.getOwnKeysFilter(this.fieldName);
        if (originFilter || localFilter)
          this.membrane.warnOnce(this.membrane.constants.warnings.FILTERED_KEYS_WITHOUT_LOCAL);
      }

      if (shouldBeLocal) {
        let hasOwn = true;

        // Own-keys filters modify hasOwn.
        if (hasOwn && originFilter && !originFilter(propName))
          hasOwn = false;
        if (hasOwn && localFilter && !localFilter(propName))
          hasOwn = false;

        // It's probably more expensive to look up a property than to filter the name.
        if (hasOwn)
          hasOwn = this.externalHandler(function() {
            return Boolean(Reflect.getOwnPropertyDescriptor(_this, propName));
          });

        if (!hasOwn && desc) {
          rv = targetMap.setLocalDescriptor(this.fieldName, propName, desc);
          if (rv)
            this.setOwnKeys(shadowTarget); // fix up property list
          if (!desc.configurable)
            Reflect.defineProperty(shadowTarget, propName, desc);
          return rv;
        }
        else {
          targetMap.deleteLocalDescriptor(this.fieldName, propName, false);
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
          this.fieldName,
          targetMap.originField,
          desc
        );
      }

      rv = this.externalHandler(function() {
        return Reflect.defineProperty(_this, propName, desc);
      });
      if (rv) {
        targetMap.unmaskDeletion(this.fieldName, propName);
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
  }),

  // ProxyHandler
  set: inGraphHandler("set", function(shadowTarget, propName, value, receiver) {
    const mayLog = this.membrane.__mayLog__();
    if (mayLog) {
      this.membrane.logger.debug("set propName: " + propName);
    }
    let target = getRealTarget(shadowTarget);
    shadowTarget = undefined;

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

    var ownDesc, shouldBeLocal = false;
    {
      let checkedPropName = false, walkedAllowLocal = false;

      do {
        if (!checkedPropName) {
          // 1. Assert: IsPropertyKey(P) is true.
          AssertIsPropertyKey(propName);
          checkedPropName = true;
        }

        if (!shouldBeLocal && !walkedAllowLocal) {
          /* Think carefully before making this walk the prototype chain as in
             .defineProperty().  Remember, this.set() calls itself below, so you
             could accidentally create a O(n^2) operation here.
           */
          walkedAllowLocal = true;
          shouldBeLocal = this.getLocalFlag(target, "storeUnknownAsLocal", true);
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

        {
          ownDesc = this.getOwnPropertyDescriptor(target, propName);
          if (!ownDesc) {
            let parent = this.getPrototypeOf(target);
            if (parent !== null) {
              let [found, other] = this.membrane.getMembraneProxy(
                this.fieldName,
                parent
              );
              assert(found, "Must find membrane proxy for prototype");
              assert(other === parent, "Retrieved prototypes must match");
              [found, target] = this.membrane.getMembraneValue(
                this.fieldName,
                parent
              );
              assert(found, "Must find membrane value for prototype");
            }
            else
              ownDesc = new DataDescriptor(undefined, true);
          }
        }
      } while (!ownDesc); // end optimization for ownDesc
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
      let existingDesc = this.externalHandler(function() {
        return Reflect.getOwnPropertyDescriptor(origReceiver, propName);
      });
      if (existingDesc !== undefined) {
        if (isAccessorDescriptor(existingDesc) || !existingDesc.writable)
          return false;
      }

      let rvProxy;
      if (!shouldBeLocal && (receiverMap.originField !== this.fieldName)) {
        rvProxy = new DataDescriptor(
          // Only now do we convert the value to the target object graph.
          this.membrane.convertArgumentToProxy(
            this,
            this.membrane.getHandlerByField(receiverMap.originField),
            value
          ),
          true
        );
      }
      else {
        rvProxy = new DataDescriptor(value, true);
      }

      return this.defineProperty(receiver, propName, rvProxy, shouldBeLocal);
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
    if (!shouldBeLocal) {
      // Only now do we convert the value to the target object graph.
      let rvProxy = this.membrane.convertArgumentToProxy(
        this,
        this.membrane.getHandlerByField(receiverMap.originField),
        value
      );
      this.apply(setter, receiver, [ rvProxy ]);
    }
    else {
      this.defineProperty(receiver, propName, new DataDescriptor(value), shouldBeLocal);
    }

    // 9. Return true.
    return true;
  }),

  // ProxyHandler
  setPrototypeOf: inGraphHandler("setPrototypeOf", function(shadowTarget, proto) {
    var target = getRealTarget(shadowTarget);
    try {
      var targetMap = this.membrane.map.get(target);
      var _this = targetMap.getOriginal();


      let protoProxy;
      if (targetMap.originField !== this.fieldName) {
        protoProxy = this.membrane.convertArgumentToProxy(
          this,
          this.membrane.getHandlerByField(targetMap.originField),
          proto
        );
      }
      else {
        protoProxy = proto;
      }

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
  apply: inGraphHandler("apply", function(shadowTarget, thisArg, argumentsList) {
    var target = getRealTarget(shadowTarget);
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

    // This is where we are "counter-wrapping" an argument.
    const optionsBase = Object.seal({
      callable: target,
      trapName: "apply"
    });

    _this = this.membrane.convertArgumentToProxy(
      this,
      argHandler,
      thisArg,
      Object.create(optionsBase, { "isThis": new DataDescriptor(true) })
    );

    /* XXX ajvincent This seemed like a good idea, but I realized it adds execution time.
    if (mayLog) {
      this.membrane.logger.debug("apply this.membraneGraphName: " + _this.membraneGraphName);
    }
    */

    for (let i = 0; i < argumentsList.length; i++) {
      let nextArg = argumentsList[i];
      nextArg = this.membrane.convertArgumentToProxy(
        this,
        argHandler,
        nextArg,
        Object.create(optionsBase, { "argIndex": new DataDescriptor(i) })
      );
      args.push(nextArg);

      /* XXX ajvincent This seemed like a good idea, but I realized it adds execution time.
      if (mayLog && (valueType(nextArg) != "primitive")) {
        this.membrane.logger.debug("apply argument " + i + "'s membraneGraphName: " + nextArg.membraneGraphName);
      }
      */
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
  inGraphHandler("construct", function(shadowTarget, argumentsList, ctorTarget) {
    var target = getRealTarget(shadowTarget);
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

    let rv = this.externalHandler(function() {
      return Reflect.construct(target, args, ctor);
    });

    rv = this.membrane.convertArgumentToProxy(
      argHandler,
      this,
      rv
    );

    if (mayLog) {
      this.membrane.logger.debug("construct exiting");
    }
    return rv;
  }),

  /**
   * Add a listener for new proxies.
   *
   * @see ProxyNotify
   */
  addProxyListener: function(listener) {
    if (typeof listener != "function")
      throw new Error("listener is not a function!");
    if (!this.__proxyListeners__.includes(listener))
      this.__proxyListeners__.push(listener);
  },

  /**
   * Remove a listener for new proxies.
   *
   * @see ProxyNotify
   */
  removeProxyListener: function(listener) {
    let index = this.__proxyListeners__.indexOf(listener);
    if (index == -1)
      throw new Error("listener is not registered!");
    this.__proxyListeners__.splice(index, 1);
  },

  /**
   * Handle a call to code the membrane doesn't control.
   *
   * @private
   */
  externalHandler: function(callback) {
    return inGraphHandler("external", callback).apply(this);
  },

  /**
   * Specify the list of ownKeys this proxy exposes.
   *
   * @param {Object} shadowTarget The proxy target
   * @private
   *
   * @returns {String[]} The list of exposed keys.
   */
  setOwnKeys: function(shadowTarget) {
    var target = getRealTarget(shadowTarget);
    var targetMap = this.membrane.map.get(target);
    var _this = targetMap.getOriginal();

    // First, get the underlying object's key list, forming a base.
    var originalKeys = this.externalHandler(function() {
      return Reflect.ownKeys(_this);
    });

    // Remove duplicated names and keys that have been deleted.
    {
      let mustSkip = new Set();
      targetMap.appendDeletedNames(targetMap.originField, mustSkip);
      targetMap.appendDeletedNames(this.fieldName, mustSkip);

      let originFilter = targetMap.getOwnKeysFilter(targetMap.originField);
      let localFilter  = targetMap.getOwnKeysFilter(this.fieldName);

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
    var rv = originalKeys.concat(
      targetMap.localOwnKeys(targetMap.originField),
      targetMap.localOwnKeys(this.fieldName)
    );

    if (this.membrane.showGraphName && !rv.includes("membraneGraphName")) {
      rv.push("membraneGraphName");
    }

    // Optimization, storing the generated key list for future retrieval.
    targetMap.setCachedOwnKeys(this.fieldName, rv, originalKeys);
    return rv;
  },

  /**
   * Copy a property from the original target to the shadow target.
   *
   * @param _this        {Object} The original target.
   * @param shadowTarget {Object} The target to apply the property to.
   * @param propName     {String} The name of the property.
   *
   * @private
   */
  copyProperty: function(_this, shadowTarget, propName) {
    if (this.membrane.showGraphName && (propName == "membraneGraphName")) {
      // Special case.
      Reflect.defineProperty(shadowTarget, propName, this.graphNameDescriptor);
    }
    else {
      let desc = Reflect.getOwnPropertyDescriptor(_this, propName);
      Reflect.defineProperty(shadowTarget, propName, desc);
    }
  },

  /**
   * Determine if a target, or any prototype ancestor, has a local-to-the-proxy
   * flag.
   *
   * @argument target    {Object} The proxy target.
   * @argument flagName  {String} The name of the flag.
   * @argument recurse {Boolean} True if we should look at prototype ancestors.
   *
   * @returns {Boolean} True if local properties have been requested.
   *
   * @private
   */
  getLocalFlag: function(target, flagName, recurse = false) {
    var shouldBeLocal = false;
    let targetMap = this.membrane.map.get(target);
    let map = targetMap, protoTarget = target;
    while (true) {
      shouldBeLocal = map.getLocalFlag(this.fieldName, flagName) ||
                      map.getLocalFlag(targetMap.originField, flagName);
      if (shouldBeLocal)
        return true;
      if (!recurse)
        return false;
      protoTarget = this.getPrototypeOf(protoTarget);
      if (!protoTarget)
        return false;
      map = this.membrane.map.get(protoTarget);
    }
  },

  /**
   * Determine whether this proxy (or one it inherits from) requires local
   * property deletions.
   *
   * @param target {Object} The proxy target.
   *
   * @returns {Boolean} True if deletes should be local.
   *
   * @private
   */
  requiresDeletesBeLocal: function(target) {
    let targetMap = this.membrane.map.get(target);
    let map = targetMap, protoTarget = target, shouldBeLocal = false;
    while (true) {
      shouldBeLocal = map.getLocalFlag(this.fieldName, "requireLocalDelete") ||
                      map.getLocalFlag(targetMap.originField, "requireLocalDelete");
      if (shouldBeLocal)
        return true;
      protoTarget = this.getPrototypeOf(protoTarget);
      if (!protoTarget)
        return false;
      map = this.membrane.map.get(protoTarget);
    }
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
   * Remove a ProxyMapping or a Proxy.revoke function from our list.
   *
   * @private
   */
  removeRevocable: function(revoke) {
    let index = this.__revokeFunctions__.indexOf(revoke);
    if (index == -1) {
      throw new Error("Unknown revoke function!");
    }
    this.__revokeFunctions__.splice(index, 1);
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
  }
});

} // end ObjectGraphHandler definition

Object.seal(ObjectGraphHandler);
/**
 * Notify all proxy listeners of a new proxy.
 *
 * @param parts   {Object} The field object from a ProxyMapping's proxiedFields.
 * @param handler {ObjectGraphHandler} The handler for the proxy.
 * @param options {Object} Special options to pass on to the listeners.
 *
 * @private
 */
function ProxyNotify(parts, handler, options = {}) {
  function addFields(desc) {
    desc.enumerable = true;
    desc.configurable = false;
    return desc;
  }
  
  // private variables
  const listeners = handler.__proxyListeners__.slice(0);
  if (listeners.length === 0)
    return;
  const modifyRules = handler.membrane.modifyRules;
  var index = 0, exn = null, exnFound = false, stopped = false;

  // the actual metadata object for the listener
  var meta = Object.create(options, {
    /**
     * The proxy or value the Membrane will return to the caller.
     *
     * @note If you set this property with a non-proxy value, the value will NOT
     * be protected by the membrane.
     *
     * If you wish to replace the proxy with another Membrane-based proxy,
     * including a new proxy with a chained proxy handler (see ModifyRulesAPI),
     * do NOT just call Proxy.revocable and set this property.  Instead, set the
     * handler property with the new proxy handler, and call .rebuildProxy().
     */
    "proxy": addFields({
      "get": () => parts.proxy,
      "set": (val) => { if (!stopped) parts.proxy = val; }
    }),

    /* XXX ajvincent revoke is explicitly NOT exposed, lest a listener call it 
     * and cause chaos for any new proxy trying to rely on the existing one.  If
     * you really have a problem, use throwException() below.
     */

    /**
     * The unwrapped object or function we're building the proxy for.
     */
    "target": addFields({
      "value": parts.value,
      "writable": false,
    }),

    /**
     * The proxy handler.  This should be an ObjectGraphHandler.
     */
    "handler": addFields({
      "get": () => handler,
      "set": (val) => { if (!stopped) handler = val; }
    }),

    /**
     * A reference to the membrane logger, if there is one.
     */
    "logger": addFields({
      "value": handler.membrane.logger,
      "writable": false
    }),

    /**
     * Rebuild the proxy object.
     */
    "rebuildProxy": addFields({
      "value": function() {
        if (!stopped)
          parts.proxy = modifyRules.replaceProxy(parts.proxy, this.handler);
      },
      "writable": false
    }),

    /**
     * Notify no more listeners.
     */
    "stopIteration": addFields({
      "value": () => stopped = true,
      "writable": false
    }),

    "stopped": addFields({
      "get": () => stopped,
    }),

    /**
     * Explicitly throw an exception from the listener, through the membrane.
     */
    "throwException": addFields({
      "value": function(e) { stopped = true; exnFound = true; exn = e; },
      "writable": false
    })
  });

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
/**
 * @fileoverview
 *
 * The Membrane implementation represents a perfect mirroring of objects and
 * properties from one object graph to another... until the code creating the
 * membrane invokes methods of membrane.modifyRules.  Then, through either
 * methods on ProxyMapping or new proxy traps, the membrane will be able to use
 * the full power proxies expose, without carrying the operations over to the
 * object graph which owns a particular "original" value (meaning unwrapped for
 * direct access).
 *
 * For developers modifying this API to add new general-behavior rules, here are
 * the original author's recommendations:
 *
 * (1) Add your public API on ModifyRulesAPI.prototype.
 *   * When it makes sense to do so, the new methods' names and arguments should
 *     resemble methods on Object or Reflect.  (This does not mean
 *     they should have exactly the same names and arguments - only that you
 *     should consider existing standardized methods on standardized globals,
 *     and try to make new methods on ModifyRulesAPI.prototype follow roughly
 *     the same pattern in the new API.)
 * (2) When practical, especially when it affects only one object graph
 *     directly, use ProxyMapping objects to store properties which determine
 *     the rules, as opposed to new proxy traps.
 *   * Define new methods on ProxyMapping.prototype for storing or retrieving
 *     the properties.
 *   * Internally, the new methods should store properties on
 *     this.proxiedFields[fieldName].
 *   * Modify the existing ProxyHandler traps in ObjectGraphHandler.prototype
 *     to call the ProxyMapping methods, in order to implement the new behavior.
 * (3) If the new API must define a new proxy, or more than one:
 *   * Use membrane.modifyRules.createChainHandler to define the ProxyHandler.
 *   * In the ChainHandler's own-property traps, use this.nextHandler[trapName]
 *     or this.baseHandler[trapName] to forward operations to the next or
 *     original traps in the prototype chain, respectively.
 *   * Be minimalistic:  Implement only the traps you explicitly need, and only
 *     to do the specific behavior you need.  Other ProxyHandlers in the
 *     prototype chain should be trusted to handle the behaviors you don't need.
 *   * Use membrane.modifyRules.replaceProxy to apply the new ProxyHandler.
 */

const ChainHandlers = new WeakSet();

// XXX ajvincent These rules are examples of what DogfoodMembrane should set.
const ChainHandlerProtection = Object.create(Reflect, {
  /**
   * Return true if a property should not be deleted or redefined.
   */
  "isProtectedName": new DataDescriptor(function(chainHandler, propName) {
    let rv = ["nextHandler", "baseHandler", "membrane"];
    let baseHandler = chainHandler.baseHandler;
    if (baseHandler !== Reflect)
      rv = rv.concat(Reflect.ownKeys(baseHandler));
    return rv.includes(propName);
  }, false, false, false),

  /**
   * Thou shalt not set the prototype of a ChainHandler.
   */
  "setPrototypeOf": new DataDescriptor(function() {
    return false;
  }, false, false, false),

  /**
   * Proxy/handler trap restricting which properties may be deleted.
   */
  "deleteProperty": new DataDescriptor(function(chainHandler, propName) {
    if (this.isProtectedName(chainHandler, propName))
      return false;
    return Reflect.deleteProperty(chainHandler, propName);
  }, false, false, false),

  /**
   * Proxy/handler trap restricting which properties may be redefined.
   */
  "defineProperty": new DataDescriptor(function(chainHandler, propName, desc) {
    if (this.isProtectedName(chainHandler, propName))
      return false;

    if (allTraps.includes(propName)) {
      if (!isDataDescriptor(desc) || (typeof desc.value !== "function"))
        return false;
      desc = {
        value: inGraphHandler(propName, desc.value),
        writable: desc.writable,
        enumerable: desc.enumerable,
        configurable: desc.configurable,
      };
    }

    return Reflect.defineProperty(chainHandler, propName, desc);
  }, false, false, false)
});

function ModifyRulesAPI(membrane) {
  Object.defineProperty(this, "membrane", new DataDescriptor(
    membrane, false, false, false
  ));
  Object.seal(this);
}
ModifyRulesAPI.prototype = Object.seal({
  /**
   * Create a ProxyHandler inheriting from Reflect or an ObjectGraphHandler.
   *
   * @param existingHandler {ProxyHandler} The prototype of the new handler.
   */
  createChainHandler: function(existingHandler) {
    // Yes, the logic is a little convoluted, but it seems to work this way.
    let baseHandler = Reflect, description = "Reflect";
    if (ChainHandlers.has(existingHandler))
      baseHandler = existingHandler.baseHandler;

    if (existingHandler instanceof ObjectGraphHandler) {
      if (!this.membrane.ownsHandler(existingHandler)) 
        throw new Error("fieldName must be a string or a symbol representing an ObjectGraphName in the Membrane, or null to represent Reflect");

      baseHandler = this.membrane.getHandlerByField(existingHandler.fieldName);
      description = "our membrane's " + baseHandler.fieldName + " ObjectGraphHandler";
    }

    else if (baseHandler !== Reflect) {
      throw new Error("fieldName must be a string or a symbol representing an ObjectGraphName in the Membrane, or null to represent Reflect");
    }

    if ((baseHandler !== existingHandler) && !ChainHandlers.has(existingHandler)) {
      throw new Error("Existing handler neither is " + description + " nor inherits from it");
    }

    var rv = Object.create(existingHandler, {
      "nextHandler": new DataDescriptor(existingHandler, false, false, false),
      "baseHandler": new DataDescriptor(baseHandler, false, false, false),
      "membrane":    new DataDescriptor(this.membrane, false, false, false),
    });

    rv = new Proxy(rv, ChainHandlerProtection);
    ChainHandlers.add(rv);
    return rv;
  },

  /**
   * Replace a proxy in the membrane.
   *
   * @param oldProxy {Proxy} The proxy to replace.
   * @param handler  {ProxyHandler} What to base the new proxy on.
   * 
   */
  replaceProxy: function(oldProxy, handler) {
    let baseHandler = ChainHandlers.has(handler) ? handler.baseHandler : handler;
    {
      /* These assertions are to make sure the proxy we're replacing is safe to
       * use in the membrane.
       */

      /* Ensure it has an appropriate ProxyHandler on its prototype chain.  If
       * the old proxy is actually the original value, the handler must have
       * Reflect on its prototype chain.  Otherwise, the handler must have this
       * on its prototype chain.
       *
       * Note that the handler can be Reflect or this, respectively:  that's
       * perfectly legal, as a way of restoring original behavior for the given
       * object graph.
       */

      let accepted = false;
      if (baseHandler === Reflect) {
        accepted = true;
      }
      else if (baseHandler instanceof ObjectGraphHandler) {
        let fieldName = baseHandler.fieldName;
        let ownedHandler = this.membrane.getHandlerByField(fieldName);
        accepted = ownedHandler === baseHandler;
      }

      if (!accepted) {
        throw new Error("handler neither inherits from Reflect or an ObjectGraphHandler in this membrane");
      }
    }

    /*
     * Ensure the proxy actually belongs to the object graph the base handler
     * represents.
     */
    if (!this.membrane.map.has(oldProxy)) {
      throw new Error("This membrane does not own the proxy!");
    }

    let map = this.membrane.map.get(oldProxy), cachedProxy, cachedField;
    if (baseHandler === Reflect) {
      cachedField = map.originField;
    }
    else {
      cachedField = baseHandler.fieldName;
      if (cachedField == map.originField)
        throw new Error("You must replace original values with either Reflect or a ChainHandler inheriting from Reflect");
    }
    cachedProxy = map.getProxy(cachedField);

    if (cachedProxy != oldProxy)
      throw new Error("You cannot replace the proxy with a handler from a different object graph!");

    // Finally, do the actual proxy replacement.
    let original = map.getOriginal(), shadowTarget;
    if (baseHandler === Reflect) {
      shadowTarget = original;
    }
    else {
      shadowTarget = map.getShadowTarget(cachedField);
    }
    let parts = Proxy.revocable(shadowTarget, handler);
    parts.value = original;
    parts.override = true;
    parts.shadowTarget = shadowTarget;
    //parts.extendedHandler = handler;
    map.set(this.membrane, cachedField, parts);
    makeRevokeDeleteRefs(parts, map, cachedField);

    let gHandler = this.membrane.getHandlerByField(cachedField);
    gHandler.addRevocable(map.originField === cachedField ? map : parts.revoke);
    return parts.proxy;
  },

  /**
   * Ensure that the proxy passed in matches the object graph handler.
   *
   * @param fieldName  {Symbol|String} The handler's field name.
   * @param proxy      {Proxy}  The value to look up.
   * @param methodName {String} The calling function's name.
   * 
   * @private
   */
  assertLocalProxy: function(fieldName, proxy, methodName) {
    let [found, match] = this.membrane.getMembraneProxy(fieldName, proxy);
    if (!found || (proxy !== match)) {
      throw new Error(methodName + " requires a known proxy!");
    }
  },

  /**
   * Require that new properties be stored via the proxies instead of propagated
   * through to the underlying object.
   *
   * @param fieldName {Symbol|String} The field name of the object graph handler
   *                                  the proxy uses.
   * @param proxy     {Proxy}  The proxy (or underlying object) needing local
   *                           property protection.
   */
  storeUnknownAsLocal: function(fieldName, proxy) {
    this.assertLocalProxy(fieldName, proxy, "storeUnknownAsLocal");

    let metadata = this.membrane.map.get(proxy);
    metadata.setLocalFlag(fieldName, "storeUnknownAsLocal", true);
  },

  /**
   * Require that properties be deleted only on the proxy instead of propagated
   * through to the underlying object.
   *
   * @param fieldName {Symbol|String} The field name of the object graph handler
   *                                  the proxy uses.
   * @param proxy     {Proxy}  The proxy (or underlying object) needing local
   *                           property protection.
   */
  requireLocalDelete: function(fieldName, proxy) {
    this.assertLocalProxy(fieldName, proxy, "requireLocalDelete");

    let metadata = this.membrane.map.get(proxy);
    metadata.setLocalFlag(fieldName, "requireLocalDelete", true);
  },

  /**
   * Apply a filter to the original list of own property names from an
   * underlying object.
   *
   * @note Local properties and local delete operations of a proxy are NOT
   * affected by the filters.
   * 
   * @param fieldName {Symbol|String} The field name of the object graph handler
   *                                  the proxy uses.
   * @param proxy     {Proxy}    The proxy (or underlying object) needing local
   *                             property protection.
   * @param filter    {Function} The filtering function.
   *
   * @see Array.prototype.filter.
   */
  filterOwnKeys: function(fieldName, proxy, filter) {
    this.assertLocalProxy(fieldName, proxy, "filterOwnKeys");
    if ((typeof filter !== "function") && (filter !== null))
      throw new Error("filterOwnKeys must be a filter function!");
    let metadata = this.membrane.map.get(proxy);
    metadata.setOwnKeysFilter(fieldName, filter);
  },
});
Object.seal(ModifyRulesAPI);
/*
We will wrap the Membrane constructor in a Membrane, to protect the internal API
from public usage.  This is known as "eating your own dogfood" in software
engineering parlance.  Not only is it an additional proof-of-concept that the
Membrane works, but it will help ensure external consumers of the membrane
module cannot rewrite how each individual Membrane works.
*/
var Membrane;
if (false) {
  var DogfoodMembrane = new MembraneInternal({
    /* configuration options here */
  });

  /* This provides a weak reference to each proxy coming out of a Membrane.
   *
   * Why have this tracking mechanism?  The "dogfood" membrane must ensure any
   * value it returns to an external customer is not wrapped in both the
   * "dogfood" membrane and another membrane.  This double-wrapping is harmful
   * for performance and causes unintended bugs.
   *
   * To do that, on any returned value, the "dogfood" membrane will follow this
   * algorithm:
   * (1) Let value be the value the "dogfood" membrane's "public" object graph
   *     handler would normally return.
   * (2) Let dogfood be the "dogfood" membrane.
   * (3) Let map be dogfood.map.get(value).  This will be a ProxyMapping
   *     instance belonging to the "dogfood" membrane.
   * (4) Let original be map.getOriginal().
   * (5) Let x be ProxyToMembraneMap.has(original).  This will either be true if
   *     original refers to a MembraneInternal instance, or false if there is no
   *     such reference.
   * (6) If x is false, return value.
   * (7) Otherwise, value has been incorrectly wrapped.  Return original.
   *
   * The reference is weak because we do not want to risk leaking memory with
   * strong references to the ProxyMapping instance.  The ProxyMapping instance
   * is referenced only by proxies exported from any Membrane, via another
   * WeakMap the ProxyMapping belongs to.
   */
  DogfoodMembrane.ProxyToMembraneMap = new WeakSet();

  let publicAPI   = DogfoodMembrane.getHandlerByField("public", true);
  let internalAPI = DogfoodMembrane.getHandlerByField("internal", true);

  // lockdown of the public API here

  // Define our Membrane constructor properly.
  Membrane = DogfoodMembrane.convertArgumentToProxy(
    internalAPI, publicAPI, MembraneInternal
  );
  /* XXX ajvincent Membrane.prototype should return an object with descriptor
   * "secured": {value: true, writable: false, enumerable: false, configurable: false}
   */

  if (false) {
    /* XXX ajvincent Right now it's unclear if this operation is safe.  It
     * probably isn't, but as long as DogfoodMembrane isn't exposed outside this
     * module, we're okay.
     */
    let finalWrap = DogfoodMembrane.convertArgumentToProxy(
      internalAPI, publicAPI, DogfoodMembrane
    );

    // Additional securing and API overrides of DogfoodMembrane here.

    DogfoodMembrane = finalWrap;
  }
}
else {
  Membrane = MembraneInternal;
}
MembraneInternal = null;
module.exports.Membrane = Membrane;
