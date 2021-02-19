MembraneProxyHandlers.Forwarding = class extends MembraneProxyHandlers.Base {
  constructor() {
    super();

    Reflect.defineProperty(this, "nextHandler", {
      value: null,
      writable: true,
      enumerable: true,
      configurable: false,
    });
  }
};

{
  const proto = MembraneProxyHandlers.Forwarding.prototype;
  allTraps.forEach((trapName) =>
    proto[trapName] = function(...args) {
      return this.nextHandler[trapName].apply(this.nextHandler, args);
    }
  );
}
