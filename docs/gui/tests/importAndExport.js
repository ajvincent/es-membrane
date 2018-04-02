describe("What we export we can import, and vice versa:", function() {
  "use strict";
  beforeEach(function() {
    setupDebugTest();
  });

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

  xit("for a full configuration", async function() {
    await resetEnvironment("base/gui/index.html");
    await getGUIMocksPromise(["doc"]);

    const firstExportedData = await XHRPromise(
      window.OutputPanel.configLink.getAttribute("href")
    );
    console.log("firstExportedData");

    await resetEnvironment("base/gui/index.html");
    console.log("second load complete");
    window = testFrame.contentWindow;
    window.LoadPanel.testMode = { fakeFiles: true };
    window.LoadPanel.setTestModeFiles();

    // test import
    window.LoadPanel.testMode.cachedConfig = firstExportedData;
    const firstParse  = JSON.parse(firstExportedData);

    {
      let p1 = MessageEventPromise(window, "MembranePanel initialized");
      let p2 = MessageEventPromise(
        window,
        "MembranePanel cached configuration reset",
        "MembranePanel exception thrown in reset"
      );
      OGM.membranePanelRadio.click();
      await Promise.all([p1, p2]);
      console.log("Membrane panel loaded");
    }

    window.LoadPanel.validateConfiguration(firstParse);
    window.HandlerNames.importConfig(firstParse);

    expect(window.MembranePanel.submitButton.disabled).toBe(false);
    window.MembranePanel.submitButton.click();

    {
      let p1 = MessageEventPromise(window, "OutputPanel initialized");
      p1 = p1.then(function() {
        console.log("OutputPanel initialized");
      });
      let p2 = MessageEventPromise(window, "OutputPanel updated download links");
      p2 = p2.then(function() {
        console.log("OutputPanel updated download links");
      });
      window.OuterGridManager.outputPanelRadio.click();
      await Promise.all([p1, p2]);
      console.log("OutputPanel loaded");
    }

    const secondExportedData = await XHRPromise(
      window.OutputPanel.configLink.getAttribute("href")
    );
    console.log("Second exported data generated");

    const secondParse = JSON.parse(secondExportedData);

    expect(secondParse).toEqual(firstParse);
  });
});
