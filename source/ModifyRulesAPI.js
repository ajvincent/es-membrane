const ChainHandlers = new WeakSet();

// XXX ajvincent These rules are examples of what DogfoodMembrane should set.
const ChainHandlerProtection = Object.create(Reflect, {
  /**
   * Return true if a property should not be deleted or redefined.
   */
  "isProtectedName": new DataDescriptor(function(chainHandler, propName) {
    let rv = ["nextHandler", "baseHandler"];
    if (chainHandler !== Reflect)
      rv = rv.concat(Reflect.ownKeys(chainHandler.baseHandler));
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
        throw new Error("fieldName must be a string representing an ObjectGraphName in the Membrane, or null to represent Reflect");

      baseHandler = this.membrane.getHandlerByField(existingHandler.fieldName);
      description = "our membrane's " + baseHandler.fieldName + " ObjectGraphHandler";
    }

    else if (baseHandler !== Reflect) {
      throw new Error("fieldName must be a string representing an ObjectGraphName in the Membrane, or null to represent Reflect");
    }

    if ((baseHandler !== existingHandler) && !ChainHandlers.has(existingHandler)) {
      throw new Error("Existing handler neither is " + description + " nor inherits from it");
    }

    var rv = Object.create(existingHandler, {
      "nextHandler": new DataDescriptor(existingHandler, false, false, false),
      "baseHandler": new DataDescriptor(baseHandler, false, false, false)
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
        let ownedHandler = this.membrane.getHandlerByField(fieldName, false);
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
    }
    cachedProxy = map.getProxy(baseHandler.fieldName);      
    
    if (cachedProxy != oldProxy)
      throw new Error("You cannot replace the proxy with a handler from a different object graph!");

    // Finally, do the actual proxy replacement.
    let original = map.getOriginal();
    let parts = Proxy.revocable(original, handler);
    parts.value = original;
    parts.override = true;
    //parts.extendedHandler = handler;
    map.set(this.membrane, cachedField, parts);

    let gHandler = this.membrane.getHandlerByField(cachedField);
    gHandler.addRevocable(map.originField === cachedField ? mapping : parts.revoke);
    return parts.proxy;
  },

  /*
  overrideTrap: function(value, graphName, trapName, newTrap) {
    
  },
  */
});
Object.seal(ModifyRulesAPI);
