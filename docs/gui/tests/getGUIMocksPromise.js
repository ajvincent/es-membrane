async function getGUIMocksPromise(propNames) {
  const window = testFrame.contentWindow;
  const OGM = window.OuterGridManager;

  window.LoadPanel.testMode = { fakeFiles: true };
  window.LoadPanel.setTestModeFiles();
  window.LoadPanel.testMode.cachedConfig = `{
    "configurationSetup": {
      "useZip": false,
      "commonFiles": ${JSON.stringify(window.LoadPanel.testMode.requiredFiles.slice(0))},
      "formatVersion": "1.0"
    }
  }`;
  window.LoadPanel.buildFileOrderTree();

  {
    let p1 = MessageEventPromise(window, "MembranePanel initialized");
    let p2 = MessageEventPromise(
      window, "MembranePanel cached configuration reset"
    );
    OGM.membranePanelRadio.click();
    await Promise.all([p1, p2]);
  }

  // This part is synchronous:  if it fails, we're dead anyway.
  {
    window.HandlerNames.setRow(0, "wet", false);
    window.HandlerNames.setRow(1, "dry", false);
    window.HandlerNames.update();

    {
      let isValid = window.HandlerNames.graphNamesForm.checkValidity();
      expect(isValid).toBe(true);
      if (!isValid)
        throw new Error("graphNames form is not valid");
    }
  }

  {
    let p1 = MessageEventPromise(
      window, "OuterGridManager: object graphs defined"
    );
    let p2 = MessageEventPromise(
      window, "Graph panel shown: graphpanel-0"
    );
    OGM.defineGraphs();
    await Promise.all([p1, p2]);
    expect(OGM.graphNamesCache.lastVisibleGraph).not.toBe(null);
    expect(OGM.selectedTabs.file).toBe(OGM.graphNamesCache.lastVisibleGraph.radio);

    /* Assume for now that the controllers and HTML content are set up
     * correctly:  there should be a separate test for this.
     */
  }

  const dryController = OGM.graphNamesCache.controllers[1];
  for (let i = 0; i < propNames.length; i++)
  {
    const name = propNames[i];

    let p = MessageEventPromise(
      window, "Graph panel shown: graphpanel-1"
    );
    dryController.radio.click();
    await p;
    expect(OGM.graphNamesCache.lastVisibleGraph).toBe(dryController);
    expect(OGM.selectedTabs.file).toBe(dryController.radio);

    dryController.nameOfValue.value = `parts.dry.${name}`;
    dryController.valueGetterEditor.setValue(
      `function() {\n  return MembraneMocks().dry.${name};\n}\n`
    );

    let isValid = dryController.newValueForm.checkValidity();
    expect(isValid).toBe(true);
    if (!isValid)
      return;

    await window.DistortionsGUI.buildValuePanel();
  };

  {
    let p1 = MessageEventPromise(window, "OutputPanel initialized");
    let p2 = MessageEventPromise(window, "OutputPanel updated download links");
    window.OuterGridManager.outputPanelRadio.click();
    await Promise.all([p1, p2]);
  }
}
