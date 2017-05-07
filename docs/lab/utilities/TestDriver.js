const TestDriver = {
  // see below, private
  pageEnvironment: null,
  scriptEnvironment: null,
  runButton: null,
  iframe: null,
  currentPanel: null,

  init: function()
  {
    this.scriptEnvironment.addEventListener(
      "change",
      this.selectPanel.bind(this),
      true
    );
    this.selectPanel();
  },

  selectPanel: function()
  {
    if (this.currentPanel)
      this.currentPanel.setAttribute("collapsed", true);
    const panelId = "panel-" + this.scriptEnvironment.value;
    this.currentPanel = document.getElementById(panelId);
    this.currentPanel.removeAttribute("collapsed");
    this.updateDisabledButton();
  },

  // private
  locks: {
    "MembraneMocks": new Set(),
    "Freeform": new Set(),
  },

  run: function()
  {
    "use strict";
    let testrunner = this.pageEnvironment.value;
    let blobs = [];
    let runnerURL = new URL(testrunner, window.location.href);
    runnerURL.searchParams.set("testMode", this.scriptEnvironment.value);

    if (this.scriptEnvironment.value === "MembraneMocks")
      ObjectGraphManager.getBlobs(blobs);
    else if (this.scriptEnvironment.value === "Freeform")
    {
      debugger;
      FreeformManager.getBlobs(blobs);
    }

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

  convertSourcesToTestBlob: function(sources, blobs)
  {
    sources.push(`
if (BlobLoader)
  BlobLoader.decrement();
`);
    let b = new Blob(sources, { type: "application/javascript" });
    blobs.push(b);
  },

  setLockStatus: function(environment, symbol, enabled)
  {
    let locks = this.locks[environment];
    if (enabled)
      locks.add(symbol);
    else
      locks.delete(symbol);
    this.updateDisabledButton();
  },

  updateDisabledButton: function() {
    let locks = this.locks[this.scriptEnvironment.value];
    this.runButton.disabled = Boolean(locks.size);
  },
  
};

{
  let elems = [
    "pageEnvironment",
    "scriptEnvironment",
    "runButton",
    "iframe"
  ];
  elems.forEach(function(idSuffix) {
    defineElementGetter(TestDriver, idSuffix, "TestDriver-" + idSuffix);
  });
}
