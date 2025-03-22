
const foundHeldValues = new Set<unknown>;

function callback(value: unknown): void {
  foundHeldValues.add(value);
}

const registry = new FinalizationRegistry(callback);
searchReferences("callback", callback, [registry], true);

/*
const target = { isTarget: true };
const heldValue = new WeakRef(target);
const token = { isToken: true };

registry.register(target, heldValue, token);
searchReferences("target before unregistration", target, [registry], false);
searchReferences("heldValue before unregistration", heldValue, [registry], true);
searchReferences("unregisterToken before unregistration", token, [registry], false);

registry.unregister(token);
searchReferences("target after unregistration", target, [registry], false);
searchReferences("heldValue after unregistration", heldValue, [registry], true);
searchReferences("unregisterToken after unregistration", token, [registry], false);
*/
