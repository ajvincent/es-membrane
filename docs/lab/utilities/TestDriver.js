const TestDriver = {
  // see below, private
  pageEnvironment: null,
  DOMEnvironment: null,
  runButton: null,
  iframe: null,

  // private
  locks: new Set(),

  run: function()
  {
    "use strict";
    let testrunner = this.pageEnvironment.value;
    let blobs = [];
    let runnerURL = new URL(testrunner, window.location.href);
    runnerURL.searchParams.set("testMode", this.DOMEnvironment.value);

    if (this.DOMEnvironment.value === "MembraneMocks")
      this.getMocksBlobs(blobs);

    blobs.forEach(function(b) {
      runnerURL.searchParams.append("scriptblob", URL.createObjectURL(b));
    });
    let finalURL = runnerURL.href;

    this.iframe.setAttribute("src", finalURL);
  },

  firstRun: function()
  {
    let runnerURL = new URL("jasmine.html", window.location.href);
    runnerURL.searchParams.set("testMode", "firstRun");
    this.iframe.setAttribute("src", runnerURL.href);
  },

  getMocksBlobs: function(blobs)
  {
    "use strict";
    {
      // Assemble the blob defining the graph names.
      let graphData = ObjectGraphManager.graphNames();
      void(graphData);
      let sources = [
`
const graphData = [
`,
// individual graph info
`
];
`
      ];
      graphData.forEach(function(item) {
        let name = item.graphName.toString();
        if (typeof item.graphName == "symbol")
        {
          name = [
            'Symbol(`',
            name.substring(7, name.length - 1),
            '`)'
          ].join("");
        }
        else
          name = JSON.stringify(item.graphName);
        let lineSource = `
  {
    "graphName": ${name},
    "callback": "${item.callback}"
  },
`;
        sources.splice(sources.length - 1, 0, lineSource);
      });
      this.convertSourcesToTestBlob(sources, blobs);
    }

    [
      "mockOptionsEditor",
      "runMembraneTestEditor",
    ].forEach(function(propName) {
      if (!(propName in CodeMirrorManager)) {
        throw new Error("Missing editor: " + propName);
      }
      let source = CodeMirrorManager[propName].getValue();
      this.convertSourcesToTestBlob([source], blobs);
    }, this);
  },

  convertSourcesToTestBlob: function(sources, blobs)
  {
    sources.push(`
if (BlobLoader)
  BlobLoader.decrement();
`);
    let b = new Blob(sources, { type: "application/javascript" });
    blobs.push(b);
  },

  setLockStatus: function(symbol, enabled)
  {
    if (enabled)
      this.locks.add(symbol);
    else
      this.locks.delete(symbol);
    this.runButton.disabled = Boolean(this.locks.size);
  }
};

{
  let elems = [
    "pageEnvironment",
    "DOMEnvironment",
    "runButton",
    "iframe"
  ];
  elems.forEach(function(idSuffix) {
    defineElementGetter(TestDriver, idSuffix, "TestDriver-" + idSuffix);
  });
}
