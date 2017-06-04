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
