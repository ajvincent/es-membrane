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

function voidFunc() { /* do nothing */ }

const BlobLoader = {
  loadFired: false,
  testsStarted: false,
  init: function()
  {
    "use strict";
    window.addEventListener("load", this, true);

    const params = new URL(window.location.href).searchParams;
    const testMode = params.get("testMode");
    if (testMode == "firstRun")
    {
      this.setTestStart(0, defineBasicTests);
      return;
    }

    let blobs = params.getAll("scriptblob");

    if (testMode == "MembraneMocks")
      this.setTestStart(blobs.length, defineMocksTestsIfAvailable);

    else if (testMode == "Freeform")
      this.setTestStart(blobs.length, voidFunc);

    let blobURLs = [];
    blobs.forEach(function(b) {
      let scriptElem = document.createElement("script");
      scriptElem.setAttribute("src", b);
      document.head.appendChild(scriptElem);
      blobURLs.push(b);
    });

    window.addEventListener("unload", function() {
      blobURLs.forEach(function(b) {
        URL.revokeObjectURL(b);
      });
    });
  },

  setTestStart: function(blobCount, defineTests)
  {
    this.blobCount = blobCount;
    this.defineTests = defineTests;
  },

  decrement: function()
  {
    --this.blobCount;
    this.mayStartTests();
  },

  mayStartTests: function()
  {
    if ((this.blobCount > 0) || !this.loadFired || this.testsStarted)
      return;

    this.testsStarted = true;
    this.defineTests();
    jasmine.getEnv().execute();
  },

  handleEvent: function(event) {
    if (event.target != document)
      return;
    window.setTimeout(this.handleLoad.bind(this), 0);
    window.removeEventListener("load", this, true);
  },

  handleLoad: function()
  {
    this.loadFired = true;
    this.mayStartTests();
  }
};

BlobLoader.init();
