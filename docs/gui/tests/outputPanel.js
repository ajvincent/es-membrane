describe("Output panel", function() {
  "use strict";
  var window, OGM, DM, metadata, distortions;
  // Yes, magic numbers suck.  Deal with it.
  const notesCol = 2;
  const groupCol = 3;

  beforeEach(async function() {
    await getDocumentLoadPromise("base/gui/index.html");
    window = testFrame.contentWindow;
    window.LoadPanel.testMode = {fakeFiles: true};
    OGM = window.OuterGridManager;
    DM = window.DistortionsManager;
  });

  afterEach(function() {
    window = null;
    OGM = null;
    DM = null;
    metadata = null;
    distortions = null;
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

  async function getJSON() {
    let url = window.OutputPanel.configLink.getAttribute("href");
    return JSON.parse(await XHRPromise(url));
  }

  async function getValue(name) {
    await getGUIMocksPromise([name]);

    const graphRadio = OGM.graphNamesCache.firstRadioElements[1];
    const firstRadio = graphRadio.nextElementSibling.nextElementSibling;
    firstRadio.click();
  }

  async function updateMetadata() {
    await linkUpdatePromise();
    metadata = await getJSON();
    distortions = metadata.graphs[1].distortions;
    expect(Array.isArray(distortions));
  }

  function getRowForProperty(panel, keyName) {
    let path = './/*[@row][.//span[contains(@class, "propertyName")]';
    path += `/text()[.="${keyName}"]]`;
    const result = window.document.evaluate(
      path, panel, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
    );
    const elem = result.singleNodeValue;
    return parseInt(elem.getAttribute("row"), 10);
  }

  function getRules(panel, type) {
    const hash = panel.dataset.hash;
    return DM.valueNameToRulesMap.get(hash)[type];
  }

  function getNotesLink(panel, keyName) {
    const rules = getRules(panel, "value");
    const row = getRowForProperty(panel, keyName);
    const cell = rules.gridtree.getCell(row, notesCol);
    return cell.firstElementChild;
  }

  function getGroupButton(panel, keyName) {
    const rules = getRules(panel, panel.getAttribute("trapstab"));
    const row = getRowForProperty(panel, keyName);
    const cell = rules.gridtree.getCell(row, groupCol);
    return cell.firstElementChild;
  }

  /* We could check the contents of the CodeMirror instance... but
   * that's much less important than the download link working.
   */
  describe("in the configuration file link", function() {
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
      await OGM.defineGraphs();

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

    describe("generally supports DistortionsListener instances", function() {
      it("for an object", async function() {
        await getValue("doc");
        const docPanel = OGM.getSelectedPanel();
        const rules = getRules(docPanel, "value");

        // test for help-and-notes
        getNotesLink(docPanel, "nodeName").click();
        OGM.selectedHelpAndNotesPanel.value = "The name of the node.";

        await updateMetadata();
        expect(distortions.length).toBe(1);

        const docDist = distortions[0];
        expect(docDist.about.valueName).toBe("parts.dry.doc");
        expect(docDist.about.isFunction).toBe(false);
        expect("getExample" in docDist.about).toBe(true);

        expect(docDist.value).toEqual(rules.exportJSON());

        const distProps = Reflect.ownKeys(docDist);
        distProps.sort();
        expect(distProps).toEqual(["about", "value"]);
      });

      it("for a single object's property", async function() {
        await getValue("doc");
        const docRules = getRules(OGM.getSelectedPanel(), "value");

        // doc.rootElement
        {
          const button = getGroupButton(
            OGM.getSelectedPanel(), "rootElement"
          );
          const link = button.nextElementSibling;
          const p = MessageEventPromise(
            window, "openDistortionsGroup: property panel created"
          );

          link.click();
          await p;
        }
        const elemRules = getRules(OGM.getSelectedPanel(), "value");

        await updateMetadata();
        expect(distortions.length).toBe(2);

        {
          const docDist = distortions[0];
          expect(docDist.about.valueName).toBe("parts.dry.doc");
          expect(docDist.about.isFunction).toBe(false);
          expect("getExample" in docDist.about).toBe(true);

          expect(docDist.value).toEqual(docRules.exportJSON());

          const distProps = Reflect.ownKeys(docDist);
          distProps.sort();
          expect(distProps).toEqual(["about", "value"]);
        }

        {
          const elemDist = distortions[1];
          expect(elemDist.about.valueName).toBe("parts.dry.doc.rootElement");
          expect(elemDist.about.isFunction).toBe(false);
          expect("getExample" in elemDist.about).toBe(false);
          expect(elemDist.about.parent).toBe("parts.dry.doc");
          expect(elemDist.about.keyName).toBe("rootElement");

          expect(elemDist.value).toEqual(elemRules.exportJSON());
          const distProps = Reflect.ownKeys(elemDist);
          distProps.sort();
          expect(distProps).toEqual(["about", "value"]);
        }
      });

      it("for a list of properties", async function() {
        await getValue("doc");
        const docPanel = OGM.getSelectedPanel();
        const docRules = getRules(docPanel, "value");
        {
          const propList = Object.freeze([
            "addEventListener",
            "dispatchEvent",
            "handleEventAtTarget",
            "createElement",
            "insertBefore",
          ]);

          propList.forEach(function(propName) {
            const button = getGroupButton(docPanel, propName);
            button.appendChild(window.document.createTextNode("methods"));
          });

          const button = getGroupButton(docPanel, "addEventListener");
          const link = button.nextElementSibling;
          const p = MessageEventPromise(
            window, "openDistortionsGroup: property group panel created"
          );

          link.click();
          await p;
        }

        const groupRules = getRules(OGM.getSelectedPanel(), "value");

        await updateMetadata();
        expect(distortions.length).toBe(2);

        {
          const docDist = distortions[0];
          expect(docDist.about.valueName).toBe("parts.dry.doc");
          expect(docDist.about.isFunction).toBe(false);
          expect("getExample" in docDist.about).toBe(true);

          expect(docDist.value).toEqual(docRules.exportJSON());

          const distProps = Reflect.ownKeys(docDist);
          distProps.sort();
          expect(distProps).toEqual(["about", "value"]);
        }

        {
          const groupDist = distortions[1];
          expect(groupDist.about.valueName).toBe("[methods]");
          expect(groupDist.about.isFunction).toBe(false);
          expect(groupDist.about.isGroup).toBe(true);

          expect(groupDist.value).toEqual(groupRules.exportJSON());

          const distProps = Reflect.ownKeys(groupDist);
          distProps.sort();
          expect(distProps).toEqual(["about", "value"]);
        }
      });

      it("for a constructor", async function() {
        await getValue("Element");
        const valueRules = getRules(OGM.getSelectedPanel(), "value");

        OGM.prototypeRadio.click();
        const protoRules = getRules(OGM.getSelectedPanel(), "proto");

        OGM.instanceRadio.click();
        {
          const panel = OGM.getSelectedPanel();
          let source = panel.exampleEditor.getValue();
          source = source.replace("ctor()", `ctor({}, "foo")`);
          panel.exampleEditor.setValue(source);
          const submitButton = panel.getElementsByClassName("submitButton")[0];

          submitButton.click();
          await MessageEventPromise(window, "instanceof panel initialized");
        }
        const instanceRules = getRules(OGM.getSelectedPanel(), "instance");

        await updateMetadata();
        expect(distortions.length).toBe(1);

        const docDist = distortions[0];
        expect(docDist.about.valueName).toBe("parts.dry.Element");
        expect(docDist.about.isFunction).toBe(true);
        expect("getExample" in docDist.about).toBe(true);

        expect(docDist.value).toEqual(valueRules.exportJSON());
        expect(docDist.proto).toEqual(protoRules.exportJSON());
        expect(docDist.instance).toEqual(instanceRules.exportJSON());

        const distProps = Reflect.ownKeys(docDist);
        distProps.sort();
        expect(distProps).toEqual(["about", "instance", "proto", "value"]);
      });
    });
  });

  describe("has good syntax in the downloadable JavaScript", function() {
    var counter;
    beforeEach(function() {
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

    it("in a baseline configuration", async function() {
      await getGUIMocksPromise([]);
      await testScriptForSyntax();
    });

    it("with handler manipulation", async function() {
      await getGUIMocksPromise([]);
      await membranePanelSelect();
      window.HandlerNames.setRow(2, "damp", true);

      await linkUpdatePromise();
      await testScriptForSyntax();
    });

    it("with membrane pass-through manipulation", async function() {
      await getGUIMocksPromise([]);
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

    it("with an actual object graph", async function() {
      await getValue("doc");
      const docPanel = OGM.getSelectedPanel();
      const docRules = getRules(docPanel, "value");
      {
        const propList = Object.freeze([
          "addEventListener",
          "dispatchEvent",
          "handleEventAtTarget",
          "createElement",
          "insertBefore",
        ]);

        propList.forEach(function(propName) {
          const button = getGroupButton(docPanel, propName);
          button.appendChild(window.document.createTextNode("methods"));
        });

        const button = getGroupButton(docPanel, "addEventListener");
        const link = button.nextElementSibling;
        const p = MessageEventPromise(
          window, "openDistortionsGroup: property group panel created"
        );

        link.click();
        await p;
      }

      await linkUpdatePromise();
      await testScriptForSyntax();
    });
  });
});
