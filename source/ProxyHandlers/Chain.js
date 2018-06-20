function ChainObjectGraphHandler(existingHandler, baseHandler, membrane)
{
  Reflect.setPrototypeOf(this, existingHandler);
  Reflect.defineProperty(
    this, "nextHandler", new NWNCDataDescriptor(existingHandler)
  );
  Reflect.defineProperty(
    this, "baseHandler", new NWNCDataDescriptor(baseHandler)
  );
  Reflect.defineProperty(
    this, "membrane", new NWNCDataDescriptor(membrane)
  );
  return new Proxy(this, ChainHandlerProtection);
}

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
