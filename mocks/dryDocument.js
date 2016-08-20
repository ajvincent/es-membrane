// The "dry" part of the membrane's wet document.
var ElementDry, NodeDry, dryDocument;
{
  // Establish proxy handler for "dry" mode.
  let dryHandler = dryWetMB.getHandlerByField("dry");
  let found, doc;

  doc = dryWetMB.wrapArgumentByHandler(dryHandler, wetDocument);
  assert(doc === wetDocument, "Expected to get back the wet document");

  [found, doc] = dryWetMB.getMembraneValue("dry", wetDocument);
  assert(found, "Must find dryDocument from membrane wrapping of wetDocument");
  assert(doc === wetDocument, "Expected to get back the wet document");

  [found, doc] = dryWetMB.getMembraneProxy("dry", wetDocument);
  assert(found, "Must find dryDocument from membrane wrapping of wetDocument");
  assert(doc, "Expected to get back a proxy");
  assert(doc !== wetDocument, "Expected to get back the proxy for the wet document");
  dryDocument = doc;

  dryDocument.addEventListener("unload", function() {
    if (typeof logger == "object")
      logger.debug("Revoking all proxies in dry object graph");
    dryHandler.revokeEverything();
    if (typeof logger == "object")
      logger.debug("Revoked all proxies in dry object graph");
  }, true);
}

{
  let dryHandler = dryWetMB.getHandlerByField("dry");
  dryWetMB.wrapArgumentByHandler(dryHandler, ElementWet);
  let found;
  [found, ElementDry] = dryWetMB.getMembraneProxy("dry", ElementWet);
  assert(found, "ElementDry not found as a proxy!");
}

{
  let dryHandler = dryWetMB.getHandlerByField("dry");
  dryWetMB.wrapArgumentByHandler(dryHandler, NodeWet);
  let found;
  [found, NodeDry] = dryWetMB.getMembraneProxy("dry", NodeWet);
  assert(found, "NodeDry not found as a proxy!");
}
