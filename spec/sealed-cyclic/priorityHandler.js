it(
  "A sealed cyclic reference can use a priority queue to ensure no accessor descriptors",
  function() {

function DataDescriptor(value, writable = false, enumerable = true, configurable = true) {
  this.value = value;
  this.writable = writable;
  this.enumerable = enumerable;
  this.configurable = configurable;
}

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

function valueType(value) {
  if (value === null)
    return "primitive";
  const type = typeof value;
  if ((type != "function") && (type != "object"))
    return "primitive";
  return type;
}

var ShadowKeyMap = new WeakMap();

function makeShadowTarget(value) {
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
 * A simple priority queue.
 *
 * @constructor
 * @params levels {Array} of strings and symbols, representing the priorities.
 */
function PriorityQueue(levels)
{
  if (!Array.isArray(levels) || (levels.length == 0))
    throw new Error("levels must be a non-empty array of strings and symbols");
  if (levels.some(function(l) {
    return (typeof l !== "string") && (typeof l !== "symbol");
  }))
    throw new Error("levels must be a non-empty array of strings and symbols");
  const levelSet = new Set(levels);
  if (levelSet.size != levels.length)
    throw new Error("levels must have no duplicates");

  this.levels = Array.from(levels);
  Object.freeze(this.levels);
  this.levelMap = new Map();
  this.levels.forEach((l) => this.levelMap.set(l, []));
  Object.freeze(this.levelMap);
  Object.freeze(this);
}

PriorityQueue.prototype.append = function(level, callback)
{
  if (!this.levels.includes(level))
    throw new Error("Unknown level");
  if (typeof callback !== "function")
    throw new Error("callback must be a function");

  this.levelMap.get(level).push(callback);
};

PriorityQueue.prototype.next = function()
{
  const arrays = Array.from(this.levelMap.values());
  const firstArray = arrays.find((array) => array.length > 0);
  if (!firstArray)
    return false;

  try
  {
    firstArray.shift()();
  }
  catch (e)
  {
    arrays.forEach((array) => array.length = 0);
    throw e;
  }
  return true;
};

function PriorityQueueProxyHandler(nextHandler) {
  this.nextHandler = nextHandler;
}

PriorityQueueProxyHandler.prototype.appendFirstCall = function(
  trapName, argList
)
{
  const handler = this.nextHandler;
  handler.membrane.priorityQueue.append(
    "firstCall", function() {
      if (trapName in handler)
        handler[trapName].apply(handler, argList);
      else
        Reflect[trapName].apply(Reflect, argList);
    }
  );
};

allTraps.forEach(function(trapName) {
  PriorityQueueProxyHandler.prototype[trapName] = function() {
    this.appendFirstCall(trapName, arguments);
    const queue = this.nextHandler.membrane.priorityQueue;
    while (queue.next())
    {
      // do nothing
    }

    return Reflect[trapName].apply(Reflect, arguments);
  };
});


/* Reference:  http://soft.vub.ac.be/~tvcutsem/invokedynamic/js-membranes
 * Definitions:
 * Object graph: A collection of values that talk to each other directly.
 */

const membrane = {
  map: new WeakMap(/*
    key: ProxyMapping instance

    key may be a Proxy, a value associated with a proxy, or an original value.
  */),
  handlersByFieldName: {},

  priorityQueue: new PriorityQueue(["firstCall", "lazyGetter", "seal"]),
  priorityHandlers: new WeakMap(/*
    ObjectGraphHandler: PriorityQueueProxyHandler
  */),

  /**
   * Returns true if we have a proxy for the value.
   */
  hasProxyForValue: function(field, value) {
    var mapping = this.map.get(value);
    return Boolean(mapping) && mapping.hasField(field);
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
    let mapping = ("mapping" in options) ? options.mapping : null;

    if (!mapping) {
      if (this.map.has(value)) {
        mapping = this.map.get(value);
      }
  
      else {
        mapping = new ProxyMapping(handler.fieldName);
      }
    }

    const isOriginal = (mapping.originField === handler.fieldName);
    let shadowTarget = makeShadowTarget(value);

    var parts;
    if (isOriginal) {
      parts = { value: value };
    }
    else {
      const priority = this.priorityHandlers.get(handler);
      parts = Proxy.revocable(shadowTarget, priority);
      parts.value = value;
    }

    parts.shadowTarget = shadowTarget;
    mapping.set(this, handler.fieldName, parts);
    makeRevokeDeleteRefs(parts, mapping, handler.fieldName);

    if (!isOriginal && ([a, b].includes(parts.value))) {
      this.priorityQueue.append("seal", function() {
        Object.seal(parts.proxy);
      });
    }

    return mapping;
  },

  hasHandlerByField: function(field) {
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
    let mustCreate = (typeof options == "object") ?
                     Boolean(options.mustCreate) :
                     false;
    if (mustCreate && !this.hasHandlerByField(field))
    {
      const handler = new ObjectGraphHandler(this, field);
      this.handlersByFieldName[field] = handler;

      const priority = new PriorityQueueProxyHandler(handler);
      this.priorityHandlers.set(handler, priority);
    }
    return this.handlersByFieldName[field];
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
    if (valueType(arg) === "primitive") {
      return arg;
    }

    if (!this.hasProxyForValue(originHandler.fieldName, arg)) {
      this.buildMapping(originHandler, arg, options);
    }
    
    if (!this.hasProxyForValue(targetHandler.fieldName, arg)) {
      let argMap = this.map.get(arg);
      options.originHandler = originHandler;
      options.mapping = argMap;
      this.buildMapping(targetHandler, arg, options);
    }

    var [found, rv] = this.getMembraneProxy(
      targetHandler.fieldName, arg
    );
    void(found);
    return rv;
  },

  /**
   * Wrap the methods of a descriptor in an object graph.
   *
   * This method should NOT be exposed to the public.
   */
  wrapDescriptor: function(originField, targetField, desc) {
    var wrappedDesc = {
      configurable: Boolean(desc.configurable),
      enumerable: Boolean(desc.enumerable),
      writable: Boolean(desc.writable)
    };

    var originHandler = this.getHandlerByName(originField);
    var targetHandler = this.getHandlerByName(targetField);
    wrappedDesc.value = this.convertArgumentToProxy(
      originHandler,
      targetHandler,
      desc.value
    );

    return wrappedDesc;
  }
};

/* A proxy handler designed to return only primitives and objects in a given
 * object graph, defined by the fieldName.
 */
function ObjectGraphHandler(membrane, fieldName) {
  // private
  Object.defineProperties(this, {
    "membrane": new DataDescriptor(membrane, false),
    "fieldName": new DataDescriptor(fieldName, false),

    // see .defineLazyGetter, ProxyNotify for details.
    "proxiesInConstruction": new DataDescriptor(
      new WeakMap(/* original value: [callback() {}, ...]*/), false
    ),

    "__proxyListeners__": new DataDescriptor([], false),
  });
}

ObjectGraphHandler.prototype = Object.seal({
  // ProxyHandler
  ownKeys: function(shadowTarget) {
    return this.setOwnKeys(shadowTarget);
  },

  // ProxyHandler
  get: function(shadowTarget, propName, receiver) {
    var desc, found, rv;
    desc = Reflect.getOwnPropertyDescriptor(shadowTarget, propName);

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
      var getter = desc.get;

      let type = typeof getter;
      if (type === "undefined")
        return undefined;
      rv = Reflect.apply(getter, receiver, []);
      found = true;
    }

    return rv;
  },

  // ProxyHandler
  getPrototypeOf: function(shadowTarget) {
    const target = getRealTarget(shadowTarget);
    const targetMap = membrane.map.get(target);

    const proto = Reflect.getPrototypeOf(target);
    if (targetMap.originField !== this.fieldName)
      return membrane.convertArgumentToProxy(
        membrane.getHandlerByName(targetMap.originField),
        this,
        proto
      );
    return proto;
  },

  // ProxyHandler
  preventExtensions: function(shadowTarget) {
    if (!Reflect.isExtensible(shadowTarget))
      return true;

    // This is our one and only chance to set properties on the shadow target.
    this.lockShadowTarget(shadowTarget);

    membrane.priorityQueue.append("seal", function() {
      Reflect.preventExtensions(shadowTarget);
    });
    return true;
  },

  /**
   * Get the shadow target associated with a real value.
   *
   * @private
   */
  getShadowTarget: function(target) {
    let targetMap = membrane.map.get(target);
    return targetMap.getShadowTarget(this.fieldName);
  },
  
  /**
   * Set all properties on a shadow target, including prototype, and seal it.
   *
   * @private
   */
  lockShadowTarget: function(shadowTarget) {
    const target = getRealTarget(shadowTarget);
    const targetMap = membrane.map.get(target);
    const _this = targetMap.getOriginal();
    const keys = this.setOwnKeys(shadowTarget);
    keys.forEach(function(propName) {
      let desc = Reflect.getOwnPropertyDescriptor(_this, propName);
      const configurable = desc.configurable;
      desc.configurable = true;
      desc = membrane.wrapDescriptor(
        targetMap.originField, this.fieldName, desc
      );
      desc.configurable = configurable;
      Reflect.defineProperty(shadowTarget, propName, desc);
    }, this);

    // fix the prototype;
    const proto = this.getPrototypeOf(shadowTarget);
    Reflect.setPrototypeOf(shadowTarget, proto);

    this.membrane.priorityQueue.append("seal", function() {
      Reflect.preventExtensions(shadowTarget);
    });
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
    var targetMap = membrane.map.get(target);
    var _this = targetMap.getOriginal();

    // First, get the underlying object's key list, forming a base.
    var rv = Reflect.ownKeys(_this);

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
    }
    return rv;
  },
});

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
}

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

  "getShadowTarget": new DataDescriptor(function(field) {
    return this.proxiedFields[field].shadowTarget;
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
    this.proxiedFields[field] = parts;

    if (this.originalValue === NOT_YET_DETERMINED) {
      this.originalValue = parts.value;
      delete parts.proxy;
      delete parts.revoke;
    }
  
    if (!membrane.map.has(parts.value)) {
      if (valueType(parts.value) !== "primitive")
        membrane.map.set(parts.value, this);
    }
  })
});

  var wetHandler, dryHandler;

    wetHandler = membrane.getHandlerByName("wet", { mustCreate: true });
    dryHandler = membrane.getHandlerByName("dry", { mustCreate: true });
    var a, A, b, B;
  
    // Cyclic object references
    a = { objName: "a" };
    b = { objName: "b" };
    a.child = b;
    b.parent = a;
  
    A = membrane.convertArgumentToProxy(
      wetHandler,
      dryHandler,
      a
    );
    B = membrane.convertArgumentToProxy(
      wetHandler,
      dryHandler,
      b
    );

    expect(Object.isSealed(A)).toBe(true);
    expect(Object.isSealed(B)).toBe(true);

    const Achild = A.child;
    const Bparent = B.parent;

    expect(Achild.parent === A).toBe(true);
    expect(Bparent.child === B).toBe(true);
  
    /* XXX ajvincent Ideally, the accessor count would be zero.  Currently,
     * it's one for sealed cyclic references.  See
     * ObjectGraphHandler.prototype.defineLazyGetter for details.
     */
    let accessorCount = 0;
    if (isAccessorDescriptor(Reflect.getOwnPropertyDescriptor(A, "child")))
      accessorCount++;
    if (isAccessorDescriptor(Reflect.getOwnPropertyDescriptor(B, "parent")))
      accessorCount++;
  
    expect(accessorCount).toBe(0);
  }
);
