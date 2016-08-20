// First, set up the membrane, and register the "wet" form of "the document".
var docMap, wetHandler;
var dryWetMB = new Membrane({
  showGraphName: true,
  logger: ((typeof logger == "object") ? logger : null),
});

{
  // Establish "wet" view of document.
  wetHandler = dryWetMB.getHandlerByField("wet");
  
  let [found, doc] = dryWetMB.getMembraneValue("wet", wetDocument);
  assert(!found, "wetDocument should not be known");

  docMap = dryWetMB.buildMapping("wet", wetDocument);
  [found, doc] = dryWetMB.getMembraneValue("wet", wetDocument);
  assert(found, "wetDocument was not found?");
  assert(doc === wetDocument, "wetDocument was not retrieved?");
}

{
  dryWetMB.buildMapping("wet", NodeWet);
  dryWetMB.buildMapping("wet", ElementWet);
}
