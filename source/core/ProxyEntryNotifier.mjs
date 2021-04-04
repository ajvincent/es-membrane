/** @module source/core/ProxyEntryNotifier.mjs */

/**
 * @fileoverview
 *
 * The ProxyEntryNotifier represents the best way to notify an observer that a proxy is
 * about to enter an object graph.  It's for uninitialized proxies entering an object graph
 * through a known object or proxy, so that we can apply distortions to the uninitialized
 * proxy.
 *
 * The best example I can give is an observer proxy receiving a raw object.  The only chance
 * to attach distortions to the proxy for the raw object is before the real observer receives
 * the object's proxy.
 */

import {
  allTraps,
  defineNWNCProperties,
} from "./utilities/shared.mjs";

const trapsAsSet = new Set(allTraps);

/**
 * The message class.
 *
 * @public
 */
class ProxyEntryMessage {
  /**
   * @param {Proxy | Object}   entryTarget An object about to receive the proxyTarget as a property or argument.
   * @param {string}           trapName    The name of the trap.
   * @param {number | string | symbol?}
   *                           entryPoint  A property name, or an argument index for a function call.  Null if not applicable.
   * @param {Proxy | Object}   proxyTarget The proxy target to use for the modify rules API, or a DistortionsListener.
   * @param {"get" | "set"?}   getOrSet    A flag indicating a getter or setter.
   */
  constructor(entryTarget, trapName, entryPoint, proxyTarget, getOrSet) {
    defineNWNCProperties(this, {
      /** @public, @readonly */
      entryTarget,

      /** @public, @readonly */
      trapName,

      /** @public, @readonly */
      entryPoint,

      /** @public, @readonly */
      proxyTarget,

      /** @public, @readonly */
      getOrSet,
    }, true);

    Object.freeze(this);
  }
}
Object.freeze(ProxyEntryMessage);
Object.freeze(ProxyEntryMessage.prototype);

/**
 * @typedef {WeakMap<ObjectGraph, WeakMap<entryTarget, Function>>} GraphEntryMap;
 */

/**
 * Our entry notifier class.
 *
 * @public
 */
export default class ProxyEntryNotifier {
  /**
   * @param {ProxyCylinderMap} __cylinderMap__ The cylinder map for the membrane.
   */
  constructor(__cylinderMap__) {
    defineNWNCProperties(this, {
      /** @private */
      __cylinderMap__,

      /**
       * @type {Map<string, GraphEntryMap>}
       * @private
       */
      __rootMap__: new Map(),
    }, false);

    Object.freeze(this);
  }

  /**
   * Set an entry observer.
   *
   * @param {ObjectGraph}                 objectGraph The object graph owning the entry target.
   * @param {string}                      trapName    The trap name to apply.
   * @param {Proxy | Object}              entryTarget An object which will receive proxy targets as a property or argument.
   * @param {Function<ProxyEntryMessage>} observer    The observer to notify.
   *
   * @public
   */
  setEntryObserver(objectGraph, trapName, entryTarget, observer) {
    if (!trapsAsSet.has(trapName)) {
      throw new Error(`Unknown trap "${trapName}"!`);
    }

    if (typeof observer !== "function")
      throw new Error("observer is not a function!");

    {
      const membrane = objectGraph.membrane;
      const match = membrane.getMembraneProxy(objectGraph.graphName, entryTarget)[1];
      if (match !== entryTarget)
        throw new Error("Entry target does not belong to object graph!");
    }

    if (!this.__rootMap__.has(trapName)) {
      this.__rootMap__.set(trapName, new WeakMap);
    }

    const graphMap = this.__rootMap__.get(trapName);
    if (!graphMap.has(objectGraph)) {
      graphMap.set(objectGraph, new WeakMap);
    }

    const entryMap = graphMap.get(objectGraph);
    if (entryMap.has(entryTarget))
      throw new Error("Entry trap has already been set for this object graph, trap name and entry target!");

    entryMap.set(entryTarget, observer);
  }

  /**
   * @param {ObjectGraph}      sourceGraph The object graph of the entry object.
   * @param {ObjectGraph}      targetGraph The object graph of the proxy.
   * @param {Proxy | Object}   entryObject An object about to receive the proxyTarget as a property or argument.
   * @param {string}           trapName    The name of the trap.
   * @param {number | string | symbol?}
   *                           entryPoint  A property name, or an argument index for a function call.  Null if not applicable.
   * @param {Proxy}            proxy       The proxy to use for the modify rules API, or a DistortionsListener.
   * @param {"get" | "set"?}   getOrSet    A flag indicating a getter or setter.
   *
   * @package
   */
  notify(sourceGraph, targetGraph, entryObject, trapName, entryPoint, proxy, getOrSet = null) {
    const graphMap = this.__rootMap__.get(trapName);
    if (!graphMap)
      return;

    const entryCylinder = this.__cylinderMap__.get(entryObject);
    if (!entryCylinder)
      return;

    const proxyCylinder = this.__cylinderMap__.get(proxy);
    if (!proxyCylinder)
      return;

    this.__notifyGraph__(graphMap, sourceGraph, entryCylinder, trapName, entryPoint, proxyCylinder, getOrSet);
    this.__notifyGraph__(graphMap, targetGraph, entryCylinder, trapName, entryPoint, proxyCylinder, getOrSet);
  }

  /**
   * Notify an observer belonging to a specific object graph and entry target.
   * @param {GraphEntryMap}    graphMap      A shared weak map for the specific trap.
   * @param {ObjectGraph}      graph         An object graph we register the observer for.
   * @param {ProxyCylinder}    entryCylinder The cylinder owning the entry target.
   * @param {string}           trapName      The name of the trap.
   * @param {number | string | symbol?}
   *                           entryPoint  A property name, or an argument index for a function call.  Null if not applicable.
   * @param {ProxyCylinder}    proxyCylinder The cylinder owning the proxy target we want to observe.
   * @param {"get" | "set"?}   getOrSet    A flag indicating a getter or setter.
   *
   * @private
   */
  __notifyGraph__(graphMap, graph, entryCylinder, trapName, entryPoint, proxyCylinder, getOrSet) {
    if (proxyCylinder.originGraph === graph.graphName)
      return;

    const entryMap = graphMap.get(graph);
    if (!entryMap)
      return;

    const entryTarget = entryCylinder.getProxy(graph.graphName);
    const observer = entryMap.get(entryTarget);

    if (!observer)
      return;

    const message = new ProxyEntryMessage(
      entryTarget,
      trapName,
      entryPoint,
      proxyCylinder.getProxy(graph.graphName),
      getOrSet
    );

    try {
      observer(message);
    }
    catch (ex) {
      // do nothing
    }
  }
}

Object.freeze(ProxyEntryNotifier);
Object.freeze(ProxyEntryNotifier.prototype);
