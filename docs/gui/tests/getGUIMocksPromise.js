async function getGUIMocksPromise(propNames) {
  var window = testFrame.contentWindow;

  window.LoadPanel.testMode = { fakeFiles: true };
  {
    let p1 = MessageEventPromise(window, "MembranePanel initialized");
    let p2 = MessageEventPromise(
      window, "MembranePanel cached configuration reset"
    );
    window.OuterGridManager.membranePanelRadio.click();
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
    let p = MessageEventPromise(window, "AddValuePanel initialized");
    window.MembranePanel.configureMembrane();
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
    let p1 = MessageEventPromise(window, "OutputPanel initialized");
    let p2 = MessageEventPromise(window, "OutputPanel updated download links");
    window.OuterGridManager.outputPanelRadio.click();
    await Promise.all([p1, p2]);
  }
}
