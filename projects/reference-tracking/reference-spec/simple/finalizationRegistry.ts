const callback = function(heldValue: unknown) {
  void(heldValue);
}
const registry = new FinalizationRegistry(callback);

const target = { isTarget: true };
const heldValue = { isHeldValue: true };
const token = { isToken: true };

registry.register(target, heldValue, token);

searchReferences("callback before unregistration", callback, [registry], true);
searchReferences("target before unregistration", target, [registry], true);
searchReferences("heldValue before unregistration", heldValue, [registry], true);
searchReferences("unregisterToken before unregistration", token, [registry], true);

registry.unregister(token);
searchReferences("target after unregistration", target, [registry], true);
searchReferences("heldValue after unregistration", heldValue, [registry], true);
searchReferences("unregisterToken after unregistration", token, [registry], true);
