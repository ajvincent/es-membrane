describe("Start Panel Operations:", function() {
  var window;
  beforeEach(function() {
    window = testFrame.contentWindow;
    window.StartPanel.testMode = true;
  });

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
  });

  it("can build a fresh configuration with test mode", function() {
    window.HandlerNames.setRow(0, "wet", false);
    window.HandlerNames.setRow(1, "dry", false);
    window.HandlerNames.update();

    const isValid = window.StartPanel.graphNamesForm.checkValidity();
    expect(isValid).toBe(true);
    if (!isValid)
      return;

    window.StartPanel.startWithGraphNames();

    expect(window.OuterGridManager.selectedTabs.file).toBe(window.OuterGridManager.addPanelRadio);
  });
});
