/** @module source/core/broadcasters/ProxyMessage  */

import {
  defineNWNCProperties,
} from "../sharedUtilities.mjs";

/**
 * @private
 * @type WeakMap<ProxyMessage, {}>
 */
const PROXYMESSAGE_PRIVATE = new WeakMap();

/**
 * @package
 */
export default class ProxyMessage {
  /**
   * 
   * @param {Proxy}                            proxy
   * @param {Object}                           realTarget
   * @param {ObjectGraph | ObjectGraphHandler} graph
   * @param {boolean}                          isOriginGraph
   */
  constructor(proxy, realTarget, graph, isOriginGraph) {
    const privateObj = {
      stopped: false,
      exnFound: false,
      exception: undefined,

      proxy,
    };
    PROXYMESSAGE_PRIVATE.set(this, privateObj);

    defineNWNCProperties(this, {
      realTarget,
      graph,
      isOriginGraph,
      logger: (graph.membrane && (typeof graph.membrane.logger !== "undefined") ?
               graph.membrane.logger :
               null)
    }, true);
  }

  /**
   * The proxy or value the Membrane will return to the caller.
   */
  get proxy() {
    return PROXYMESSAGE_PRIVATE.get(this).proxy;
  }

  /*
  set proxy(val) {
    const privateObj = PROXYMESSAGE_PRIVATE.get(this);
    if (!privateObj.stopped)
      privateObj.proxy = val;
  }
  */

  get stopped() {
    return PROXYMESSAGE_PRIVATE.get(this).stopped;
  }

  get exceptionFound() {
    return PROXYMESSAGE_PRIVATE.get(this).exnFound;
  }

  get exception() {
    return PROXYMESSAGE_PRIVATE.get(this).exception;
  }

  stopIteration() {
    const privateObj = PROXYMESSAGE_PRIVATE.get(this);
    privateObj.stopped = true;
  }

  throwException(e) {
    const privateObj = PROXYMESSAGE_PRIVATE.get(this);
    if (privateObj.exnFound)
      return;
    privateObj.stopped = true;
    privateObj.exnFound = true;
    privateObj.exception = e;
  }
}

Object.freeze(ProxyMessage);
Object.freeze(ProxyMessage.prototype);
