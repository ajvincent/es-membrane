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
  });
});
