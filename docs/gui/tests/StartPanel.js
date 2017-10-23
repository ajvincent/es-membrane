describe("Start Panel Operations:", function() {
  var window;
  beforeEach(function() {
    window = testFrame.contentWindow;
    window.StartPanel.testMode = true;
  });

  function getErrorMessage() {
    let output = window.StartPanel.configFileError;
    if (!output.firstChild)
      return null;
    return output.firstChild.nodeValue;
  }

  it("starts with no graph names and two rows", function() {
    // two delete buttons and one add button
    {
      let buttons = window.HandlerNames.grid.getElementsByTagName("button");
      expect(buttons.length).toBe(3);
      for (let i = 0; i < buttons.length; i++) {
        expect(buttons[i].disabled).toBe(i < buttons.length - 1);
      }
    }

    const [graphNames, graphSymbolLists] =
      window.HandlerNames.serializableNames();
    expect(Array.isArray(graphNames)).toBe(true);
    expect(Array.isArray(graphSymbolLists)).toBe(true);
    expect(graphNames.length).toBe(0);
    expect(graphSymbolLists.length).toBe(0);

    expect(getErrorMessage()).toBe(null);
  });

  it("can build a fresh configuration with test mode", async function() {
    await getGUIMocksPromise(["doc"]);
    const loaders = [];
    {
      let iframe = window.DistortionsGUI.iframeBox.firstElementChild;
      while (iframe) {
        loaders.push(iframe.contentWindow.BlobLoader);
        iframe = iframe.nextElementSibling;
      }
    }

    expect(loaders.length).toBe(1);
    expect(loaders[0].validated).toBe(true);
    expect(loaders[0].errorFired).toBe(false);
    expect(loaders[0].getValue().nodeType).toBe(9);

    expect(getErrorMessage()).toBe(null);
  });

  it("can import a configuration with test mode", async function() {
    let p1 = MessageEventPromise(window, "addValue initialized");
    let p2 = window.StartPanel.startWithConfigFile(`{
      "graphNames": ["wet", "dry", "damp"],
      "graphSymbolLists": [2]
    }`);
    await Promise.all([p1, p2]);

    let [graphNames, graphSymbolLists] = window.HandlerNames.serializableNames();
    expect(graphNames).toEqual(["wet", "dry", "damp"]);
    expect(graphSymbolLists).toEqual([2]);

    expect(getErrorMessage()).toBe(null);
    const OGM = window.OuterGridManager;
    expect(OGM.selectedTabs.file).toBe(OGM.addPanelRadio);
  });

  describe("informs the error of configuration file errors", function() {
    async function expectError(jsonSource) {
      let exnThrown = false;
      try {
        await window.StartPanel.startWithConfigFile(jsonSource);
      }
      catch (e) {
        exnThrown = true;
      }
      if (!exnThrown) {
        throw new Error("no exception caught from startWithConfigFile");
      }
    }

    it("with a not-well-formed JSON file", async function() {
      await expectError(`{
        "graphNames": ["wet", "dry", "damp"],
        "graphSymbolLists": [2]
      `); // missing closing brace

      expect(getErrorMessage()).not.toBe(null);
      const OGM = window.OuterGridManager;
      expect(OGM.selectedTabs.file).not.toBe(OGM.addPanelRadio);
    });
    
    it("with graphNames not being an array", async function() {
      await expectError(`{
        "graphNames": 4,
        "graphSymbolLists": [2]
      }`);

      expect(getErrorMessage()).toBe("config.graphNames must be an array of strings");
      const OGM = window.OuterGridManager;
      expect(OGM.selectedTabs.file).not.toBe(OGM.addPanelRadio);
    });

    it("with graphSymbolLists not being an array", async function() {
      await expectError(`{
        "graphNames": ["wet", "dry", "damp"],
        "graphSymbolLists": 2
      }`);

      expect(getErrorMessage()).toBe(
        "config.graphSymbolLists must be an ordered array of unique non-negative integers, each member of which is less than config.graphNames.length"
      );
      const OGM = window.OuterGridManager;
      expect(OGM.selectedTabs.file).not.toBe(OGM.addPanelRadio);
    });

    it("with graphSymbolLists holding a number too big", async function() {
      await expectError(`{
        "graphNames": ["wet", "dry", "damp"],
        "graphSymbolLists": [3]
      }`);

      expect(getErrorMessage()).toBe(
        "config.graphSymbolLists must be an ordered array of unique non-negative integers, each member of which is less than config.graphNames.length"
      );
      const OGM = window.OuterGridManager;
      expect(OGM.selectedTabs.file).not.toBe(OGM.addPanelRadio);
    });

    it("with graphSymbolLists holding a number too small", async function() {
      await expectError(`{
        "graphNames": ["wet", "dry", "damp"],
        "graphSymbolLists": [-1]
      }`);

      expect(getErrorMessage()).toBe(
        "config.graphSymbolLists must be an ordered array of unique non-negative integers, each member of which is less than config.graphNames.length"
      );
      const OGM = window.OuterGridManager;
      expect(OGM.selectedTabs.file).not.toBe(OGM.addPanelRadio);
    });

    it("with graphSymbolLists holding a number not an integer", async function() {
      await expectError(`{
        "graphNames": ["wet", "dry", "damp"],
        "graphSymbolLists": [0.5]
      }`);

      expect(getErrorMessage()).toBe(
        "config.graphSymbolLists must be an ordered array of unique non-negative integers, each member of which is less than config.graphNames.length"
      );
      const OGM = window.OuterGridManager;
      expect(OGM.selectedTabs.file).not.toBe(OGM.addPanelRadio);
    });

    it("with graphSymbolLists holding a string value", async function() {
      await expectError(`{
        "graphNames": ["wet", "dry", "damp"],
        "graphSymbolLists": ["wet"]
      }`);

      expect(getErrorMessage()).toBe(
        "config.graphSymbolLists must be an ordered array of unique non-negative integers, each member of which is less than config.graphNames.length"
      );
      const OGM = window.OuterGridManager;
      expect(OGM.selectedTabs.file).not.toBe(OGM.addPanelRadio);
    });

    it("with graphSymbolLists holding a duplicate value", async function() {
      await expectError(`{
        "graphNames": ["wet", "dry", "damp"],
        "graphSymbolLists": [2, 2]
      }`);

      expect(getErrorMessage()).toBe(
        "config.graphSymbolLists must be an ordered array of unique non-negative integers, each member of which is less than config.graphNames.length"
      );
      const OGM = window.OuterGridManager;
      expect(OGM.selectedTabs.file).not.toBe(OGM.addPanelRadio);
    });

    it("with graphSymbolLists holding a value out of order", async function() {
      await expectError(`{
        "graphNames": ["wet", "dry", "damp"],
        "graphSymbolLists": [2, 1]
      }`);

      expect(getErrorMessage()).toBe(
        "config.graphSymbolLists must be an ordered array of unique non-negative integers, each member of which is less than config.graphNames.length"
      );
      const OGM = window.OuterGridManager;
      expect(OGM.selectedTabs.file).not.toBe(OGM.addPanelRadio);
    });

    it("with dumplicate non-symbol graphNames", async function() {
      await expectError(`{
        "graphNames": ["wet", "dry", "wet"],
        "graphSymbolLists": []
      }`);

      expect(getErrorMessage()).toBe(
        `config.graphNames[2] = "wet", but this string name appears earlier in config.graphNames`
      );
      const OGM = window.OuterGridManager;
      expect(OGM.selectedTabs.file).not.toBe(OGM.addPanelRadio);
    });
  });
});
