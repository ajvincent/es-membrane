function defineBasicTests()
{
  describe("The key objects exist for this test: ", function() {
    it("Membrane", function() {
      expect(typeof Membrane).toBe("function");
    });

    it("MembraneMocks", function() {
      expect(typeof MembraneMocks).toBe("function");
    });

    it("loggerLib", function() {
      expect(typeof loggerLib).toBe("object");
    });
  });
}

function defineMocksTestsIfAvailable()
{
  if ((typeof defineMocksTests != "function") ||
      (typeof mockOptions != "object") ||
      !Array.isArray(graphData))
    throw new Error("Missing a mandatory object");

  let parts = null;

  function buildMembrane()
  {
    parts = MembraneMocks(false, null, mockOptions);
    if (typeof mockOptions.postMembrane == "function")
    {
      let argList = graphData.map(function(item) {
        return item.graphName;
      });
      argList.splice(0, 2, parts); // drop the wet and dry graphs, add the mocks
      mockOptions.postMembrane.apply(mockOptions, argList);
    }
  }

  let args = [
    buildMembrane
  ];

  graphData.forEach(function(item) {
    args.push(function(graphCallback) {
      if (typeof graphCallback !== "function")
        throw new Error("callback must be a function!");
      var document;
      if (item.graphName == "wet")
        document = parts.wet.doc;
      else
        document = parts.membrane.convertArgumentToProxy(
          parts.handlers.wet,
          parts.handlers[item.graphName],
          parts.wet.doc
        );
      graphCallback(document);
    });
  });

  defineMocksTests.apply(this, args);
}

function addBlobs()
{
  "use strict";
  const params = new URL(window.location.href).searchParams;
  const testMode = params.get("testMode");
  if (testMode == "firstRun")
  {
    window.addEventListener("DOMContentLoaded", defineBasicTests, true);
    return;
  }

  let blobs = params.getAll("scriptblob");
  let blobURLs = [];
  blobs.forEach(function(b) {
    let scriptElem = document.createElement("script");
    scriptElem.setAttribute("src", b);
    document.head.appendChild(scriptElem);
    blobURLs.push(b);
  });

  if (testMode == "MembraneMocks")
    window.addEventListener("DOMContentLoaded", defineMocksTestsIfAvailable, true);

  window.addEventListener("unload", function() {
    blobURLs.forEach(function(b) {
      URL.revokeObjectURL(b);
    });
  });
}

addBlobs();
