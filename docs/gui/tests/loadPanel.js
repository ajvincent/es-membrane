describe("Load Panel Operations with faked flat files", function() {
  /* The "faked" flat files are meant to simulate what happens with real files.
   * These tests can't actually set real files in the HTML file inputs.
   */
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

  function expectImportSuccess() {
    return Promise.all([
      MessageEventPromise(
        window,
        "MembranePanel cached configuration reset",
        "MembranePanel exception thrown in reset"
      ),
      chooseMembranePanel()
    ]);
  }

  it("can import a simple configuration with test mode", async function() {
    window.LoadPanel.testMode.configSource = `{
      "configurationSetup": {
        "useZip": false,
        "commonFiles": [],
        "formatVersion": 1,
        "lastUpdated": "Mon, 19 Feb 2018 20:56:56 GMT"
      },
      "membrane": {
        "passThroughSource": "",
        "passThroughEnabled": false,
        "primordialsPass": false
      },
      "graphs": [
        {
          "name": "wet",
          "isSymbol": false,
          "passThroughSource": "",
          "passThroughEnabled": false,
          "primordialsPass": false,
          "distortions": []
        },

        {
          "name": "dry",
          "isSymbol": false,
          "passThroughSource": "",
          "passThroughEnabled": false,
          "primordialsPass": false,
          "distortions": []
        },

        {
          "name": "damp",
          "isSymbol": true,
          "passThroughSource": "",
          "passThroughEnabled": false,
          "primordialsPass": false,
          "distortions": []
        }
      ]
    }`;
    await expectImportSuccess();

    /* Invalid test:  we've already built a valid configuration with
     * window.LoadPanel.testMode = {fakeFiles: true};
     * in the beforeEach() call.
    expect(window.LoadPanel.commonFileURLs.size).toBe(0);
    */

    let [graphNames, graphSymbolLists] = window.HandlerNames.serializableNames();
    expect(graphNames).toEqual(["wet", "dry", "damp"]);
    expect(graphSymbolLists).toEqual([2]);

    const valid = window.MembranePanel.form.checkValidity();
    expect(valid).toBe(true);
  });

  it("can build a fresh configuration with test mode", async function() {
    await getGUIMocksPromise(["doc"]);
    expect(window.LoadPanel.commonFileURLs.size).toBeGreaterThan(0);

    const BlobLoader = window.DistortionsManager.BlobLoader;
    expect(BlobLoader.valuesByName.get("parts.dry.doc").nodeType).toBe(9);

    expect(getErrorMessage()).toBe(null);
  });

  describe("tests for configuration file errors in the graphs property", function() {
    async function expectError(jsonSource) {
      window.LoadPanel.testMode.configSource = jsonSource;
      let p1 = MessageEventPromise(
        window,
        "MembranePanel exception thrown in reset",
        "MembranePanel cached configuration reset"
      );
      await Promise.all([p1, chooseMembranePanel()]);
      expect(OGM.selectedTabs.file).toBe(OGM.membranePanelRadio);
    }

    it("with a not-well-formed JSON file", async function() {
      await expectError(`{
        "configurationSetup": {
          "useZip": false,
          "commonFiles": [],
          "formatVersion": 1,
          "lastUpdated": "Mon, 19 Feb 2018 20:56:56 GMT"
        },
        "membrane": {
          "passThroughSource": "",
          "passThroughEnabled": false,
          "primordialsPass": false
        },
        "graphs": [
          {
            "name": "wet",
            "isSymbol": false,
            "passThroughSource": "",
            "passThroughEnabled": false,
            "primordialsPass": false,
            "distortions": []
          },
  
          {
            "name": "dry",
            "isSymbol": false,
            "passThroughSource": "",
            "passThroughEnabled": false,
            "primordialsPass": false,
            "distortions": []
          },
  
          {
            "name": "damp",
            "isSymbol": true,
            "passThroughSource": "",
            "passThroughEnabled": false,
            "primordialsPass": false,
            "distortions": []
          }
        ]
      `); // missing closing brace

      expect(getErrorMessage()).not.toBe(null);
    });

    it("with graphs not being an array", async function() {
      await expectError(`{
        "configurationSetup": {
          "useZip": false,
          "commonFiles": [],
          "formatVersion": 1,
          "lastUpdated": "Mon, 19 Feb 2018 20:56:56 GMT"
        },
        "membrane": {
          "passThroughSource": "",
          "passThroughEnabled": false,
          "primordialsPass": false
        },
        "graphs": 4
      }`);

      expect(getErrorMessage()).toBe(
        "config.graphs must be an array of objects"
      );
    });

    it("with duplicate non-symbol graphNames", async function() {
      await expectError(`{
        "configurationSetup": {
          "useZip": false,
          "commonFiles": [],
          "formatVersion": 1,
          "lastUpdated": "Mon, 19 Feb 2018 20:56:56 GMT"
        },
        "membrane": {
          "passThroughSource": "",
          "passThroughEnabled": false,
          "primordialsPass": false
        },
        "graphs": [
          {
            "name": "wet",
            "isSymbol": false,
            "passThroughSource": "",
            "passThroughEnabled": false,
            "primordialsPass": false,
            "distortions": []
          },
  
          {
            "name": "dry",
            "isSymbol": false,
            "passThroughSource": "",
            "passThroughEnabled": false,
            "primordialsPass": false,
            "distortions": []
          },
  
          {
            "name": "wet",
            "isSymbol": false,
            "passThroughSource": "",
            "passThroughEnabled": false,
            "primordialsPass": false,
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
        "configurationSetup": {
          "useZip": false,
          "commonFiles": [],
          "formatVersion": 1,
          "lastUpdated": "Mon, 19 Feb 2018 20:56:56 GMT"
        },
        "membrane": {
          "passThroughSource": "",
          "passThroughEnabled": false,
          "primordialsPass": false
        },
        "graphs": [
          {
            "name": "wet",
            "isSymbol": false,
            "passThroughSource": "",
            "passThroughEnabled": false,
            "primordialsPass": false
          },
  
          {
            "name": "dry",
            "isSymbol": false,
            "passThroughSource": "",
            "passThroughEnabled": false,
            "primordialsPass": false,
            "distortions": []
          },
  
          {
            "name": "damp",
            "isSymbol": true,
            "passThroughSource": "",
            "passThroughEnabled": false,
            "primordialsPass": false,
            "distortions": []
          }
        ]
      }`);
      expect(getErrorMessage()).toBe(
        `config.graphs[0].distortions must be an array.`
      );
    });

    it("with a distortions property not an array", async function() {
      await expectError(`{
        "configurationSetup": {
          "useZip": false,
          "commonFiles": [],
          "formatVersion": 1,
          "lastUpdated": "Mon, 19 Feb 2018 20:56:56 GMT"
        },
        "membrane": {
          "passThroughSource": "",
          "passThroughEnabled": false,
          "primordialsPass": false
        },
        "graphs": [
          {
            "name": "wet",
            "isSymbol": false,
            "passThroughSource": "",
            "passThroughEnabled": false,
            "primordialsPass": false,
            "distortions": []
          },
  
          {
            "name": "dry",
            "isSymbol": false,
            "passThroughSource": "",
            "passThroughEnabled": false,
            "primordialsPass": false,
            "distortions": false
          },
  
          {
            "name": "damp",
            "isSymbol": true,
            "passThroughSource": "",
            "passThroughEnabled": false,
            "primordialsPass": false,
            "distortions": []
          }
        ]
      }`);
      expect(getErrorMessage()).toBe(
        `config.graphs[1].distortions must be an array.`
      );
    });

    describe("with a set of distortions rules: ", function() {
      function getFullConfig(middle) {
        return `{
          "configurationSetup": {
            "useZip": false,
            "commonFiles": [],
            "formatVersion": 1,
            "lastUpdated": "Mon, 19 Feb 2018 20:56:56 GMT"
          },
          "membrane": {
            "passThroughSource": "",
            "passThroughEnabled": false,
            "primordialsPass": false
          },
          "graphs": [
            {
              "name": "wet",
              "isSymbol": false,
              "passThroughSource": "",
              "passThroughEnabled": false,
              "primordialsPass": false,
              "distortions": [${middle}]
            },
    
            {
              "name": "dry",
              "isSymbol": false,
              "passThroughSource": "",
              "passThroughEnabled": false,
              "primordialsPass": false,
              "distortions": []
            },
    
            {
              "name": "damp",
              "isSymbol": true,
              "passThroughSource": "",
              "passThroughEnabled": false,
              "primordialsPass": false,
              "distortions": []
            }
          ]
        }`;
      }

      const errPrefix = 'config.graphs[0].distortions[0]';
      let valid;
      beforeEach(function() {
        valid = {
          "about": {
            "valueName": "ObjectGraphHandler",
            "isFunction": true,
            "getExample": "return ObjectGraphHandler;"
          },
          "value": {
            "formatVersion": "0.8.2",
            "dataVersion": "0.1",
            "filterOwnKeys": [
            ],
            "proxyTraps": [
            ],
            "storeUnknownAsLocal": true,
            "requireLocalDelete": true,
            "useShadowTarget": false,
            "truncateArgList": false
          }
        };
      });

      async function runTestForFailure(errPostfix) {
        await expectError(getFullConfig(JSON.stringify(valid)));
        expect(getErrorMessage()).toBe(`${errPrefix}${errPostfix}`);
      }

      it("and a minimal (but valid) configuration", async function() {
        const config = getFullConfig(JSON.stringify(valid));
        window.LoadPanel.testMode.configSource = config;
        await expectImportSuccess();

        expect(getErrorMessage()).toBe(null);
      });

      it("missing about.valueName", async function() {
        delete valid.about.valueName;
        await runTestForFailure(".about.valueName must be of type string.");
      });

      it("missing about.getExample", async function() {
        delete valid.about.getExample;
        await runTestForFailure(
          `.about must have at least one of these properties: "getExample", "filterToMatch", "getInstance"`
        );
      });

      it("with about.filterToMatch and about.getExample", async function() {
        valid.about.filterToMatch = "return false;";
        await runTestForFailure(
          `.about may have getExample and/or getInstance, xor filterToMatch`
        );
      });      

      it("with about.filter and about.getInstance", async function() {
        delete valid.about.getExample;
        valid.about.filterToMatch = "return false;";
        valid.about.getInstance = "return new ObjectGraphHandler;"
        await runTestForFailure(
          `.about may have getExample and/or getInstance, xor filterToMatch`
        );
      });

      it("with a group name and getExample", async function() {
        valid.about.valueName = "[methods]";
        await runTestForFailure(
          ".about must not have getExample for a group configuration"
        );
      });

      it("with a group name and filterToMatch", async function() {
        valid.about.valueName = "[methods]";
        delete valid.about.getExample;
        valid.about.filterToMatch = "return false;";
        await runTestForFailure(
          ".about must not have filterToMatch for a group configuration"
        );
      });

      it("with a group name and getInstance", async function() {
        valid.about.valueName = "[methods]";
        delete valid.about.getExample;
        valid.about.getInstance = "return new ObjectGraphHandler;"
        await runTestForFailure(
          ".about must not have getInstance for a group configuration"
        );
      });

      it("with a group name and no getters or filters", async function() {
        valid.about.valueName = "[methods]";
        delete valid.about.getExample;
        await expectImportSuccess();

        expect(getErrorMessage()).toBe(null);
      });

      it("missing isFunction", async function() {
        delete valid.about.isFunction;
        await runTestForFailure(".about.isFunction must be of type boolean.");
      });

      it("missing value", async function() {
        delete valid.value;
        await runTestForFailure(" must have a property besides about.");
      });

      it("wrong type: about.valueName", async function() {
        valid.about.valueName = true;
        await runTestForFailure(".about.valueName must be of type string.");
      });

      it("wrong type: about.getExample", async function() {
        valid.about.getExample = true;
        await runTestForFailure(".about.getExample must be of type string.");
      });

      it("wrong type: about.isFunction", async function() {
        valid.about.isFunction = "foo";
        await runTestForFailure(".about.isFunction must be of type boolean.");
      });

      it("wrong type: value", async function() {
        valid.value = "foo";
        await runTestForFailure(".value must be of type object.");
      });
    });
  });
});

describe("Load Panel Operations with zip archives", function() {
  "use strict";
  var window, OGM;

  beforeEach(async function() {
    await getDocumentLoadPromise("base/gui/index.html");
    window = testFrame.contentWindow;
    window.LoadPanel.testMode = {};
    OGM = window.OuterGridManager;
  });

  afterEach(function() {
    window = null;
    OGM = null;
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

  function getCheckbox(relPath) {
    return window.LoadPanel.zipData.map.get(relPath).checkbox;
  }

  it("generates a valid gridtree and form from test files", async function() {
    await window.LoadPanel.setTestModeZip();
    const fileList = window.LoadPanel.zipForm.elements.selectFile;
    expect(fileList.length).toBe(5);
    expect(fileList[0].value).toBe("browser/assert.js");
    expect(fileList[1].value).toBe("browser/es-membrane.js");
    expect(fileList[2].value).toBe("browser/fireJasmine.js");
    expect(fileList[3].value).toBe("browser/mocks.js");
    expect(fileList[4].value).toBe("browser/sharedUtilities.js");
  });

  it(
    "pre-selects files listed in configuration when zip file loads first",
    async function() {
      await window.LoadPanel.setTestModeZip();

      window.LoadPanel.testMode.configSource = `{
        "configurationSetup": {
          "useZip": true, 
          "commonFiles": [
            "browser/assert.js",
            "browser/sharedUtilities.js",
            "browser/es-membrane.js",
            "browser/mocks.js"
          ],
          "formatVersion": 1.0,

          "lastUpdated": "2017-12-13T00:00:00.000Z"
        },

        "membrane": {
          "passThroughSource": "",
          "passThroughEnabled": false,
          "primordialsPass": false
        },

        "graphs": [
        ]
      }\n`;

      await window.LoadPanel.update("fromConfig");

      // Probably redundant, but it doesn't hurt to check.
      expect(window.LoadPanel.commonFileURLs.size).toBeGreaterThan(0);

      expect(getCheckbox("browser/assert.js").checked).toBe(true);
      expect(getCheckbox("browser/es-membrane.js").checked).toBe(true);
      expect(getCheckbox("browser/fireJasmine.js").checked).toBe(false);
      expect(getCheckbox("browser/mocks.js").checked).toBe(true);
      expect(getCheckbox("browser/sharedUtilities.js").checked).toBe(true);

      const fileList = window.LoadPanel.getCommonFileOrdering();
      expect(fileList).toEqual([
        "browser/assert.js",
        "browser/sharedUtilities.js",
        "browser/es-membrane.js",
        "browser/mocks.js"
      ]);
    }
  );

  it(
    "pre-selects files listed in configuration when configuration file loads first",
    async function() {
      window.LoadPanel.testMode.configSource = `{
        "configurationSetup": {
          "useZip": true, 
          "commonFiles": [
            "browser/assert.js",
            "browser/sharedUtilities.js",
            "browser/es-membrane.js",
            "browser/mocks.js"
          ],
          "formatVersion": 1.0,

          "lastUpdated": "2017-12-13T00:00:00.000Z"
        },

        "membrane": {
          "passThroughSource": "",
          "passThroughEnabled": false,
          "primordialsPass": false
        },

        "graphs": [
        ]
      }\n`;
      await window.LoadPanel.update("fromConfig");

      await window.LoadPanel.setTestModeZip();
      await window.LoadPanel.update("fromZip");

      // Probably redundant, but it doesn't hurt to check.
      expect(window.LoadPanel.commonFileURLs.size).toBeGreaterThan(0);

      expect(getCheckbox("browser/assert.js").checked).toBe(true);
      expect(getCheckbox("browser/es-membrane.js").checked).toBe(true);
      expect(getCheckbox("browser/fireJasmine.js").checked).toBe(false);
      expect(getCheckbox("browser/mocks.js").checked).toBe(true);
      expect(getCheckbox("browser/sharedUtilities.js").checked).toBe(true);

      const fileList = window.LoadPanel.getCommonFileOrdering();
      expect(fileList).toEqual([
        "browser/assert.js",
        "browser/sharedUtilities.js",
        "browser/es-membrane.js",
        "browser/mocks.js"
      ]);
    }
  );

  it(
    "does not pre-select files listed in configuration when configuration file has useZip: false",
    async function() {
      window.LoadPanel.testMode.configSource = `{
        "configurationSetup": {
          "useZip": false, 
          "commonFiles": [
            "browser/assert.js",
            "browser/sharedUtilities.js",
            "browser/es-membrane.js",
            "browser/mocks.js"
          ],
          "formatVersion": 1.0,

          "lastUpdated": "2017-12-13T00:00:00.000Z"
        },

        "membrane": {
          "passThroughSource": "",
          "passThroughEnabled": false,
          "primordialsPass": false
        },

        "graphs": [
        ]
      }\n`;
      window.LoadPanel.testMode.fakeFiles = true;
      await window.LoadPanel.update("fromConfig");
      expect(window.LoadPanel.commonFileURLs.size).toBeGreaterThan(0);

      await window.LoadPanel.setTestModeZip();

      /* This is an interesting case:  useZip: false means files should load from the
       * flat files interface.  But we just specified a zip file.  This behavior
       * shouldn't be supported.
       */
      /*
      expect(window.LoadPanel.commonFileURLs.size).toBe(0);
      */

      expect(getCheckbox("browser/assert.js").checked).toBe(false);
      expect(getCheckbox("browser/es-membrane.js").checked).toBe(false);
      expect(getCheckbox("browser/fireJasmine.js").checked).toBe(false);
      expect(getCheckbox("browser/mocks.js").checked).toBe(false);
      expect(getCheckbox("browser/sharedUtilities.js").checked).toBe(false);
    }
  );
});
