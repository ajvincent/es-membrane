describe("Load Panel Operations:", function() {
  "use strict";
  var window, OGM;

  beforeEach(async function() {
    await getDocumentLoadPromise("base/gui/index.html");
    window = testFrame.contentWindow;
    window.LoadPanel.testMode = {fakeFiles: true};
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
      "configurationSetup": {},
      "graphs": [
        {
          "name": "wet",
          "isSymbol": false,
          "distortions": []
        },

        {
          "name": "dry",
          "isSymbol": false,
          "distortions": []
        },

        {
          "name": "damp",
          "isSymbol": true,
          "distortions": []
        }
      ]
    }`;
    await chooseMembranePanel();
    let temp = await window.LoadPanel.getConfiguration();

    let [graphNames, graphSymbolLists] = window.HandlerNames.serializableNames();
    expect(graphNames).toEqual(["wet", "dry", "damp"]);
    expect(graphSymbolLists).toEqual([2]);

    expect(getErrorMessage()).toBe(null);

    const valid = window.MembranePanel.form.checkValidity();
    expect(valid).toBe(true);
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
        "configurationSetup": {},
        "graphs": [
          {
            "name": "wet",
            "isSymbol": false,
            "distortions": []
          },
  
          {
            "name": "dry",
            "isSymbol": false,
            "distortions": []
          },
  
          {
            "name": "damp",
            "isSymbol": true,
            "distortions": []
          }
        ]
      `); // missing closing brace

      expect(getErrorMessage()).not.toBe(null);
    });
    
    it("with graphs not being an array", async function() {
      await expectError(`{
        "graphs": 4
      }`);

      expect(getErrorMessage()).toBe(
        "config.graphs must be an array of objects"
      );
    });

    it("with duplicate non-symbol graphNames", async function() {
      await expectError(`{
        "configurationSetup": {},
        "graphs": [
          {
            "name": "wet",
            "isSymbol": false,
            "distortions": []
          },
  
          {
            "name": "dry",
            "isSymbol": false,
            "distortions": []
          },
  
          {
            "name": "wet",
            "isSymbol": false,
            "distortions": []
          }
        ]
      }`);

      expect(getErrorMessage()).toBe(
        `config.graphs[2].name = "wet", but this name appears earlier in config.graphs, and neither name is a symbol`
      );
    });

    it("with a missing distortions property", async function() {
      await expectError(`{
        "configurationSetup": {},
        "graphs": [
          {
            "name": "wet",
            "isSymbol": false
          },
  
          {
            "name": "dry",
            "isSymbol": false,
            "distortions": []
          },
  
          {
            "name": "damp",
            "isSymbol": true,
            "distortions": []
          }
        ]
      }`);
      expect(getErrorMessage()).toBe(
        `config.graphs[0].distortions must be an array`
      );
    });

    it("with a distortions property not an array", async function() {
      await expectError(`{
        "configurationSetup": {},
        "graphs": [
          {
            "name": "wet",
            "isSymbol": false,
            "distortions": []
          },
  
          {
            "name": "dry",
            "isSymbol": false,
            "distortions": false
          },
  
          {
            "name": "damp",
            "isSymbol": true,
            "distortions": []
          }
        ]
      }`);
      expect(getErrorMessage()).toBe(
        `config.graphs[1].distortions must be an array`
      );
    });

    describe("with a set of distortions rules: ", function() {
      function getFullConfig(middle) {
        return `{
          "configurationSetup": {},
          "graphs": [
            {
              "name": "wet",
              "isSymbol": false,
              "distortions": [${middle}]
            },
    
            {
              "name": "dry",
              "isSymbol": false,
              "distortions": []
            },
    
            {
              "name": "damp",
              "isSymbol": true,
              "distortions": []
            }
          ]
        }`;
      }

      const errPrefix = 'config.graphs[0].distortions[0]';
      let valid;
      beforeEach(function() {
        valid = {
          "name": "ObjectGraphHandler",
          "source": "function() {\n  return ObjectGraphHandler;\n};\n",
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

      it("rules.value is missing", async function() {
        delete valid.rules.value;
        await runTestForFailure(".rules.value must be an object");
      });
    });
  });

});
