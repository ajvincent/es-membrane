MembraneProxyHandlers.Forwarding = function() {
  Reflect.defineProperty(this, "nextHandler", {
    value: null,
    writable: true,
    enumerable: true,
    configurable: false,
  });
};

MembraneProxyHandlers.Forwarding.prototype = new MembraneProxyHandlers.Base();

{
  const proto = MembraneProxyHandlers.Forwarding.prototype;
  allTraps.forEach((trapName) =>
    proto[trapName] = function(...args) {
      return this.nextHandler[trapName].apply(this.nextHandler, args);
    }
  );
}
