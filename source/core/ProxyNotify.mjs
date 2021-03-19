import {
  AccessorDescriptor,
  DataDescriptor,
  assert,
  makeRevokeDeleteRefs,
  getRealTarget,
} from "./sharedUtilities.mjs";

import {
  ProxyCylinder
} from "./ProxyCylinder.mjs";

/**
 * Notify all proxy listeners of a new proxy.
 *
 * @param {GraphMetadata}      parts     The graph metadata from a ProxyCylinder.
 * @param {ObjectGraphHandler} handler   The handler for the proxy.
 * @param {Boolean}            isOrigin  True if the handler is the origin graph handler.
 * @param {Object}             options   Special options to pass on to the listeners.
 *
 * @package
 * @deprecated
 */
export function ProxyNotify(parts, handler, isOrigin, options) {
  if (typeof options === "undefined")
    options = {};

  // private variables
  const listeners = handler.__proxyListeners__;
  if (listeners.length === 0)
    return;

  // the actual metadata object for the listener
  var meta = Object.create(options, {
    /**
     * The proxy or value the Membrane will return to the caller.
     *
     * @note If you set this property with a non-proxy value, the value will NOT
     * be protected by the membrane.
     *
     * If you wish to replace the proxy with another Membrane-based proxy,
     * this is no longer supported.
     */
    "proxy": new AccessorDescriptor(
      () => parts.proxy,

      // @deprecated
      (val) => { if (!meta.stopped) parts.proxy = val; }
    ),

    /* XXX ajvincent revoke is explicitly NOT exposed, lest a listener call it 
     * and cause chaos for any new proxy trying to rely on the existing one.  If
     * you really have a problem, use throwException() below.
     */

    /**
     * The unwrapped object or function we're building the proxy for.
     */
    "target": new DataDescriptor(getRealTarget(parts.shadowTarget)),

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
  const inConstruction = handler.proxiesInConstruction;
  const realTarget = parts.shadowTarget ? getRealTarget(parts.shadowTarget) : parts.value;
  inConstruction.set(realTarget, callbacks);

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

    inConstruction.delete(realTarget);
  }
}

ProxyNotify.useShadowTarget = function(parts, handler, mode) {
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

  const cylinderMap = handler.membrane.cylinderMap;
  const cylinder = cylinderMap.get(parts.value);
  assert(cylinder instanceof ProxyCylinder,
         "Didn't get a ProxyCylinder for an existing value?");
  cylinderMap.set(parts.proxy, cylinder);
  makeRevokeDeleteRefs(parts, cylinder, handler.graphName);
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
