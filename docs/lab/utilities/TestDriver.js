const TestDriver = {
  // see below, private
  pageEnvironment: null,
  DOMEnvironment: null,
  runButton: null,
  iframe: null,

  // private
  locks: new Set(),
  
  run: function runTest(sourcesById)
  {
    "use strict";
    let testrunner = this.pageEnvironment.value;

    let blobs = [];
    sourcesById.forEach(function(id) {
      let source = document.getElementById(id).value;
      let b = new Blob([source], { type: "application/javascript" });
      blobs.push(b);
    });

    let runnerURL = new URL(testrunner, window.location.href);

    blobs.forEach(function(b) {
      runnerURL.searchParams.append("scriptblob", URL.createObjectURL(b));
    });
    let finalURL = runnerURL.href;

    this.iframe.setAttribute("src", finalURL);
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
