// The "dry" part of the membrane's wet document.
var ElementDry, NodeDry, dryDocument;
{
  // Establish proxy handler for "dry" mode.
  let dryHandler = dryWetMB.getHandlerByName("dry", { mustCreate: true });
  Mocks.handlers.dry = dryHandler;
  Mocks.dry = {};

  if (typeof mockOptions.dryHandlerCreated == "function")
    mockOptions.dryHandlerCreated(dryHandler, Mocks);

  let found, doc;

  dryWetMB.convertArgumentToProxy(wetHandler, dryHandler, wetDocument);

  [found, doc] = dryWetMB.getMembraneValue("dry", wetDocument);
  assert(found, "Must find dryDocument from membrane wrapping of wetDocument");
  assert(doc === wetDocument, "Expected to get back the wet document");

  [found, doc] = dryWetMB.getMembraneProxy("dry", wetDocument);
  assert(found, "Must find dryDocument from membrane wrapping of wetDocument");
  assert(doc, "Expected to get back a proxy");
  assert(doc !== wetDocument, "Expected to get back the proxy for the wet document");
  dryDocument = doc;

  dryDocument.addEventListener("unload", function() {
    if ((typeof logger == "object") && (logger !== null))
      logger.debug("Revoking all proxies in dry object graph");
    dryHandler.revokeEverything();
    if ((typeof logger == "object") && (logger !== null))
      logger.debug("Revoked all proxies in dry object graph");
  }, true);

  Mocks.dry.doc = dryDocument;
}

{
  let dryHandler = dryWetMB.getHandlerByName("dry");
  dryWetMB.buildMapping(dryHandler.fieldName, ElementWet);
  let found;
  [found, ElementDry] = dryWetMB.getMembraneProxy("dry", ElementWet);
  assert(found, "ElementDry not found as a proxy!");

  Mocks.dry.Element = ElementDry;
}

{
  let dryHandler = dryWetMB.getHandlerByName("dry");
  dryWetMB.buildMapping(dryHandler.fieldName, NodeWet);
  let found;
  [found, NodeDry] = dryWetMB.getMembraneProxy("dry", NodeWet);
  assert(found, "NodeDry not found as a proxy!");

  Mocks.dry.Node = NodeDry;
}
