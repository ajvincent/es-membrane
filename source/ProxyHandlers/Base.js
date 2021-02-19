// A ProxyHandler base prototype, for instanceof checks.
MembraneProxyHandlers.Base = class {};
allTraps.forEach((trapName) =>
  MembraneProxyHandlers.Base.prototype[trapName] = NOT_IMPLEMENTED
);
