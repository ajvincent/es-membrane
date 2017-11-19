async function getGUIMocksPromise(propNames) {
  var window = testFrame.contentWindow;

  // This part is synchronous:  if it fails, we're dead anyway.
  {
    window.HandlerNames.setRow(0, "wet", false);
    window.HandlerNames.setRow(1, "dry", false);
    window.HandlerNames.update();

    {
      let isValid = window.StartPanel.graphNamesForm.checkValidity();
      expect(isValid).toBe(true);
      if (!isValid)
        throw new Error("graphNames form is not valid");
    }
  }

  {
    window.StartPanel.testMode = true;
    let p = MessageEventPromise(window, "addValue initialized");
    window.StartPanel.startWithGraphNames();
    await p;

    const OGM = window.OuterGridManager;
    expect(OGM.selectedTabs.file).toBe(OGM.addPanelRadio);
  }

  for (let i = 0; i < propNames.length; i++)
  {
    const name = propNames[i];
    window.OuterGridManager.addPanelRadio.click();
    window.AddValuePanel.sourceGraphSelect.selectedIndex = 0;
    window.AddValuePanel.targetGraphSelect.selectedIndex = 1;
    window.AddValuePanel.form.nameOfValue.value = `parts.dry.${name}`;
    window.AddValuePanel.getValueEditor.setValue(
      `function() { return MembraneMocks().dry.${name}; }`
    );

    {
      let isValid = window.AddValuePanel.form.checkValidity();
      expect(isValid).toBe(true);
      if (!isValid)
        return;
    }
    await window.DistortionsGUI.buildValuePanel();
  };

  {
    let p = MessageEventPromise(window, "output initialized");
    window.OuterGridManager.outputPanelRadio.click();
    await p;
  }
}
