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
   * Convert a shadow target to a real proxy target.
   *
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
