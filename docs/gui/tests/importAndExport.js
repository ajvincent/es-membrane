describe("What we export we can import, and vice versa:", function() {
  "use strict";
  var window, OGM;

  async function resetEnvironment(url) {
    if (window) {
      window = null;
      OGM = null;
      await getDocumentLoadPromise("about:blank");
    }
    await getDocumentLoadPromise(url);
    window = testFrame.contentWindow;
    OGM = window.OuterGridManager;
  };

  it(
    "with a DistortionRules object for a non-function object",
    async function() {
      var window;
      await resetEnvironment("base/gui/tests/rules-fixture.html");
      window = testFrame.contentWindow;
  
      let rules = window.setupRules(new window.Counter());
      const exportedJSON = rules.exportJSON();
      rules = null;
  
      await resetEnvironment("base/gui/tests/rules-fixture.html");
      rules = window.setupRules(new window.Counter());
      rules.importJSON(exportedJSON);
  
      const secondJSON = rules.exportJSON();
      expect(secondJSON).toEqual(exportedJSON);
    }
  );

  it(
    "with a DistortionRules object for a function",
    async function() {
      var window;
      await resetEnvironment("base/gui/tests/rules-fixture.html");
      window = testFrame.contentWindow;
  
      let rules = window.setupRules(window.Counter);
      const exportedJSON = rules.exportJSON();
      rules = null;
  
      await resetEnvironment("base/gui/tests/rules-fixture.html");
      rules = window.setupRules(window.Counter);
      rules.importJSON(exportedJSON);
  
      const secondJSON = rules.exportJSON();
      expect(secondJSON).toEqual(exportedJSON);
    }
  );

  it("for a full configuration", async function() {
    await resetEnvironment("base/gui/index.html");
    await getGUIMocksPromise(["doc"]);

    const firstExportedData = await XHRPromise(
      window.OutputPanel.configLink.getAttribute("href")
    );

    await resetEnvironment("base/gui/index.html");
    window = testFrame.contentWindow;
    window.LoadPanel.testMode = { fakeFiles: true };
    window.LoadPanel.setTestModeFiles();

    // test import
    window.LoadPanel.testMode.configSource = firstExportedData;
    const firstParse  = JSON.parse(firstExportedData);

    let p1 = MessageEventPromise(window, "MembranePanel initialized");
    let p2 = MessageEventPromise(
      window,
      "MembranePanel cached configuration reset",
      "MembranePanel exception thrown in reset"
    );

    await window.LoadPanel.update("fromConfig");
    OGM.membranePanelRadio.click();
    await Promise.all([p1, p2]);

    expect(window.MembranePanel.submitButton.disabled).toBe(false);
    await window.OuterGridManager.defineGraphs();
    {
      let p1 = MessageEventPromise(window, "OutputPanel initialized");
      let p2 = MessageEventPromise(window, "OutputPanel updated download links");
      window.OuterGridManager.outputPanelRadio.click();
      await Promise.all([p1, p2]);
    }

    const secondExportedData = await XHRPromise(
      window.OutputPanel.configLink.getAttribute("href")
    );

    const secondParse = JSON.parse(secondExportedData);
    firstParse.configurationSetup.lastUpdated = secondParse.configurationSetup.lastUpdated;
    expect(secondParse).toEqual(firstParse);
  });
});
