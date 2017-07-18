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
    "proxy": new AccessorDescriptor(
      () => parts.proxy,
      (val) => { if (!stopped) parts.proxy = val; }
    ),

    /* XXX ajvincent revoke is explicitly NOT exposed, lest a listener call it 
     * and cause chaos for any new proxy trying to rely on the existing one.  If
     * you really have a problem, use throwException() below.
     */

    /**
     * The unwrapped object or function we're building the proxy for.
     */
    "target": new DataDescriptor(parts.value),

    /**
     * The proxy handler.  This should be an ObjectGraphHandler.
     */
    "handler": new AccessorDescriptor(
      () => handler,
      (val) => { if (!stopped) handler = val; }
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
        if (!stopped)
          parts.proxy = modifyRules.replaceProxy(parts.proxy, this.handler);
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
      function(mode) {
        let newHandler = {};

        if (mode === "frozen")
          Object.freeze(parts.proxy);
        else if (mode === "sealed")
          Object.seal(parts.proxy);
        else if (mode === "prepared") {
          const keys = Reflect.ownKeys(parts.proxy);
          keys.forEach(function(key) {
            handler.defineLazyGetter(parts.value, parts.shadowTarget, key);
          });

          // Lazy getPrototypeOf, setPrototypeOf.
          newHandler.getPrototypeOf = function(st) {
            var proto = handler.getPrototypeOf.apply(handler, [st]);
            this.setPrototypeOf(st, proto);
            return proto;
          };
          newHandler.setPrototypeOf = function(st, proto) {
            var rv = handler.setPrototypeOf.apply(handler, [st, proto]);
            delete newHandler.getPrototypeOf;
            delete newHandler.setPrototypeOf;
            return rv;
          };
        }
        else {
          throw new Error("useShadowTarget requires its first argument be 'frozen', 'sealed', or 'prepared'");
        }

        stopped = true;
        if (typeof parts.shadowTarget == "function") {
          newHandler.apply     = handler.apply.bind(handler);
          newHandler.construct = handler.construct.bind(handler);
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
      }
    ),

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
