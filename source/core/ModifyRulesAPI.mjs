/** @module source/core/ModifyRulesAPI */

/**
 * @fileoverview
 *
 * The Membrane implementation represents a perfect mirroring of objects and
 * properties from one object graph to another... until the code creating the
 * membrane invokes methods of membrane.modifyRules.  Then, through either
 * methods on ProxyCylinder or new proxy traps, the membrane will be able to use
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
 *     directly, use ProxyCylinder objects to store properties which determine
 *     the rules, as opposed to new proxy traps.
 *   * Define new methods on ProxyCylinder.prototype for storing or retrieving
 *     the properties.
 *   * Internally, the new methods should store properties on
 *     this.proxiedGraphs[graphName].
 *   * Modify the existing ProxyHandler traps in ObjectGraphHandler.prototype
 *     to call the ProxyCylinder methods, in order to implement the new behavior.
 */

import {
  NWNCDataDescriptor,
  allTraps,
} from "./sharedUtilities.mjs";

import DistortionsListener from "./DistortionsListener.mjs";

export default class ModifyRulesAPI {
  constructor(membrane) {
    // private
    Object.defineProperty(this, "membrane", new NWNCDataDescriptor(membrane, false));
    Object.seal(this);
  }

  /**
   * Ensure that the proxy passed in matches the object graph handler.
   *
   * @param graphName  {Symbol|String} The handler's graph name.
   * @param proxy      {Proxy}  The value to look up.
   * @param methodName {String} The calling function's name.
   * 
   * @private
   */
  assertLocalProxy(graphName, proxy, methodName) {
    let [found, match] = this.membrane.getMembraneProxy(graphName, proxy);
    if (!found || (proxy !== match)) {
      throw new Error(methodName + " requires a known proxy!");
    }
  }

  /**
   * Require that new properties be stored via the proxies instead of propagated
   * through to the underlying object.
   *
   * @param graphName {Symbol|String} The graph name of the object graph handler
   *                                  the proxy uses.
   * @param proxy     {Proxy}  The proxy (or underlying object) needing local
   *                           property protection.
   */
  storeUnknownAsLocal(graphName, proxy) {
    this.assertLocalProxy(graphName, proxy, "storeUnknownAsLocal");

    let cylinder = this.membrane.cylinderMap.get(proxy);
    cylinder.setLocalFlag(graphName, "storeUnknownAsLocal", true);
  }

  /**
   * Require that properties be deleted only on the proxy instead of propagated
   * through to the underlying object.
   *
   * @param graphName {Symbol|String} The graph name of the object graph handler
   *                                  the proxy uses.
   * @param proxy     {Proxy}  The proxy (or underlying object) needing local
   *                           property protection.
   */
  requireLocalDelete(graphName, proxy) {
    this.assertLocalProxy(graphName, proxy, "requireLocalDelete");

    let cylinder = this.membrane.cylinderMap.get(proxy);
    cylinder.setLocalFlag(graphName, "requireLocalDelete", true);
  }

  /**
   * Apply a filter to the original list of own property names from an
   * underlying object.
   *
   * @note Local properties and local delete operations of a proxy are NOT
   * affected by the filters.
   *
   * @param graphName {Symbol|String} The graph name of the object graph handler
   *                                  the proxy uses.
   * @param proxy     {Proxy}    The proxy (or underlying object) needing local
   *                             property protection.
   * @param filter    {Function} The filtering function.  (May be an Array or
   *                             a Set, which becomes a whitelist filter.)
   * @see Array.prototype.filter.
   */
  filterOwnKeys(graphName, proxy, filter) {
    this.assertLocalProxy(graphName, proxy, "filterOwnKeys");

    if (Array.isArray(filter)) {
      filter = new Set(filter);
    }

    if (filter instanceof Set) {
      const s = filter;
      filter = (key) => s.has(key);
    }

    if ((typeof filter !== "function") && (filter !== null))
      throw new Error("filter must be a function, array or Set!");

    /* Defining a filter after a proxy's shadow target is not extensible
     * guarantees inconsistency.  So we must disallow that possibility.
     *
     * Note that if the proxy becomes not extensible after setting a filter,
     * that's all right.  When the proxy becomes not extensible, it then sets
     * all the proxies of the shadow target before making the shadow target not
     * extensible.
     */
    let cylinder = this.membrane.cylinderMap.get(proxy);
    let graphsToCheck;
    if (cylinder.originGraph === graphName)
    {
      graphsToCheck = Array.from(cylinder.proxyDataByGraph.keys());
      graphsToCheck.splice(graphsToCheck.indexOf(graphName), 1);
    }
    else
      graphsToCheck = [ graphName ];

    let allowed = graphsToCheck.every(function(f) {
      let s = cylinder.getShadowTarget(f);
      return Reflect.isExtensible(s);
    });

    if (allowed)
      cylinder.setOwnKeysFilter(graphName, filter);
    else
      throw new Error("filterOwnKeys cannot apply to a non-extensible proxy");
  }

  /**
   * Assign the number of arguments to truncate a method's argument list to.
   *
   * @param graphName {Symbol|String} The graph name of the object graph handler
   *                                  the proxy uses.
   * @param proxy     {Proxy(Function)} The method needing argument truncation.
   * @param value     {Boolean|Number}
   *   - if true, limit to a function's arity.
   *   - if false, do not limit at all.
   *   - if a non-negative integer, limit to that number.
   */
  truncateArgList(graphName, proxy, value) {
    this.assertLocalProxy(graphName, proxy, "truncateArgList");
    if (typeof proxy !== "function")
      throw new Error("proxy must be a function!");
    {
      const type = typeof value;
      if (type === "number") {
        if (!Number.isInteger(value) || (value < 0)) {
          throw new Error("value must be a non-negative integer or a boolean!");
        }
      }
      else if (type !== "boolean") {
        throw new Error("value must be a non-negative integer or a boolean!");
      }
    }

    let cylinder = this.membrane.cylinderMap.get(proxy);
    cylinder.setTruncateArgList(graphName, value);
  }

  /**
   * Disable traps for a given proxy.
   *
   * @param graphName {String}   The name of the object graph the proxy is part
   *                             of.
   * @param proxy     {Proxy}    The proxy to affect.
   * @param trapList  {String[]} A list of proxy (Reflect) traps to disable.
   */
  disableTraps(graphName, proxy, trapList) {
    this.assertLocalProxy(graphName, proxy, "disableTraps");
    if (!Array.isArray(trapList))
      throw new Error("Trap list must be an array of strings!");
    trapList.forEach(t => {
      if (!allTraps.includes(t)) {
        throw new Error(`Unknown trap name: ${t}`);
      }
    });

    const cylinder = this.membrane.cylinderMap.get(proxy);
    trapList.forEach(t => cylinder.setLocalFlag(graphName, `disableTrap(${t})`, true));
  }

  createDistortionsListener() {
    return new DistortionsListener(this.membrane);
  }
}
Object.seal(ModifyRulesAPI);
