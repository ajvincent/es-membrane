/** @module source/core/broadcasters/ProxyMessageBase.mjs */

/**
 * @public
 */
export default class ProxyMessageBase {
  constructor() {
    this.__stopped__ = false;
    this.__exnFound__ = false;
    this.__exception__ = undefined;
  }

  get stopped() {
    return this.__stopped__;
  }

  get exceptionFound() {
    return this.__exnFound__;
  }

  get exception() {
    return this.__exception__;
  }

  stopIteration() {
    this.__stopped__ = true;
  }

  throwException(e) {
    if (this.__exnFound__)
      return;
    this.__stopped__ = true;
    this.__exnFound__ = true;
    this.__exception__ = e;
  }
}
Object.freeze(ProxyMessageBase);
Object.freeze(ProxyMessageBase.prototype);
