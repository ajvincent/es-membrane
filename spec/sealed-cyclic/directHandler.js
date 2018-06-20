it(
  "A sealed cyclic reference requires an accessor descriptor when the proxy handler is direct",
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
      parts = Proxy.revocable(shadowTarget, handler);
      parts.value = value;
    }

    parts.shadowTarget = shadowTarget;
    mapping.set(this, handler.fieldName, parts);
    makeRevokeDeleteRefs(parts, mapping, handler.fieldName);

    if (!isOriginal && ([a, b].includes(parts.value))) {
      const callbacks = [];
      const inConstruction = handler.proxiesInConstruction;
      inConstruction.set(parts.value, callbacks);
    
      Object.seal(parts.proxy);
    
      parts.proxy = new Proxy(parts.shadowTarget, Reflect);
      const masterMap = membrane.map;
      let map = masterMap.get(parts.value);
      masterMap.set(parts.proxy, map);
    
      callbacks.forEach(function(c) {
        try {
          c(parts.proxy);
        }
        catch (e) {
          // do nothing
        }
      });
    
      inConstruction.delete(parts.value);

      if (!Reflect.isExtensible(value)) {
        try {
          Reflect.preventExtensions(parts.proxy);
        }
        catch (e) {
          // do nothing
        }
      }
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
      this.handlersByFieldName[field] = new ObjectGraphHandler(this, field);
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
    var target = getRealTarget(shadowTarget);
    var targetMap = membrane.map.get(target);
    var _this = targetMap.getOriginal();

    if (!Reflect.isExtensible(shadowTarget))
      return true;

    // This is our one and only chance to set properties on the shadow target.
    var rv = this.lockShadowTarget(shadowTarget);

    rv = Reflect.preventExtensions(_this);
    return rv;
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
      this.defineLazyGetter(_this, shadowTarget, propName);

      // We want to trigger the lazy getter so that the property can be sealed.
      void(Reflect.get(shadowTarget, propName));
    }, this);

    // fix the prototype;
    const proto = this.getPrototypeOf(shadowTarget);
    Reflect.setPrototypeOf(shadowTarget, proto);
    Reflect.preventExtensions(shadowTarget);
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

    if (membrane.showGraphName && !rv.includes("membraneGraphName")) {
      rv.push("membraneGraphName");
    }

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

  /**
   * Define a "lazy" accessor descriptor which replaces itself with a direct
   * property descriptor when needed.
   *
   * @param source       {Object} The source object holding a property.
   * @param shadowTarget {Object} The shadow target for a proxy.
   * @param propName     {String|Symbol} The name of the property to copy.
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

      /*
        See top of defineLazyGetter.  Disabling this code means we fail the
        property lookup, when A and B should be sealed.
        A.next.next === undefined
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

        const target = getRealTarget(shadowTarget);
        const targetMap = handler.membrane.map.get(target);

        // sourceDesc is the descriptor we really want
        let sourceDesc = (
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

            /*
              Disabling this code means we fail the identity property,
              when A and B should be sealed.
              A.next.next !== A
            */

            handler.proxiesInConstruction.get(unwrapped).push(setLockedValue);
            sourceDesc = lazyDesc;
            delete sourceDesc.set;
            lockState = "transient";
          }
        }

        Reflect.deleteProperty(shadowTarget, propName);
        Reflect.defineProperty(this, propName, sourceDesc);

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

        Reflect.deleteProperty(shadowTarget, propName);
        Reflect.defineProperty(this, propName, desc);

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

    Reflect.defineProperty(shadowTarget, propName, lazyDesc);
  }
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

    expect(A.child.parent === A).toBe(true);
    expect(B.parent.child === B).toBe(true);
  
    /* XXX ajvincent Ideally, the accessor count would be zero.  Currently,
     * it's one for sealed cyclic references.  See
     * ObjectGraphHandler.prototype.defineLazyGetter for details.
     */
    let accessorCount = 0;
    if (isAccessorDescriptor(Reflect.getOwnPropertyDescriptor(A, "child")))
      accessorCount++;
    if (isAccessorDescriptor(Reflect.getOwnPropertyDescriptor(B, "parent")))
      accessorCount++;
  
    expect(accessorCount).toBe(1);
  }
);
