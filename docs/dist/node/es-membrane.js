"use strict"
var assert = require("assert");
function returnTrue() {
  return true;
}
function returnFalse() {
  return false;
}

function NOT_IMPLEMENTED() {
  throw new Error("Not implemented!");
}

function DataDescriptor(value, writable = false, enumerable = true, configurable = true) {
  this.value = value;
  this.writable = writable;
  this.enumerable = enumerable;
  this.configurable = configurable;
}

function AccessorDescriptor(getter, setter, enumerable = true, configurable = true) {
  this.get = getter;
  this.set = setter;
  this.enumerable = enumerable;
  this.configurable = configurable;
}

function NWNCDataDescriptor(value, enumerable = true) {
  this.value = value;
  this.enumerable = enumerable;
}
NWNCDataDescriptor.prototype.writable = false;
NWNCDataDescriptor.prototype.configurable = false;
Object.freeze(NWNCDataDescriptor.prototype);

const NOT_IMPLEMENTED_DESC = new AccessorDescriptor(
  NOT_IMPLEMENTED,
  NOT_IMPLEMENTED
);

function isDataDescriptor(desc) {
  if (typeof desc === "undefined")
    return false;
  if (!("value" in desc) && !("writable" in desc))
    return false;
  return true;
}

function isAccessorDescriptor(desc) {
  if (typeof desc === "undefined") {
    return false;
  }
  if (!("get" in desc) && !("set" in desc))
    return false;
  return true;
}

function isGenericDescriptor(desc) {
  if (typeof desc === "undefined")
    return false;
  return !isAccessorDescriptor(desc) && !isDataDescriptor(desc);
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
  else if (typeof value == "function")
    rv = function() {};
  else
    throw new Error("Unknown value for makeShadowTarget");
  ShadowKeyMap.set(rv, value);
  return rv;
}

function getRealTarget(target) {
  return ShadowKeyMap.has(target) ? ShadowKeyMap.get(target) : target;
}

function stringifyArg(arg) {
  if (arg === null)
    return "null";
  if (arg === undefined)
    return "undefined";
  if (Array.isArray(arg))
    return "[" + arg.map(stringifyArg).join(", ") + "]";

  let type = valueType(arg);
  if (type == "primitive")
    return arg.toString();
  if (type == "function")
    return "()";
  return "{}";
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
    var msg;

    let mayLog = this.membrane.__mayLog__();

    this.membrane.handlerStack.unshift(trapName);
    if (mayLog) {
      msg = trapName + "(";
      for (let i = 0; i < arguments.length; i++) {
        let arg = arguments[i];
        msg += stringifyArg(arg) + ", ";
      }
      if (arguments.length)
        msg = msg.substr(0, msg.length - 2);
      msg += ")";

      this.membrane.logger.info(
        msg + " inGraphHandler++"
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
        msg += " returned " + stringifyArg(rv);
        this.membrane.logger.info(
          msg + " inGraphHandler--"
        );
      }
    }

    return rv;
  };
  //*/
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

  // necessary: in OverriddenProxyParts, revoke is inherited and read-only.
  Reflect.defineProperty(parts, "revoke", new DataDescriptor(function() {
    oldRevoke.apply(parts);
    mapping.remove(field);
  }, true));
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
    FILTERED_KEYS_WITHOUT_LOCAL: "Filtering own keys without allowing local property defines or deletes is dangerous",
    PROTOTYPE_FILTER_MISSING: "Proxy filter specified to inherit from prototype, but prototype provides no filter",
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
      throw new Error("getShadowTarget called for unknown field!");
    rv = rv.shadowTarget;
    return rv;
  }),

  "isShadowTarget": new DataDescriptor(function(shadowTarget) {
    return Reflect.ownKeys(this.proxiedFields).some(function(field) {
      return this.proxiedFields[field].shadowTarget === shadowTarget;
    }, this);
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
      if (valueType(parts.proxy) !== "primitive") {
        if (DogfoodMembrane && (membrane !== DogfoodMembrane))
          DogfoodMembrane.ProxyToMembraneMap.add(parts.proxy);
        membrane.map.set(parts.proxy, this);
      }
    }
    else if (this.originalValue === NOT_YET_DETERMINED) {
      this.originalValue = parts.value;
      delete parts.proxy;
      delete parts.revoke;
    }
  
    if (!membrane.map.has(parts.value)) {
      if (DogfoodMembrane && (membrane !== DogfoodMembrane))
        DogfoodMembrane.ProxyToMembraneMap.add(parts.value);

      if (valueType(parts.value) !== "primitive")
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

  "getTruncateArgList":
  new DataDescriptor(function(fieldName) {
    if (!this.hasField(fieldName))
      return false;
    var metadata = this.proxiedFields[fieldName];
    return (typeof metadata.truncateArgList !== "undefined") ?
           metadata.truncateArgList :
           false;
  }),

  "setTruncateArgList":
  new DataDescriptor(function(fieldName, value) {
    this.proxiedFields[fieldName].truncateArgList = value;
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

    if (!Reflect.isExtensible(value))
      Reflect.preventExtensions(shadowTarget);

    var parts;
    if (isOriginal) {
      parts = { value: value };
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

    if (keys.includes("value")) {
      wrappedDesc.value = this.convertArgumentToProxy(
        originHandler,
        targetHandler,
        desc.value
      );
    }

    if (keys.includes("get")) {
      wrappedDesc.get = function wrappedGetter () {
        const wrappedThis = membrane.convertArgumentToProxy(targetHandler, originHandler, this);
        return membrane.convertArgumentToProxy(
          originHandler,
          targetHandler,
          desc.get.call(wrappedThis)
        );
      };
    }

    if (keys.includes("set") && (typeof desc.set === "function")) {
      const wrappedSetter = function(value) {
        const wrappedThis  = membrane.convertArgumentToProxy(targetHandler, originHandler, this);
        const wrappedValue = membrane.convertArgumentToProxy(targetHandler, originHandler, value);
        return membrane.convertArgumentToProxy(
          originHandler,
          targetHandler,
          desc.set.call(wrappedThis, wrappedValue)
        );
      };
      this.buildMapping(targetHandler, wrappedSetter);
      wrappedDesc.set = wrappedSetter;
    }

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
/* A proxy handler designed to return only primitives and objects in a given
 * object graph, defined by the fieldName.
 */
function ObjectGraphHandler(membrane, fieldName) {
  {
    let t = typeof fieldName;
    if ((t != "string") && (t != "symbol"))
      throw new Error("field must be a string or a symbol!");
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
    "membrane": new NWNCDataDescriptor(membrane, false),
    "fieldName": new NWNCDataDescriptor(fieldName, false),

    "boundMethods": new NWNCDataDescriptor(boundMethods, false),

    /* Temporary until membraneGraphName is defined on Object.prototype through
     * the object graph.
     */
    "graphNameDescriptor": new NWNCDataDescriptor(
      new DataDescriptor(fieldName), false
    ),

    // see .defineLazyGetter, ProxyNotify for details.
    "proxiesInConstruction": new NWNCDataDescriptor(
      new WeakMap(/* original value: [callback() {}, ...]*/), false
    ),

    "__revokeFunctions__": new NWNCDataDescriptor([], false),

    "__isDead__": new DataDescriptor(false, true, true, true),

    "passThroughFilter": {
      get: () => passThroughFilter,
      set: (val) => {
        if (passThroughFilter !== returnFalse)
          throw new Error("passThroughFilter has been defined once already!");
        if (typeof val !== "function")
          throw new Error("passThroughFilter must be a function");
        passThroughFilter = val;
        return val;
      },
      enumerable: false,
      configurable: false,
    },

    "mayReplacePassThrough": {
      get: () => passThroughFilter === returnFalse,
      enumerable: true,
      configurable: false
    },

    "__proxyListeners__": new NWNCDataDescriptor([], false),

    "__functionListeners__": new NWNCDataDescriptor([], false),
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
   */

  // ProxyHandler
  ownKeys: inGraphHandler("ownKeys", function(shadowTarget) {
    this.validateTrapAndShadowTarget("ownKeys", shadowTarget);
    if (!Reflect.isExtensible(shadowTarget))
      return Reflect.ownKeys(shadowTarget);

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
      let pMapping = this.membrane.map.get(target);
      let shadow = pMapping.getShadowTarget(this.fieldName);
      hasOwn = this.getOwnPropertyDescriptor(shadow, propName);
      if (typeof hasOwn !== "undefined")
        return true;
      target = this.getPrototypeOf(shadow);
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
    this.validateTrapAndShadowTarget("get", shadowTarget);

    var desc, target, found, rv, protoLookups = 0;
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
      let targetMap = this.membrane.map.get(target);
      {
        /* Special case:  Look for a local property descriptors first, and if we
         * find it, return it unwrapped.
         */
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
      let shadow = targetMap.getShadowTarget(this.fieldName);
      desc = this.getOwnPropertyDescriptor(shadow, propName);
      if (!desc) {
        // this is just for debugging purposes and has no real meaning.
        protoLookups++;

        let proto = this.getPrototypeOf(shadow);
        if (proto === null)
          return undefined;

        {
          let foundProto, other;
          [foundProto, other] = this.membrane.getMembraneProxy(
            this.fieldName,
            proto
          );
          assert(foundProto, "Must find membrane proxy for prototype");
          assert(other === proto, "Retrieved prototypes must match");
        }

        if (Reflect.isExtensible(shadow))
        {
          let foundProto;
          [foundProto, target] = this.membrane.getMembraneValue(
            this.fieldName,
            proto
          );
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

    return rv;
  }),

  // ProxyHandler
  getOwnPropertyDescriptor:
  inGraphHandler("getOwnPropertyDescriptor", function(shadowTarget, propName) {
    this.validateTrapAndShadowTarget("getOwnPropertyDescriptor", shadowTarget);

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

      // See .getPrototypeOf trap comments for why this matters.
      const isProtoDesc = (propName === "prototype") && isDataDescriptor(desc);
      const isForeign = ((desc !== undefined) &&
                         (targetMap.originField !== this.fieldName));
      if (isProtoDesc || isForeign) {
        // This is necessary to force desc.value to really be a proxy.
        let configurable = desc.configurable;
        desc.configurable = true;
        desc = this.membrane.wrapDescriptor(
          targetMap.originField, this.fieldName, desc
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
  }),

  // ProxyHandler
  getPrototypeOf: inGraphHandler("getPrototypeOf", function(shadowTarget) {
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
     * as an option.  If you really insist, you should look at either
     * ModifyRulesAPI.prototype.replaceProxy(), or replacing the referring
     * membrane proxy in the object graph with its own shadow target.
     *
     * XXX ajvincent update this comment after fixing #76 to specify how the
     * user will extract the shadow target.
     */
    const target = getRealTarget(shadowTarget);
    const targetMap = this.membrane.map.get(target);

    try {
      const proto = Reflect.getPrototypeOf(target);
      let proxy;
      if (targetMap.originField !== this.fieldName)
        proxy = this.membrane.convertArgumentToProxy(
          this.membrane.getHandlerByName(targetMap.originField),
          this,
          proto
        );
      else
        proxy = proto;

      let pMapping = this.membrane.map.get(proxy);
      if (pMapping && (pMapping.originField !== this.fieldName)) {
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
  }),

  // ProxyHandler
  isExtensible: inGraphHandler("isExtensible", function(shadowTarget) {
    this.validateTrapAndShadowTarget("isExtensible", shadowTarget);

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

    if (!rv)
      // This is our one and only chance to set properties on the shadow target.
      this.lockShadowTarget(shadowTarget);

    return rv;
  }),

  // ProxyHandler
  preventExtensions: inGraphHandler("preventExtensions", function(shadowTarget) {
    this.validateTrapAndShadowTarget("preventExtensions", shadowTarget);

    var target = getRealTarget(shadowTarget);
    var targetMap = this.membrane.map.get(target);
    var _this = targetMap.getOriginal();

    // Walk the prototype chain to look for shouldBeLocal.
    var shouldBeLocal = this.getLocalFlag(target, "storeUnknownAsLocal", true);

    if (!shouldBeLocal && !this.isExtensible(shadowTarget))
      return true;

    // This is our one and only chance to set properties on the shadow target.
    var rv = this.lockShadowTarget(shadowTarget);

    if (!shouldBeLocal)
      rv = Reflect.preventExtensions(_this);
    return rv;
  }),

  // ProxyHandler
  deleteProperty: inGraphHandler("deleteProperty", function(shadowTarget, propName) {
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
    var targetMap, shouldBeLocal;

    try {
      targetMap = this.membrane.map.get(target);
      shouldBeLocal = this.requiresDeletesBeLocal(target);

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

    let desc = this.getOwnPropertyDescriptor(shadowTarget, propName);
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

    do {
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

      let pMapping = this.membrane.map.get(target);
      let shadow = pMapping.getShadowTarget(this.fieldName);
      ownDesc = this.getOwnPropertyDescriptor(shadow, propName);
      if (ownDesc)
        break;

      {
        let parent = this.getPrototypeOf(shadow);
        if (parent === null) {
          ownDesc = new DataDescriptor(undefined, true);
          break;
        }

        let found = this.membrane.getMembraneProxy(
          this.fieldName,
          parent
        )[0];
        assert(found, "Must find membrane proxy for prototype");
        let sMapping = this.membrane.map.get(parent);
        assert(sMapping, "Missing a ProxyMapping?");

        if (sMapping.originField != this.fieldName) {
          [found, target] = this.membrane.getMembraneValue(
            this.fieldName,
            parent
          );
          assert(found, "Must find membrane value for prototype");
        }
        else
        {
          target = parent;
        }
      }
    } while (true); // end optimization for ownDesc

    // Special step:  convert receiver to unwrapped value.
    let receiverMap = this.membrane.map.get(receiver);
    if (!receiverMap) {
      // We may be under construction.
      let proto = Object.getPrototypeOf(receiver);
      let protoMap = this.membrane.map.get(proto);
      let pHandler = this.membrane.getHandlerByName(protoMap.originField);

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
            this.membrane.getHandlerByName(receiverMap.originField),
            value
          ),
          true
        );
      }
      else {
        rvProxy = new DataDescriptor(value, true);
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
    // 8. Perform ? Call(setter, Receiver, « V »).

    if (!shouldBeLocal) {
      // Only now do we convert the value to the target object graph.
      let rvProxy = this.membrane.convertArgumentToProxy(
        this,
        this.membrane.getHandlerByName(receiverMap.originField),
        value
      );
      this.apply(this.getShadowTarget(setter), receiver, [ rvProxy ]);
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
  }),

  // ProxyHandler
  setPrototypeOf: inGraphHandler("setPrototypeOf", function(shadowTarget, proto) {
    this.validateTrapAndShadowTarget("setPrototypeOf", shadowTarget);

    var target = getRealTarget(shadowTarget);
    try {
      var targetMap = this.membrane.map.get(target);
      var _this = targetMap.getOriginal();

      let protoProxy, wrappedProxy, found;
      if (targetMap.originField !== this.fieldName) {
        protoProxy = this.membrane.convertArgumentToProxy(
          this,
          this.membrane.getHandlerByName(targetMap.originField),
          proto
        );
        [found, wrappedProxy] = this.membrane.getMembraneProxy(
          this.fieldName, proto
        );
        assert(found, "Membrane proxy not found immediately after wrapping!");
      }
      else {
        protoProxy = proto;
        wrappedProxy = proto;
      }

      var rv = this.externalHandler(function() {
        return Reflect.setPrototypeOf(_this, protoProxy);
      });
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
  }),

  // ProxyHandler
  apply: inGraphHandler("apply", function(shadowTarget, thisArg, argumentsList) {
    this.validateTrapAndShadowTarget("apply", shadowTarget);

    var target = getRealTarget(shadowTarget);
    var _this, args = [];
    let targetMap  = this.membrane.map.get(target);
    let argHandler = this.membrane.getHandlerByName(targetMap.originField);

    const mayLog = this.membrane.__mayLog__();
    if (mayLog) {
      this.membrane.logger.debug([
        "apply originFields: inbound = ",
        argHandler.fieldName,
        ", outbound = ",
        this.fieldName
      ].join(""));
    }

    argumentsList = this.truncateArguments(target, argumentsList);

    // This is where we are "counter-wrapping" an argument.
    const optionsBase = Object.seal({
      callable: target,
      trapName: "apply"
    });

    if (targetMap.originField !== this.fieldName) {
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

    this.notifyFunctionListeners(
      "enter",
      "apply",
      target,
      undefined,
      argHandler
    );

    var rv;
    try {
      rv = this.externalHandler(function() {
        return Reflect.apply(target, _this, args);
      });
    }
    catch (ex) {
      this.notifyFunctionListeners(
        "throw",
        "apply",
        target,
        ex,
        argHandler
      );
      throw ex;
    }

    if (mayLog) {
      this.membrane.logger.debug("apply wrapping return value");
    }

    if (targetMap.originField !== this.fieldName)
      rv = this.membrane.convertArgumentToProxy(
        argHandler,
        this,
        rv
      );

    /* This is a design decision, to pass the wrapped proxy object instead of
     * the unwrapped value.  There's no particular reason for it, except that I
     * wanted to ensure that the returned value had been wrapped before invoking
     * the listener (so that both the proxy and the unwrapped value could be
     * found from the membrane).  Once the wrapping is done, we could pass the
     * unwrapped value if we wanted... but there's no particular reason to favor
     * the proxy versus the unwrapped value, or vice versa.
    */
    this.notifyFunctionListeners(
      "return",
      "apply",
      target,
      rv,
      argHandler
    );

    if (mayLog) {
      this.membrane.logger.debug("apply exiting");
    }
    return rv;
  }),

  // ProxyHandler
  construct:
  inGraphHandler("construct", function(shadowTarget, argumentsList, ctorTarget) {
    this.validateTrapAndShadowTarget("construct", shadowTarget);

    var target = getRealTarget(shadowTarget);
    var args = [];
    let targetMap  = this.membrane.map.get(target);
    let argHandler = this.membrane.getHandlerByName(targetMap.originField);

    const mayLog = this.membrane.__mayLog__();
    if (mayLog) {
      this.membrane.logger.debug([
        "construct originFields: inbound = ",
        argHandler.fieldName,
        ", outbound = ",
        this.fieldName
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

    this.notifyFunctionListeners(
      "enter",
      "construct",
      target,
      undefined,
      argHandler
    );

    var rv;

    try {
      rv = this.externalHandler(function() {
        return Reflect.construct(target, args, ctor);
      });
    }
    catch (ex) {
      this.notifyFunctionListeners(
        "throw",
        "construct",
        target,
        ex,
        argHandler
      );
      throw ex;
    }

    rv = this.membrane.convertArgumentToProxy(
      argHandler,
      this,
      rv
    );

    /* This is a design decision, to pass the wrapped proxy object instead of
     * the unwrapped value.  There's no particular reason for it, except that I
     * wanted to ensure that the returned value had been wrapped before invoking
     * the listener (so that both the proxy and the unwrapped value could be
     * found from the membrane).  Once the wrapping is done, we could pass the
     * unwrapped value if we wanted... but there's no particular reason to favor
     * the proxy versus the unwrapped value, or vice versa.
    */
    this.notifyFunctionListeners(
      "return",
      "construct",
      target,
      rv,
      argHandler
    );

    if (mayLog) {
      this.membrane.logger.debug("construct exiting");
    }
    return rv;
  }),

  /**
   * Ensure the first argument is a known shadow target.
   *
   * @param {String} trapName     The name of the trap to run.
   * @param {Object} shadowTarget The supposed target.
   * @private
   */
  validateTrapAndShadowTarget: function(trapName, shadowTarget) {
    const target = getRealTarget(shadowTarget);
    const targetMap = this.membrane.map.get(target);
    if (!(targetMap instanceof ProxyMapping))
      throw new Error("No ProxyMapping found for shadow target!");
    if (!targetMap.isShadowTarget(shadowTarget)) {
      throw new Error(
        "ObjectGraphHandler traps must be called with a shadow target!"
      );
    }
    const disableTrapFlag = `disableTrap(${trapName})`;
    if (targetMap.getLocalFlag(this.fieldName, disableTrapFlag) ||
        targetMap.getLocalFlag(targetMap.originField, disableTrapFlag))
      throw new Error(`The ${trapName} trap is not executable.`);
  },

  /**
   * Get the shadow target associated with a real value.
   *
   * @private
   */
  getShadowTarget: function(target) {
    let targetMap = this.membrane.map.get(target);
    return targetMap.getShadowTarget(this.fieldName);
  },

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
   * Notify listeners we are transitioning from one object graph to another for
   * a function call.
   *
   * @param reason   {String} Either "enter", "return" or "throw".
   * @param trapName {String} Either "apply" or "construct".
   * @param target   {Object} The unwrapped target we call.
   * @param rvOrExn  {Any}    If reason is "enter", undefined.
   *                          If reason is "return", the return value.
   *                          If reason is "throw", the exception.
   * @param origin   {ObjectGraphHandler} The origin graph handler.
   *
   * @note
   *
   * @private
   */
  notifyFunctionListeners:
  function(reason, trapName, target, rvOrExn, origin) {
    var listeners;
    {
      let ourListeners = this.__functionListeners__.slice(0);
      let nativeListeners = origin.__functionListeners__.slice(0);
      let membraneListeners = this.membrane.__functionListeners__.slice(0);
      listeners = ourListeners.concat(nativeListeners, membraneListeners);
    }
    if (listeners.length === 0)
      return;

    const args = [
      reason,
      trapName,
      this.fieldName,
      origin.fieldName,
      target,
      rvOrExn
    ];
    Object.freeze(args);

    listeners.forEach((func) => {
      try {
        func.apply(null, args);
      }
      catch (ex) {
        if (this.membrane.__mayLog__()) {
          try {
            this.membrane.logger.error(ex);
          }
          catch (ex2) {
            // do nothing
          }
        }
      }
    }, this);
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
   * Set all properties on a shadow target, including prototype, and seal it.
   *
   * @private
   */
  lockShadowTarget: function(shadowTarget) {
    const target = getRealTarget(shadowTarget);
    const targetMap = this.membrane.map.get(target);
    const _this = targetMap.getOriginal();
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
    var rv;
    {
      let originExtraKeys = targetMap.localOwnKeys(targetMap.originField);
      let targetExtraKeys = targetMap.localOwnKeys(this.fieldName);
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
    targetMap.setCachedOwnKeys(this.fieldName, rv, originalKeys);

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
      targetNonconfigurableKeys.forEach(function(propName) {
        if (!uncheckedResultKeys.has(propName)) {
          rv.push(propName);
        }
        uncheckedResultKeys.delete(propName);
      }, this);

      // step 18
      if (extensibleTarget)
        return rv;

      // step 19
      targetConfigurableKeys.forEach(function(key) {
        if (!uncheckedResultKeys.has(key)) {
          rv.push(propName);
        }
        uncheckedResultKeys.delete(key);
      });

      // step 20
      assert(uncheckedResultKeys.size === 0, "all required keys should be applied by now");
    }
    return rv;
  },

  /**
   * Define a "lazy" accessor descriptor which replaces itself with a direct
   * property descriptor when needed.
   *
   * @param source       {Object} The source object holding a property.
   * @param shadowTarget {Object} The shadow target for a proxy.
   * @param propName     {String|Symbol} The name of the property to copy.
   *
   * @returns {Boolean} true if the lazy property descriptor was defined.
   *
   * @private
   */
  defineLazyGetter: function(source, shadowTarget, propName) {
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
       * I hope that a ECMAScript engine can be written (and a future ES7
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
            handler.fieldName, shadowTarget
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
        const targetMap = handler.membrane.map.get(target);

        // sourceDesc is the descriptor we really want
        let sourceDesc = (
          targetMap.getLocalDescriptor(handler.fieldName, propName) ||
          Reflect.getOwnPropertyDescriptor(source, propName)
        );

        if ((sourceDesc !== undefined) &&
            (targetMap.originField !== handler.fieldName)) {
          let hasUnwrapped = "value" in sourceDesc,
              unwrapped = sourceDesc.value;

          // This is necessary to force desc.value to be wrapped in the membrane.
          let configurable = sourceDesc.configurable;
          sourceDesc.configurable = true;
          sourceDesc = handler.membrane.wrapDescriptor(
            targetMap.originField, handler.fieldName, sourceDesc
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
          const targetMap = handler.membrane.map.get(target);
          if (targetMap.originField !== handler.fieldName) {
            let originHandler = handler.membrane.getHandlerByName(
              targetMap.originField
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
      handler.membrane.buildMapping(handler, lazyDesc.get);
      handler.membrane.buildMapping(handler, lazyDesc.set);
    }

    {
      let current = Reflect.getOwnPropertyDescriptor(source, propName);
      if (current && !current.enumerable)
        lazyDesc.enumerable = false;
    }

    return Reflect.defineProperty(shadowTarget, propName, lazyDesc);
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
    let map = this.membrane.map.get(target);
    const field = this.fieldName;
    const originField = map.originField;
    while (true) {
      let shouldBeLocal = map.getLocalFlag(field, flagName) ||
                          map.getLocalFlag(originField, flagName);
      if (shouldBeLocal)
        return true;
      if (!recurse)
        return false;
      let shadowTarget = map.getShadowTarget(this.fieldName);

      /* XXX ajvincent I suspect this assertion might fail if
       * this.fieldName == map.originField:  if the field represents an original
       * value.
       */
      assert(shadowTarget, "getLocalFlag failed to get a shadow target!");

      let protoTarget = this.getPrototypeOf(shadowTarget);
      if (!protoTarget)
        return false;
      map = this.membrane.map.get(protoTarget);
      assert(map instanceof ProxyMapping, "map not found in getLocalFlag?");
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
    var protoTarget = target;
    var map = this.membrane.map.get(protoTarget);
    const originField = map.originField;
    while (true) {
      let shouldBeLocal = map.getLocalFlag(this.fieldName, "requireLocalDelete") ||
                          map.getLocalFlag(originField, "requireLocalDelete");
      if (shouldBeLocal)
        return true;
      let shadowTarget = map.getShadowTarget(this.fieldName);
      protoTarget = this.getPrototypeOf(shadowTarget);
      if (!protoTarget)
        return false;
      map = this.membrane.map.get(protoTarget);
    }
  },

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
  truncateArguments: function(target, argumentsList) {
    assert(Array.isArray(argumentsList), "argumentsList must be an array!");
    const map = this.membrane.map.get(target);

    var originCount = map.getTruncateArgList(map.originField);
    if (typeof originCount === "boolean") {
      originCount = originCount ? target.length : Infinity;
    }
    else {
      assert(Number.isInteger(originCount) && (originCount >= 0),
             "must call slice with a non-negative integer length");
    }

    var targetCount = map.getTruncateArgList(this.fieldName);
    if (typeof targetCount === "boolean") {
      targetCount = targetCount ? target.length : Infinity;
    }
    else {
      assert(Number.isInteger(targetCount) && (targetCount >= 0),
             "must call slice with a non-negative integer length");
    }

    const count = Math.min(originCount, targetCount);
    return argumentsList.slice(0, count);
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
    Object.defineProperty(this, "__isDead__", new DataDescriptor(true));
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
 * @param parts    {Object} The field object from a ProxyMapping's proxiedFields.
 * @param handler  {ObjectGraphHandler} The handler for the proxy.
 * @param isOrigin {Boolean} True if the handler is the origin graph handler.
 * @param options  {Object} Special options to pass on to the listeners.
 *
 * @private
 */
function ProxyNotify(parts, handler, isOrigin, options) {
  "use strict";
  if (typeof options === "undefined")
    options = {};

  // private variables
  const listeners = handler.__proxyListeners__;
  if (listeners.length === 0)
    return;
  const modifyRules = handler.membrane.modifyRules;

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
    "proxy": new AccessorDescriptor(
      () => parts.proxy,
      (val) => { if (!meta.stopped) parts.proxy = val; }
    ),

    /* XXX ajvincent revoke is explicitly NOT exposed, lest a listener call it 
     * and cause chaos for any new proxy trying to rely on the existing one.  If
     * you really have a problem, use throwException() below.
     */

    /**
     * The unwrapped object or function we're building the proxy for.
     */
    "target": new DataDescriptor(parts.value),

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
     * Rebuild the proxy object.
     */
    "rebuildProxy": new DataDescriptor(
      function() {
        if (!this.stopped)
          parts.proxy = modifyRules.replaceProxy(parts.proxy, handler);
      }
    ),

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
  handler.proxiesInConstruction.set(parts.value, callbacks);

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

    handler.proxiesInConstruction.delete(parts.value);
  }
}

ProxyNotify.useShadowTarget = function(parts, handler, mode) {
  "use strict";
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

  const masterMap = handler.membrane.map;
  let map = masterMap.get(parts.value);
  assert(map instanceof ProxyMapping,
         "Didn't get a ProxyMapping for an existing value?");
  masterMap.set(parts.proxy, map);
  makeRevokeDeleteRefs(parts, map, handler.fieldName);
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
      desc = new DataDescriptor(
        inGraphHandler(propName, desc.value),
        desc.writable,
        desc.enumerable,
        desc.configurable
      );
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
   * Convert a shadow target to a real proxy target.
   *
   * @param {Object} shadowTarget The supposed target.
   *
   * @returns {Object} The target this shadow target maps to.
   */
  getRealTarget: getRealTarget,

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
      if (!this.membrane.ownsHandler(existingHandler)) {
        // XXX ajvincent Fix this error message!!
        throw new Error("fieldName must be a string or a symbol representing an ObjectGraphName in the Membrane, or null to represent Reflect");
      }

      baseHandler = this.membrane.getHandlerByName(existingHandler.fieldName);
      description = "our membrane's " + baseHandler.fieldName + " ObjectGraphHandler";
    }

    else if (baseHandler !== Reflect) {
      // XXX ajvincent Fix this error message!!
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
        let ownedHandler = this.membrane.getHandlerByName(fieldName);
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

    let gHandler = this.membrane.getHandlerByName(cachedField);
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
   * @param filter    {Function} The filtering function.  (May be an Array or
   *                             a Set, which becomes a whitelist filter.)
   * @param options   {Object} Broken down as follows:
   * - inheritFilter: {Boolean} True if we should accept whatever the filter for
   *                            Reflect.getPrototypeOf(proxy) accepts.
   *
   * @see Array.prototype.filter.
   */
  filterOwnKeys: function(fieldName, proxy, filter, options = {}) {
    this.assertLocalProxy(fieldName, proxy, "filterOwnKeys");

    if (Array.isArray(filter)) {
      filter = new Set(filter);
    }

    if (filter instanceof Set) {
      const s = filter;
      filter = (key) => s.has(key);
    }

    if ((typeof filter !== "function") && (filter !== null))
      throw new Error("filterOwnKeys must be a filter function, array or Set!");

    if (filter &&
        ("inheritFilter" in options) &&
        (options.inheritFilter === true)) 
    {
      const firstFilter = filter;
      const membrane = this.membrane;
      filter = function(key) {
        if (firstFilter(key))
          return true;

        const proto = Reflect.getPrototypeOf(proxy);
        if (proto === null)
          return false; // firstFilter is the final filter: reject

        if (!membrane.map.has(proto)) {
          /* This can happen when we are applying a filter for the first time,
           * but the prototype was never wrapped.  If you're using inheritFilter,
           * that means presumably you're aware of filtering by the chain.  So
           * it should be safe to wrap the prototype now...
           */

          if ((options.originHandler instanceof ObjectGraphHandler) &&
              (options.targetHandler instanceof ObjectGraphHandler))
          {
            membrane.convertArgumentToProxy(
              options.originHandler,
              options.targetHandler,
              proto
            );
          }
        }

        const pMapping = membrane.map.get(proto);
        assert(pMapping instanceof ProxyMapping,
               "Found prototype of membrane proxy, but it has no ProxyMapping!");

        const nextFilter = pMapping.getOwnKeysFilter(fieldName);
        if (!nextFilter) {
          membrane.warnOnce(
            membrane.constants.warnings.PROTOTYPE_FILTER_MISSING
          );
          return true; // prototype does no filtering of their own keys
        }
        if (nextFilter && !nextFilter(key))
          return false;

        return true;
      };
    }

    /* Defining a filter after a proxy's shadow target is not extensible
     * guarantees inconsistency.  So we must disallow that possibility.
     *
     * Note that if the proxy becomes not extensible after setting a filter,
     * that's all right.  When the proxy becomes not extensible, it then sets
     * all the proxies of the shadow target before making the shadow target not
     * extensible.
     */
    let metadata = this.membrane.map.get(proxy);
    let fieldsToCheck;
    if (metadata.originField === fieldName)
    {
      fieldsToCheck = Reflect.ownKeys(metadata.proxiedFields);
      fieldsToCheck.splice(fieldsToCheck.indexOf(fieldName), 1);
    }
    else
      fieldsToCheck = [ fieldName ];

    let allowed = fieldsToCheck.every(function(f) {
      let s = metadata.getShadowTarget(f);
      return Reflect.isExtensible(s);
    });

    if (allowed)
      metadata.setOwnKeysFilter(fieldName, filter);
    else
      throw new Error("filterOwnKeys cannot apply to a non-extensible proxy");
  },

  /**
   * Assign the number of arguments to truncate a method's argument list to.
   *
   * @param fieldName {Symbol|String} The field name of the object graph handler
   *                                  the proxy uses.
   * @param proxy     {Proxy(Function)} The method needing argument truncation.
   * @param value     {Boolean|Number}
   *   - if true, limit to a function's arity.
   *   - if false, do not limit at all.
   *   - if a non-negative integer, limit to that number.
   */
  truncateArgList: function(fieldName, proxy, value) {
    this.assertLocalProxy(fieldName, proxy, "truncateArgList");
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

    let metadata = this.membrane.map.get(proxy);
    metadata.setTruncateArgList(fieldName, value);
  },

  /**
   * Disable traps for a given proxy.
   *
   * @param fieldName {String}   The name of the object graph the proxy is part
   *                             of.
   * @param proxy     {Proxy}    The proxy to affect.
   * @param trapList  {String[]} A list of proxy (Reflect) traps to disable.
   */
  disableTraps: function(fieldName, proxy, trapList) {
    this.assertLocalProxy(fieldName, proxy, "disableTraps");
    if (!Array.isArray(trapList) ||
        (trapList.some((t) => { return typeof t !== "string"; })))
      throw new Error("Trap list must be an array of strings!");
    const map = this.membrane.map.get(proxy);
    trapList.forEach(function(t) {
      if (allTraps.includes(t))
        this.setLocalFlag(fieldName, `disableTrap(${t})`, true);
    }, map);
  },

  createDistortionsListener: function() {
    return new DistortionsListener(this.membrane);
  }
});
Object.seal(ModifyRulesAPI);
function DistortionsListener(membrane) {
  // private
  Object.defineProperties(this, {
    "membrane":
      new NWNCDataDescriptor(membrane, false),
    "proxyListener":
      new NWNCDataDescriptor(this.proxyListener.bind(this), false),
    "valueAndProtoMap":
      new NWNCDataDescriptor(new Map(/*
        object or function.prototype: JSON configuration
      */), false),
  
    "instanceMap":
      new NWNCDataDescriptor(new Map(/*
        function: JSON configuration
      */), false),

    "filterToConfigMap":
      new NWNCDataDescriptor(new Map(/*
        function returning boolean: JSON configuration
      */), false),
  
    "ignorableValues":
      new NWNCDataDescriptor(new Set(), false),
  });
}

Object.defineProperties(DistortionsListener.prototype, {
  "addListener": new NWNCDataDescriptor(function(value, category, config) {
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
  }),

  "removeListener": new NWNCDataDescriptor(function(value, category) {
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
  }),

  "listenOnce": new NWNCDataDescriptor(function(meta, config) {
    this.addListener(meta.target, "value", config);
    try {
      this.proxyListener(meta);
    }
    finally {
      this.removeListener(meta.target, "value");
    }
  }),

  "sampleConfig": new NWNCDataDescriptor(function(isFunction) {
    const rv = {
      formatVersion: "0.8.2",
      dataVersion: "0.1",

      filterOwnKeys: false,
      proxyTraps: allTraps.slice(0),
      inheritFilter: false,
      storeUnknownAsLocal: false,
      requireLocalDelete: false,
      useShadowTarget: false,
    };

    if (isFunction) {
      rv.truncateArgList = false;
    }
    return rv;
  }, true),

  "bindToHandler": new NWNCDataDescriptor(function(handler) {
    if (!this.membrane.ownsHandler(handler)) {
      throw new Error("Membrane must own the first argument as an object graph handler!");
    }
    handler.addProxyListener(this.proxyListener);

    if (handler.mayReplacePassThrough)
      handler.passThroughFilter = this.passThroughFilter.bind(this);
  }, true),

  "ignorePrimordials": new NWNCDataDescriptor(function() {
    Primordials.forEach(function(p) {
      if (p)
        this.ignorableValues.add(p);
    }, this);
  }, true),

  /**
   * @private
   */
  "getConfigurationForListener": new NWNCDataDescriptor(function(meta) {
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
  }),

  "applyConfiguration": new NWNCDataDescriptor(function(config, meta) {
    const rules = this.membrane.modifyRules;
    const fieldName = meta.handler.fieldName;
    const modifyTarget = (meta.isOriginGraph) ? meta.target : meta.proxy;
    if (Array.isArray(config.filterOwnKeys)) {
      const filterOptions = {
        inheritFilter: Boolean(config.inheritFilter)
      };
      if (meta.originHandler)
        filterOptions.originHandler = meta.originHandler;
      if (meta.targetHandler)
        filterOptions.targetHandler = meta.targetHandler;
      rules.filterOwnKeys(
        fieldName,
        modifyTarget,
        config.filterOwnKeys,
        filterOptions
      );
    }

    const deadTraps = allTraps.filter(function(key) {
      return !config.proxyTraps.includes(key);
    });
    rules.disableTraps(fieldName, modifyTarget, deadTraps);

    if (config.storeUnknownAsLocal)
      rules.storeUnknownAsLocal(fieldName, modifyTarget);

    if (config.requireLocalDelete)
      rules.requireLocalDelete(fieldName, modifyTarget);

    if (("truncateArgList" in config) && (config.truncateArgList !== false))
      rules.truncateArgList(fieldName, modifyTarget, config.truncateArgList);
  }),

  /**
   * @private
   */
  "proxyListener": new NWNCDataDescriptor(function(meta) {
    const config = this.getConfigurationForListener(meta);
    this.applyConfiguration(config, meta);

    meta.stopIteration();
  }, false),

  "passThroughFilter": new NWNCDataDescriptor(function(value) {
    return this.ignorableValues.has(value);
  }, false),
});

Object.freeze(DistortionsListener.prototype);
/*
We will wrap the Membrane constructor in a Membrane, to protect the internal API
from public usage.  This is known as "eating your own dogfood" in software
engineering parlance.  Not only is it an additional proof-of-concept that the
Membrane works, but it will help ensure external consumers of the membrane
module cannot rewrite how each individual Membrane works.
*/
var Membrane = MembraneInternal;
if (true) {
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
  function voidFunc() {}

  const DogfoodLogger = {
    _errorList: [],
    error: function(e) {
      this._errorList.push(e);
    },
    warn: voidFunc,
    info: voidFunc,
    debug: voidFunc,
    trace: voidFunc,

    getFirstError: function() {
      return this._errorList.length ? this._errorList[0] : undefined;
    }
  };

  var DogfoodMembrane = (
  /* start included membrane constructor */
function buildMembrane(___utilities___) {
  "use strict";
  
  const rvMembrane = new Membrane({
    logger: (___utilities___.logger || null),
    passThroughFilter: (function() {
      const items = [];
    
      items.splice(
        0, 0,
        Membrane,
        ObjectGraphHandler,
        DistortionsListener,
        ModifyRulesAPI
      );
      
      return function(value) {
        if ((value === ProxyMapping) || 
            (value === ProxyMapping.prototype) ||
            (value instanceof ProxyMapping))
          throw new Error("ProxyMapping is private!");
        if (value === ProxyNotify)
          throw new Error("ProxyNotify is private!");
        return !items.some(function(item) {
          return (value === item) || 
                 (value === item.prototype) ||
                 (value instanceof item);
        });
      };
      {
        const s = new Set(items);
        return s.has.bind(s);
      }
    })(),
    
  });

  {
    const ___graph___ = rvMembrane.getHandlerByName("internal", { mustCreate: true });
    const ___listener___ = rvMembrane.modifyRules.createDistortionsListener();
    ___listener___.addListener(ModifyRulesAPI, "value", {
      "filterOwnKeys": [
        "arguments",
        "caller",
        "length",
        "name",
        "prototype"
      ],
      "proxyTraps": [
        "getPrototypeOf",
        "isExtensible",
        "getOwnPropertyDescriptor",
        "defineProperty",
        "has",
        "get",
        "set",
        "deleteProperty",
        "ownKeys",
        "construct"
      ],
      "inheritFilter": true,
      "storeUnknownAsLocal": true,
      "requireLocalDelete": true,
      "useShadowTarget": false,
      "truncateArgList": true
    });

    ___listener___.addListener(ModifyRulesAPI, "prototype", {
      "filterOwnKeys": [
        "getRealTarget",
        "createChainHandler",
        "replaceProxy",
        "storeUnknownAsLocal",
        "requireLocalDelete",
        "filterOwnKeys",
        "truncateArgList",
        "disableTraps",
        "createDistortionsListener"
      ],
      "proxyTraps": [
        "getPrototypeOf",
        "isExtensible",
        "getOwnPropertyDescriptor",
        "defineProperty",
        "has",
        "get",
        "set",
        "deleteProperty",
        "ownKeys",
        "apply",
        "construct"
      ],
      "inheritFilter": true,
      "storeUnknownAsLocal": true,
      "requireLocalDelete": true,
      "useShadowTarget": false
    });

    ___listener___.addListener(ModifyRulesAPI, "instance", {
      "filterOwnKeys": [
        "membrane"
      ],
      "proxyTraps": [
        "getPrototypeOf",
        "isExtensible",
        "getOwnPropertyDescriptor",
        "defineProperty",
        "has",
        "get",
        "set",
        "deleteProperty",
        "ownKeys",
        "apply",
        "construct"
      ],
      "inheritFilter": true,
      "storeUnknownAsLocal": true,
      "requireLocalDelete": true,
      "useShadowTarget": false
    });

    ___listener___.addListener(Membrane, "value", {
      "filterOwnKeys": [
        "arguments",
        "caller",
        "length",
        "name",
        "prototype",
        "Primordials"
      ],
      "proxyTraps": [
        "getPrototypeOf",
        "isExtensible",
        "getOwnPropertyDescriptor",
        "defineProperty",
        "has",
        "get",
        "set",
        "deleteProperty",
        "ownKeys",
        "construct"
      ],
      "inheritFilter": true,
      "storeUnknownAsLocal": true,
      "requireLocalDelete": true,
      "useShadowTarget": false,
      "truncateArgList": true
    });

    ___listener___.addListener(Membrane, "prototype", {
      "filterOwnKeys": [
        "allTraps",
        "hasProxyForValue",
        "getMembraneValue",
        "getMembraneProxy",
        "hasHandlerByField",
        "getHandlerByName",
        "ownsHandler",
        "wrapArgumentByProxyMapping",
        "convertArgumentToProxy",
        "bindValuesByHandlers",
        "addFunctionListener",
        "removeFunctionListener",
        "secured",
        "warnOnce",
        "constants"
      ],
      "proxyTraps": [
        "getPrototypeOf",
        "isExtensible",
        "getOwnPropertyDescriptor",
        "defineProperty",
        "has",
        "get",
        "set",
        "deleteProperty",
        "ownKeys",
        "apply",
        "construct"
      ],
      "inheritFilter": true,
      "storeUnknownAsLocal": true,
      "requireLocalDelete": true,
      "useShadowTarget": false
    });

    ___listener___.addListener(Membrane, "instance", {
      "filterOwnKeys": [
        "modifyRules"
      ],
      "proxyTraps": [
        "getPrototypeOf",
        "isExtensible",
        "getOwnPropertyDescriptor",
        "defineProperty",
        "has",
        "get",
        "set",
        "deleteProperty",
        "ownKeys",
        "apply",
        "construct"
      ],
      "inheritFilter": true,
      "storeUnknownAsLocal": true,
      "requireLocalDelete": true,
      "useShadowTarget": false
    });

    ___listener___.addListener(ObjectGraphHandler, "value", {
      "filterOwnKeys": [
        "arguments",
        "caller",
        "length",
        "name",
        "prototype"
      ],
      "proxyTraps": [
        "getPrototypeOf",
        "isExtensible",
        "getOwnPropertyDescriptor",
        "defineProperty",
        "has",
        "get",
        "set",
        "deleteProperty",
        "ownKeys",
        "construct"
      ],
      "inheritFilter": true,
      "storeUnknownAsLocal": true,
      "requireLocalDelete": true,
      "useShadowTarget": false,
      "truncateArgList": true
    });

    ___listener___.addListener(ObjectGraphHandler, "prototype", {
      "filterOwnKeys": [
        "ownKeys",
        "has",
        "get",
        "getOwnPropertyDescriptor",
        "getPrototypeOf",
        "isExtensible",
        "preventExtensions",
        "deleteProperty",
        "defineProperty",
        "set",
        "setPrototypeOf",
        "apply",
        "construct",
        "addProxyListener",
        "removeProxyListener",
        "addFunctionListener",
        "removeFunctionListener"
      ],
      "proxyTraps": [
        "getPrototypeOf",
        "isExtensible",
        "getOwnPropertyDescriptor",
        "defineProperty",
        "has",
        "get",
        "set",
        "deleteProperty",
        "ownKeys",
        "apply",
        "construct"
      ],
      "inheritFilter": true,
      "storeUnknownAsLocal": true,
      "requireLocalDelete": true,
      "useShadowTarget": false
    });

    ___listener___.addListener(ObjectGraphHandler, "instance", {
      "filterOwnKeys": [],
      "proxyTraps": [
        "getPrototypeOf",
        "isExtensible",
        "getOwnPropertyDescriptor",
        "defineProperty",
        "has",
        "get",
        "set",
        "deleteProperty",
        "ownKeys",
        "apply",
        "construct"
      ],
      "inheritFilter": true,
      "storeUnknownAsLocal": true,
      "requireLocalDelete": true,
      "useShadowTarget": false
    });

    ___listener___.addListener(
      [
        ModifyRulesAPI.prototype.getRealTarget,
        ModifyRulesAPI.prototype.createChainHandler,
        ModifyRulesAPI.prototype.replaceProxy,
        ModifyRulesAPI.prototype.storeUnknownAsLocal,
        ModifyRulesAPI.prototype.requireLocalDelete,
        ModifyRulesAPI.prototype.filterOwnKeys,
        ModifyRulesAPI.prototype.truncateArgList,
        ModifyRulesAPI.prototype.disableTraps,
        ModifyRulesAPI.prototype.createDistortionsListener,
        Membrane.prototype.hasProxyForValue,
        Membrane.prototype.getMembraneValue,
        Membrane.prototype.getMembraneProxy,
        Membrane.prototype.hasHandlerByField,
        Membrane.prototype.getHandlerByName,
        Membrane.prototype.ownsHandler,
        Membrane.prototype.wrapArgumentByProxyMapping,
        Membrane.prototype.convertArgumentToProxy,
        Membrane.prototype.bindValuesByHandlers,
        Membrane.prototype.addFunctionListener,
        Membrane.prototype.removeFunctionListener,
        Membrane.prototype.warnOnce,
        ObjectGraphHandler.prototype.ownKeys,
        ObjectGraphHandler.prototype.has,
        ObjectGraphHandler.prototype.get,
        ObjectGraphHandler.prototype.getOwnPropertyDescriptor,
        ObjectGraphHandler.prototype.getPrototypeOf,
        ObjectGraphHandler.prototype.isExtensible,
        ObjectGraphHandler.prototype.preventExtensions,
        ObjectGraphHandler.prototype.deleteProperty,
        ObjectGraphHandler.prototype.defineProperty,
        ObjectGraphHandler.prototype.set,
        ObjectGraphHandler.prototype.setPrototypeOf,
        ObjectGraphHandler.prototype.apply,
        ObjectGraphHandler.prototype.construct,
        ObjectGraphHandler.prototype.addProxyListener,
        ObjectGraphHandler.prototype.removeProxyListener,
        ObjectGraphHandler.prototype.addFunctionListener,
        ObjectGraphHandler.prototype.removeFunctionListener,
        DistortionsListener.prototype.addListener,
        DistortionsListener.prototype.removeListener,
        DistortionsListener.prototype.listenOnce,
        DistortionsListener.prototype.sampleConfig,
        DistortionsListener.prototype.bindToHandler,
        DistortionsListener.prototype.ignorePrimordials,
        DistortionsListener.prototype.applyConfiguration
      ],
      "iterable",
      {
        "filterOwnKeys": null,
        "proxyTraps": [
          "getPrototypeOf",
          "isExtensible",
          "getOwnPropertyDescriptor",
          "defineProperty",
          "has",
          "get",
          "set",
          "deleteProperty",
          "ownKeys",
          "apply"
        ],
        "inheritFilter": true,
        "storeUnknownAsLocal": true,
        "requireLocalDelete": true,
        "useShadowTarget": false
      }
    );

    ___listener___.addListener(DistortionsListener, "value", {
      "filterOwnKeys": [
        "arguments",
        "caller",
        "length",
        "name",
        "prototype"
      ],
      "proxyTraps": [
        "getPrototypeOf",
        "isExtensible",
        "getOwnPropertyDescriptor",
        "defineProperty",
        "has",
        "get",
        "set",
        "deleteProperty",
        "ownKeys",
        "construct"
      ],
      "inheritFilter": true,
      "storeUnknownAsLocal": true,
      "requireLocalDelete": true,
      "useShadowTarget": false,
      "truncateArgList": true
    });

    ___listener___.addListener(DistortionsListener, "prototype", {
      "filterOwnKeys": [
        "addListener",
        "removeListener",
        "listenOnce",
        "sampleConfig",
        "bindToHandler",
        "ignorePrimordials",
        "applyConfiguration"
      ],
      "proxyTraps": [
        "getPrototypeOf",
        "isExtensible",
        "getOwnPropertyDescriptor",
        "defineProperty",
        "has",
        "get",
        "set",
        "deleteProperty",
        "ownKeys",
        "apply",
        "construct"
      ],
      "inheritFilter": true,
      "storeUnknownAsLocal": true,
      "requireLocalDelete": true,
      "useShadowTarget": false
    });

    ___listener___.addListener(DistortionsListener, "instance", {
      "filterOwnKeys": [],
      "proxyTraps": [
        "getPrototypeOf",
        "isExtensible",
        "getOwnPropertyDescriptor",
        "defineProperty",
        "has",
        "get",
        "set",
        "deleteProperty",
        "ownKeys",
        "apply",
        "construct"
      ],
      "inheritFilter": true,
      "storeUnknownAsLocal": true,
      "requireLocalDelete": true,
      "useShadowTarget": false
    });

    ___listener___.bindToHandler(___graph___);
  }

  {
    rvMembrane.getHandlerByName("public", { mustCreate: true });
  }

  return rvMembrane;
}
  /* end included membrane constructor */
  )({logger: DogfoodLogger});

  DogfoodMembrane.ProxyToMembraneMap = new WeakSet();

  let publicAPI   = DogfoodMembrane.getHandlerByName("public", { mustCreate: true });
  let internalAPI = DogfoodMembrane.getHandlerByName("internal", { mustCreate: true });

  // lockdown of the public API here

  // Define our Membrane constructor properly.
  Membrane = DogfoodMembrane.convertArgumentToProxy(
    internalAPI, publicAPI, MembraneInternal
  );
  /* XXX ajvincent Membrane.prototype should return an object with descriptor
   * "secured": new DataDescriptor(true, false, false, false)
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

  const firstError = DogfoodLogger.getFirstError();
  if (firstError) {
    Membrane = function() {
      throw new Error("Membrane constructor could not be exported");
    };
    throw firstError;
  }
}

MembraneInternal = null;
module.exports.Membrane = Membrane;
