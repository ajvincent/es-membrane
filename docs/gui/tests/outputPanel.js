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
      window, "MembranePanel cached configuration reset"
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
        expect(actualJSON.graphNames).toEqual(["wet", "dry"]);
        expect(actualJSON.graphSymbolLists).toEqual([]);
      }

      window.HandlerNames.setRow(2, "damp", true);
      window.OutputPanel.update();

      {
        let actualJSON = await getJSON();
        expect(actualJSON.graphNames).toEqual(["wet", "dry", "damp"]);
        expect(actualJSON.graphSymbolLists).toEqual([2]);
      }

      // XXX ajvincent Checking for files depends on issues #121, 122.
    });

    it("supports the pass-through function for membranes", async function() {
      await getGUIMocksPromise([]);
      {
        let actualJSON = await getJSON();
        expect(actualJSON.passThrough).toBe(null);
      }

      {
        await membranePanelSelect();
        window.MembranePanel.passThroughCheckbox.click();

        await linkUpdatePromise();
        let actualJSON = await getJSON();
        expect(typeof actualJSON.passThrough).toBe("string");
        const prelim = "(function() {\n  const items = [];\n\n";
        expect(actualJSON.passThrough.startsWith(prelim)).toBe(true);
      }

      {
        await membranePanelSelect();
        window.MembranePanel.primordialsCheckbox.click();
        expect(window.MembranePanel.primordialsCheckbox.checked).toBe(true);

        await linkUpdatePromise();
        let actualJSON = await getJSON();
        expect(typeof actualJSON.passThrough).toBe("string");
        const prelim = "(function() {\n  const items = Membrane.Primordials.slice(0);\n\n";
        expect(actualJSON.passThrough.startsWith(prelim)).toBe(true);
      }

      {
        await membranePanelSelect();
        window.MembranePanel.passThroughCheckbox.click();
        expect(window.MembranePanel.passThroughCheckbox.checked).toBe(false);

        await linkUpdatePromise();
        let actualJSON = await getJSON();
        expect(actualJSON.passThrough).toBe(null);
      }
    });
  });

  describe("has good syntax in the downloadable JavaScript", function() {
    beforeEach(async function() {
      await getGUIMocksPromise([]);
    });

    async function testScriptForSyntax() {
      let url = window.OutputPanel.jsLink.getAttribute("href");
      let source = await XHRPromise(url);
      expect(
        source.startsWith("function buildMembrane(utilities) {\n")
      ).toBe(true);
      source = `function() {\n${source}\nreturn true;\n}`;

      const BlobLoader = window.DistortionsManager.BlobLoader;

      await BlobLoader.addNamedValue("test", source);
      expect(BlobLoader.valuesByName.get("test")).toBe(true);
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
