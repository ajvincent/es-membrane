// First, set up the membrane, and register the "wet" form of "the document".
let dryWetMB, wetHandler;
{
  const options = {
    showGraphName: true,
    logger: ((typeof logger == "object") ? logger : null),
  };
  dryWetMB = new Membrane(options);
}

Mocks.membrane = dryWetMB;
Mocks.handlers = {};

{
  // Establish "wet" view of document.
  wetHandler = dryWetMB.getHandlerByName("wet", { mustCreate: true });
  Mocks.handlers.wet = wetHandler;
  // Mocks.wet is established in wetDocument.js

  if (typeof mockOptions.wetHandlerCreated == "function")
    mockOptions.wetHandlerCreated(wetHandler, Mocks);
}
