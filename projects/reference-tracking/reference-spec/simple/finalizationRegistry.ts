
const foundHeldValues = new Set<unknown>;

function callback(value: unknown): void {
  foundHeldValues.add(value);
}

const registry = new FinalizationRegistry(callback);
searchReferences("callback", callback, [registry], true);

const target = { isTarget: true };
const registryHeld = { isRegistryHeld: true};
const token = { isToken: true };

registry.register(target, registryHeld, token);
searchReferences("target before unregistration (strong)", target, [registry], true);
searchReferences("target before unregistration (weak)", target, [registry], false);
searchReferences("heldValue before unregistration (strong)", registryHeld, [registry], true);
searchReferences("heldValue before unregistration (weak)", registryHeld, [registry], false);
searchReferences("heldValue before unregistration (joint)", registryHeld, [registry, target], true);
searchReferences("unregisterToken before unregistration (strong)", token, [registry], true);
searchReferences("unregisterToken before unregistration (weak)", token, [registry], false);
searchReferences("unregisterToken before unregistration (joint)", token, [registry, target], false);

registry.unregister(token);
searchReferences("target after unregistration", target, [registry], false);
searchReferences("heldValue after unregistration", registryHeld, [registry], true);
searchReferences("unregisterToken after unregistration", token, [registry], false);
