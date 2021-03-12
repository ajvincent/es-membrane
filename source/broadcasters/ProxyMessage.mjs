import {
  DataDescriptor,
} from "../core/sharedUtilities.mjs";

/**
 * @private
 * @type WeakMap<ProxyMessage, {}>
 */
const PROXYMESSAGE_PRIVATE = new WeakMap();

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
  }

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
