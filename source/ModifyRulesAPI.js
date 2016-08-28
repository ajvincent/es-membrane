const ChainHandlers = new WeakSet();

// XXX ajvincent These rules are examples of what DogfoodMembrane should set.
const ChainHandlerProtection = Object.create(Reflect, {
  "isProtectedName": new DataDescriptor(function(target, propName) {
    let rv = ["nextHandler", "baseHandler"];
    if (target !== Reflect)
      rv = rv.concat(Reflect.ownKeys(target.baseHandler));
    return rv.includes(propName);
  }, false, false, false),
  
  "setPrototypeOf": new DataDescriptor(function() {
    return false;
  }, false, false, false),

  "deleteProperty": new DataDescriptor(function(target, propName) {
    if (this.isProtectedName(target, propName))
      return false;
    return Reflect.deleteProperty(target, propName);
  }, false, false, false),

  "defineProperty": new DataDescriptor(function(target, propName, desc) {
    if (this.isProtectedName(target, propName))
      return false;
    return Reflect.defineProperty(target, propName, desc);
  }, false, false, false)
});

function ModifyRulesAPI(membrane) {
  Object.defineProperty(this, "membrane", {
    value: membrane,
    writable: false,
    enumerable: false,
    configurable: false
  });
}
ModifyRulesAPI.prototype = Object.seal({
  createChainHandler: function(existingHandler) {
    let baseHandler = Reflect, description = "Reflect";
    if (existingHandler instanceof ObjectGraphHandler) {
      if (!this.membrane.ownsHandler(existingHandler)) 
        throw new Error("fieldName must be a string representing an ObjectGraphName in the Membrane, or null to represent Reflect");
      baseHandler = this.membrane.getHandlerByField(existingHandler.fieldName);
      description = "our membrane's " + baseHandler.fieldName + " ObjectGraphHandler";
    }
    else if (existingHandler !== null) {
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
        accepted = (this.membrane.hasHandlerByField(fieldName) &&
                    (this.membrane.getHandlerByField(fieldName) === baseHandler));
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
