describe("Load Panel Operations:", function() {
  "use strict";
  var window, OGM;

  beforeEach(async function() {
    await getDocumentLoadPromise("base/gui/index.html");
    window = testFrame.contentWindow;
    window.LoadPanel.testMode = {};
    OGM = window.OuterGridManager;
  });

  function getErrorMessage() {
    let output = window.OuterGridManager.currentErrorOutput;
    if (!output.firstChild || (output.firstChild.nodeValue === ""))
      return null;
    return output.firstChild.nodeValue;
  }

  function chooseMembranePanel() {
    let p = MessageEventPromise(window, "MembranePanel initialized");
    OGM.membranePanelRadio.click();
    return p;
  }

  it("can build a fresh configuration with test mode", async function() {
    await getGUIMocksPromise(["doc"]);
    const BlobLoader = window.DistortionsManager.BlobLoader;
    expect(BlobLoader.valuesByName.get("parts.dry.doc").nodeType).toBe(9);

    expect(getErrorMessage()).toBe(null);
  });

  it("can import a simple configuration with test mode", async function() {
    window.LoadPanel.testMode.configSource = `{
      "graphNames": ["wet", "dry", "damp"],
      "graphSymbolLists": [2],
      "distortionsByGraph": [
        [],
        [],
        []
      ]
    }`;
    await chooseMembranePanel();

    let [graphNames, graphSymbolLists] = window.HandlerNames.serializableNames();
    expect(graphNames).toEqual(["wet", "dry", "damp"]);
    expect(graphSymbolLists).toEqual([2]);

    expect(getErrorMessage()).toBe(null);

    const valid = window.MembranePanel.form.checkValidity();
    expect(valid).toBe(true);

    if (!valid)
      return;

    let p1 = MessageEventPromise(
      window, "OuterGridManager: object graphs defined"
    );
    let p2 = MessageEventPromise(
      window, "Graph panel shown: graphpanel-0"
    );
    window.MembranePanel.form.submit();
    await Promise.all([p1, p2]);

    expect(OGM.graphNamesCache.lastVisibleGraph).not.toBe(null);
    expect(OGM.selectedTabs.file).toBe(OGM.graphNamesCache.lastVisibleGraph.radio);
  });

  describe("tests for configuration file errors", function() {
    async function expectError(jsonSource) {
      window.LoadPanel.testMode.configSource = jsonSource;
      let p1 = MessageEventPromise(
        window, "MembranePanel exception thrown in reset"
      );
      await Promise.all([p1, chooseMembranePanel()]);
      expect(OGM.selectedTabs.file).toBe(OGM.membranePanelRadio);
    }

    it("with a not-well-formed JSON file", async function() {
      await expectError(`{
        "graphNames": ["wet", "dry", "damp"],
        "graphSymbolLists": [2]
      `); // missing closing brace

      expect(getErrorMessage()).not.toBe(null);
    });
    
    it("with graphNames not being an array", async function() {
      await expectError(`{
        "graphNames": 4,
        "graphSymbolLists": [2]
      }`);

      expect(getErrorMessage()).toBe(
        "config.graphNames must be an array of strings"
      );
    });

    it("with graphSymbolLists not being an array", async function() {
      await expectError(`{
        "graphNames": ["wet", "dry", "damp"],
        "graphSymbolLists": 2
      }`);

      expect(getErrorMessage()).toBe(
        "config.graphSymbolLists must be an ordered array of unique non-negative integers, each member of which is less than config.graphNames.length"
      );
    });

    it("with graphSymbolLists holding a number too big", async function() {
      await expectError(`{
        "graphNames": ["wet", "dry", "damp"],
        "graphSymbolLists": [3]
      }`);

      expect(getErrorMessage()).toBe(
        "config.graphSymbolLists must be an ordered array of unique non-negative integers, each member of which is less than config.graphNames.length"
      );
    });

    it("with graphSymbolLists holding a number too small", async function() {
      await expectError(`{
        "graphNames": ["wet", "dry", "damp"],
        "graphSymbolLists": [-1]
      }`);

      expect(getErrorMessage()).toBe(
        "config.graphSymbolLists must be an ordered array of unique non-negative integers, each member of which is less than config.graphNames.length"
      );
    });

    it("with graphSymbolLists holding a number not an integer", async function() {
      await expectError(`{
        "graphNames": ["wet", "dry", "damp"],
        "graphSymbolLists": [0.5]
      }`);

      expect(getErrorMessage()).toBe(
        "config.graphSymbolLists must be an ordered array of unique non-negative integers, each member of which is less than config.graphNames.length"
      );
    });

    it("with graphSymbolLists holding a string value", async function() {
      await expectError(`{
        "graphNames": ["wet", "dry", "damp"],
        "graphSymbolLists": ["wet"]
      }`);

      expect(getErrorMessage()).toBe(
        "config.graphSymbolLists must be an ordered array of unique non-negative integers, each member of which is less than config.graphNames.length"
      );
    });

    it("with graphSymbolLists holding a duplicate value", async function() {
      await expectError(`{
        "graphNames": ["wet", "dry", "damp"],
        "graphSymbolLists": [2, 2]
      }`);

      expect(getErrorMessage()).toBe(
        "config.graphSymbolLists must be an ordered array of unique non-negative integers, each member of which is less than config.graphNames.length"
      );
    });

    it("with graphSymbolLists holding a value out of order", async function() {
      await expectError(`{
        "graphNames": ["wet", "dry", "damp"],
        "graphSymbolLists": [2, 1]
      }`);

      expect(getErrorMessage()).toBe(
        "config.graphSymbolLists must be an ordered array of unique non-negative integers, each member of which is less than config.graphNames.length"
      );
    });

    it("with duplicate non-symbol graphNames", async function() {
      await expectError(`{
        "graphNames": ["wet", "dry", "wet"],
        "graphSymbolLists": []
      }`);

      expect(getErrorMessage()).toBe(
        `config.graphNames[2] = "wet", but this string name appears earlier in config.graphNames`
      );
    });

    it("with a missing graphDistortions property", async function() {
      await expectError(`{
        "graphNames": ["wet", "dry"],
        "graphSymbolLists": []
      }`);
      expect(getErrorMessage()).toBe(
        `config.distortionsByGraph must be an array with length 2 of arrays`
      );
    });

    it("with a graphDistortions property not an array", async function() {
      await expectError(`{
        "graphNames": ["wet", "dry", "damp"],
        "graphSymbolLists": [],
        "graphDistortions": false
      }`);
      expect(getErrorMessage()).toBe(
        `config.distortionsByGraph must be an array with length 3 of arrays`
      );
    });

    it(
      "with a graphDistortions array containing a non-array",
      async function() {
        await expectError(`{
          "graphNames": ["wet", "dry"],
          "graphSymbolLists": [],
          "graphDistortions": [[], false]
        }`);
        expect(getErrorMessage()).toBe(
          `config.distortionsByGraph must be an array with length 2 of arrays`
        );
      }
    );

    it(
      "with a graphDistortions array containing the wrong number of arrays",
      async function() {
        await expectError(`{
          "graphNames": ["wet", "dry"],
          "graphSymbolLists": [],
          "graphDistortions": [[]]
        }`);
        expect(getErrorMessage()).toBe(
          `config.distortionsByGraph must be an array with length 2 of arrays`
        );
      }
    );

    it(
      "can progress after fixing the error",
      async function() {
        await expectError(`{
          "graphNames": ["wet", "dry"],
          "graphSymbolLists": [],
          "graphDistortions": [[]]
        }`);
        OGM.loadPanelRadio.click();

        window.LoadPanel.testMode.configSource = `{
          "graphNames": ["wet", "dry", "damp"],
          "graphSymbolLists": [2],
          "distortionsByGraph": [
            [],
            [],
            []
          ]
        }`;

        let p = MessageEventPromise(
          window, "MembranePanel cached configuration reset"
        );
        OGM.membranePanelRadio.click();
        await p;
    
        let [graphNames, graphSymbolLists] = window.HandlerNames.serializableNames();
        expect(graphNames).toEqual(["wet", "dry", "damp"]);
        expect(graphSymbolLists).toEqual([2]);
    
        expect(getErrorMessage()).toBe(null);
    
        const valid = window.MembranePanel.form.checkValidity();
        expect(valid).toBe(true);
    
        if (!valid)
          return;

        let p1 = MessageEventPromise(
          window, "OuterGridManager: object graphs defined"
        );
        let p2 = MessageEventPromise(
          window, "Graph panel shown: graphpanel-0"
        );
        window.MembranePanel.form.submit();
        await Promise.all([p1, p2]);

        expect(OGM.graphNamesCache.lastVisibleGraph).not.toBe(null);
        expect(OGM.selectedTabs.file).toBe(OGM.graphNamesCache.lastVisibleGraph.radio);
      }
    );

    describe("with a set of distortions rules: ", function() {
      function getFullConfig(middle) {
        return `{
          "graphNames": ["wet", "dry"],
          "graphSymbolLists": [],
          "distortionsByGraph": [
            [],
            [${middle}]
          ]
        }`;
      }

      const errPrefix = 'config.distortionsByGraph[1][0]';
      let valid;
      beforeEach(function() {
        valid = {
          "name": "ObjectGraphHandler",
          "source": "function() {\n  return ObjectGraphHandler;\n};\n",
          "sourceGraphIndex": 0,
          "rules": {
            "value": {
              "formatVersion": "0.8.2",
              "dataVersion": "0.1",
              "filterOwnKeys": [
              ],
              "proxyTraps": [
              ],
              "inheritFilter": true,
              "storeUnknownAsLocal": true,
              "requireLocalDelete": true,
              "useShadowTarget": false,
              "truncateArgList": false
            }
          },
          "hash": "ObjectGraphHandler-1",
          "isFunction": false
        };
      });

      async function runTestForFailure(errPostfix) {
        await expectError(getFullConfig(JSON.stringify(valid)));
  
        expect(getErrorMessage()).toBe(`${errPrefix}${errPostfix}`);
      }

      it("and a minimal configuration", async function() {
        const config = getFullConfig(JSON.stringify(valid));
        window.LoadPanel.testMode.configSource = config;
        await chooseMembranePanel();

        expect(getErrorMessage()).toBe(null);
      });

      it("missing name", async function() {
        delete valid.name;
        await runTestForFailure(".name must be of type string");
      });

      it("missing source", async function() {
        delete valid.source;
        await runTestForFailure(".source must be of type string");
      });

      it("missing hash", async function() {
        delete valid.hash;
        await runTestForFailure(".hash must be of type string");
      });

      it("missing isFunction", async function() {
        delete valid.isFunction;
        await runTestForFailure(".isFunction must be of type boolean");
      });

      it("missing rules", async function() {
        delete valid.rules;
        await runTestForFailure(".rules must be of type object");
      });

      it("wrong type: name", async function() {
        valid.name = function() {};
        await runTestForFailure(".name must be of type string");
      });

      it("wrong type: source", async function() {
        valid.source = function() {};
        await runTestForFailure(".source must be of type string");
      });

      it("wrong type: hash", async function() {
        valid.hash = function() {};
        await runTestForFailure(".hash must be of type string");
      });

      it("wrong type: isFunction", async function() {
        valid.isFunction = function() {};
        await runTestForFailure(".isFunction must be of type boolean");
      });

      it("wrong type: rules", async function() {
        valid.rules = function() {};
        await runTestForFailure(".rules must be of type object");
      });

      it("missing sourceGraphIndex", async function() {
        delete valid.sourceGraphIndex;
        await runTestForFailure(
          ".sourceGraphIndex must be an integer from 0 to 1"
        );
      });

      it("string sourceGraphIndex", async function() {
        valid.sourceGraphIndex = "";
        await runTestForFailure(
          ".sourceGraphIndex must be an integer from 0 to 1"
        );
      });

      it("NaN sourceGraphIndex", async function() {
        valid.sourceGraphIndex = NaN;
        await runTestForFailure(
          ".sourceGraphIndex must be an integer from 0 to 1"
        );
      });

      it("negative sourceGraphIndex", async function() {
        valid.sourceGraphIndex = -1;
        await runTestForFailure(
          ".sourceGraphIndex must be an integer from 0 to 1"
        );
      });

      it("Infinity sourceGraphIndex", async function() {
        valid.sourceGraphIndex = Infinity;
        await runTestForFailure(
          ".sourceGraphIndex must be an integer from 0 to 1"
        );
      });

      it("non-integer sourceGraphIndex", async function() {
        valid.sourceGraphIndex = 0.5;
        await runTestForFailure(
          ".sourceGraphIndex must be an integer from 0 to 1"
        );
      });

      it("sourceGraphIndex too large", async function() {
        valid.sourceGraphIndex = 2;
        await runTestForFailure(
          ".sourceGraphIndex must be an integer from 0 to 1"
        );
      });

      it("sourceGraphIndex matches graphIndex", async function() {
        valid.sourceGraphIndex = 1;
        await runTestForFailure(
          ".sourceGraphIndex cannot be the target graph index 1"
        );
      });

      it("rules.value is missing", async function() {
        delete valid.rules.value;
        await runTestForFailure(".rules.value must be an object");
      });
    });
  });

});
