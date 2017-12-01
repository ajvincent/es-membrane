describe("Output panel", function() {
  "use strict";
  var window, OGM;
  beforeEach(async function() {
    await getDocumentLoadPromise("base/gui/index.html");
    window = testFrame.contentWindow;
    window.LoadPanel.testMode = {fakeFiles: true};
    OGM = window.OuterGridManager;
  });

  function membranePanelSelect() {
    let p = MessageEventPromise(
      window, "MembranePanel updated"
    );
    OGM.membranePanelRadio.click();
    return p;
  }

  function linkUpdatePromise() {
    let p = MessageEventPromise(
      window, "OutputPanel updated download links"
    );
    OGM.outputPanelRadio.click();
    return p;
  }

  /* We could check the contents of the CodeMirror instance... but
   * that's much less important than the download link working.
   */
  describe("in the configuration file link", function() {
    async function getJSON() {
      let url = window.OutputPanel.configLink.getAttribute("href");
      return JSON.parse(await XHRPromise(url));
    }

    it("consistently matches the HandlerNames", async function() {
      await getGUIMocksPromise([]);

      {
        let actualJSON = await getJSON();
        expect(Array.isArray(actualJSON.graphs)).toBe(true);
        expect(actualJSON.graphs[0].name).toBe("wet");
        expect(actualJSON.graphs[0].isSymbol).toBe(false);
        expect(actualJSON.graphs[1].name).toBe("dry");
        expect(actualJSON.graphs[1].isSymbol).toBe(false);
      }

      await membranePanelSelect();
      window.HandlerNames.setRow(2, "damp", true);
      OGM.defineGraphs();

      await linkUpdatePromise();

      {
        let actualJSON = await getJSON();

        expect(Array.isArray(actualJSON.graphs)).toBe(true);
        expect(actualJSON.graphs[0].name).toBe("wet");
        expect(actualJSON.graphs[0].isSymbol).toBe(false);
        expect(actualJSON.graphs[1].name).toBe("dry");
        expect(actualJSON.graphs[1].isSymbol).toBe(false);

        expect(actualJSON.graphs[2].name).toBe("damp");
        expect(actualJSON.graphs[2].isSymbol).toBe(true);
      }

      // XXX ajvincent Checking for files depends on issues #121, 122.
    });

    it("supports the pass-through function for membranes", async function() {
      await getGUIMocksPromise([]);
      {
        let actualJSON = await getJSON();
        expect(actualJSON.membrane.passThroughSource).toBe("");
        expect(actualJSON.membrane.passThroughEnabled).toBe(false);
        expect(actualJSON.membrane.primordialsPass).toBe(false);
      }

      {
        await membranePanelSelect();
        window.MembranePanel.passThroughCheckbox.click();

        await linkUpdatePromise();
        let actualJSON = await getJSON();
        expect(actualJSON.membrane.passThroughSource).toBe("");
        expect(actualJSON.membrane.passThroughEnabled).toBe(true);
        expect(actualJSON.membrane.primordialsPass).toBe(false);
      }

      {
        await membranePanelSelect();
        window.MembranePanel.primordialsCheckbox.click();
        expect(window.MembranePanel.primordialsCheckbox.checked).toBe(true);

        await linkUpdatePromise();
        let actualJSON = await getJSON();
        expect(actualJSON.membrane.passThroughSource).toBe("");
        expect(actualJSON.membrane.passThroughEnabled).toBe(true);
        expect(actualJSON.membrane.primordialsPass).toBe(true);
      }

      {
        await membranePanelSelect();
        window.MembranePanel.passThroughCheckbox.click();
        expect(window.MembranePanel.passThroughCheckbox.checked).toBe(false);

        await linkUpdatePromise();
        let actualJSON = await getJSON();
        expect(actualJSON.membrane.passThroughSource).toBe("");
        expect(actualJSON.membrane.passThroughEnabled).toBe(false);
        expect(actualJSON.membrane.primordialsPass).toBe(true);
      }
    });
  });

  describe("has good syntax in the downloadable JavaScript", function() {
    var counter;
    beforeEach(async function() {
      await getGUIMocksPromise([]);
      counter = 0;
    });

    async function testScriptForSyntax() {
      let url = window.OutputPanel.jsLink.getAttribute("href");
      let source = await XHRPromise(url);
      expect(source.startsWith("function buildMembrane(")).toBe(true);
      source = `function() {\n${source}\nreturn true;\n}`;

      const BlobLoader = window.DistortionsManager.BlobLoader;

      // named values must have unique names, hence the counter
      await BlobLoader.addNamedValue("test" + counter, source);
      expect(BlobLoader.valuesByName.get("test" + counter)).toBe(true);
      counter++;
    }

    it("in a baseline configuration", testScriptForSyntax);

    it("with handler manipulation", async function() {
      await membranePanelSelect();
      window.HandlerNames.setRow(2, "damp", true);

      await linkUpdatePromise();
      await testScriptForSyntax();
    });

    it("with membrane pass-through manipulation", async function() {
      // enable pass-through
      {
        await membranePanelSelect();
        window.MembranePanel.passThroughCheckbox.click();

        await linkUpdatePromise();
        await testScriptForSyntax();
      }

      // enable primordials
      {
        await membranePanelSelect();
        window.MembranePanel.primordialsCheckbox.click();

        await linkUpdatePromise();
        await testScriptForSyntax();
      }

      // disable primordials
      {
        await membranePanelSelect();
        window.MembranePanel.primordialsCheckbox.click();

        await linkUpdatePromise();
        await testScriptForSyntax();
      }

      // disable pass-through
      {
        await membranePanelSelect();
        window.MembranePanel.passThroughCheckbox.click();

        await linkUpdatePromise();
        await testScriptForSyntax();
      }
    });
  });
});
