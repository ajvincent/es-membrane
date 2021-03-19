import {
  DataDescriptor,
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
  constructor(proxy, realTarget, graph, isOrigin) {
    const privateObj = {
      stopped: false,
      exnFound: false,
      exception: undefined,

      proxy,
    };
    PROXYMESSAGE_PRIVATE.set(this, privateObj);

    Reflect.defineProperty(this, "realTarget",    new DataDescriptor(realTarget));
    Reflect.defineProperty(this, "graph",         new DataDescriptor(graph));
    Reflect.defineProperty(this, "isOriginGraph", new DataDescriptor(isOrigin));
    Reflect.defineProperty(this, "logger",        new DataDescriptor(
      graph.membrane && (typeof graph.membrane.logger !== "undefined") ?
      graph.membrane.logger :
      null
    ));
  }

  /**
   * The proxy or value the Membrane will return to the caller.
   */
  get proxy() {
    const privateObj = PROXYMESSAGE_PRIVATE.get(this);
    return privateObj.proxy;
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
