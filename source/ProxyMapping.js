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
