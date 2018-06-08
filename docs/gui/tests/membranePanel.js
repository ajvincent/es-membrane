describe("Membrane Panel Operations with flat files:", function() {
  "use strict";
  var window;

  beforeEach(async function() {
    await getDocumentLoadPromise("base/gui/index.html");
    window = testFrame.contentWindow;
    window.LoadPanel.testMode = {fakeFiles: true};

    let p1 = MessageEventPromise(window, "MembranePanel initialized");
    let p2 = MessageEventPromise(
      window, "MembranePanel cached configuration reset"
    );
    window.OuterGridManager.membranePanelRadio.click();
    await Promise.all([p1, p2]);
  });

  function getErrorMessage() {
    let output = window.OuterGridManager.currentErrorOutput;
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

  it("supports the pass-through function for the membrane", function() {
    const editor = window.MembranePanel.passThroughEditor;
    {
      expect(window.MembranePanel.passThroughCheckbox.checked).toBe(false);
      expect(window.MembranePanel.primordialsCheckbox.checked).toBe(false);
      expect(window.MembranePanel.primordialsCheckbox.disabled).toBe(true);
      expect(window.CodeMirrorManager.getEditorEnabled(editor)).toBe(false);
    }

    {
      window.MembranePanel.passThroughCheckbox.click();
      expect(window.MembranePanel.passThroughCheckbox.checked).toBe(true);
      expect(window.MembranePanel.primordialsCheckbox.disabled).toBe(false);
      expect(window.CodeMirrorManager.getEditorEnabled(editor)).toBe(true);
    }

    {
      window.MembranePanel.primordialsCheckbox.click();
      expect(window.MembranePanel.passThroughCheckbox.checked).toBe(true);
      expect(window.MembranePanel.primordialsCheckbox.checked).toBe(true);
      expect(window.MembranePanel.primordialsCheckbox.disabled).toBe(false);
      expect(window.CodeMirrorManager.getEditorEnabled(editor)).toBe(true);

      const prelim = "(function() {\n  const items = Membrane.Primordials.slice(0);\n\n";
      const value = window.MembranePanel.getPassThrough(true);
      expect(value.startsWith(prelim)).toBe(true);
    }

    {
      window.MembranePanel.primordialsCheckbox.click();
      expect(window.MembranePanel.passThroughCheckbox.checked).toBe(true);
      expect(window.MembranePanel.primordialsCheckbox.checked).toBe(false);
      expect(window.MembranePanel.primordialsCheckbox.disabled).toBe(false);
      expect(window.CodeMirrorManager.getEditorEnabled(editor)).toBe(true);
    }

    {
      window.MembranePanel.passThroughCheckbox.click();
      expect(window.MembranePanel.passThroughCheckbox.checked).toBe(false);
      expect(window.MembranePanel.primordialsCheckbox.checked).toBe(false);
      expect(window.MembranePanel.primordialsCheckbox.disabled).toBe(true);
      expect(window.CodeMirrorManager.getEditorEnabled(editor)).toBe(false);
    }
  });
});

it("Membrane Panel supports pass-through function", async function() {
  await getDocumentLoadPromise("base/gui/index.html");
  const window = testFrame.contentWindow;
  window.LoadPanel.testMode = {
    fakeFiles: true,
    configSource: `{
      "configurationSetup": {
        "useZip": false,
        "commonFiles": [],
        "formatVersion": 1,
        "lastUpdated": "Mon, 19 Feb 2018 20:56:56 GMT"
      },
      "membrane": {
        "passThroughSource": "  // hello world",
        "passThroughEnabled": true,
        "primordialsPass": true
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
        }
      ]
    }`
  };

  let p1 = MessageEventPromise(window, "MembranePanel initialized");
  let p2 = MessageEventPromise(
    window,
    "MembranePanel cached configuration reset",
    "MembranePanel exception thrown in reset"
  );
  window.OuterGridManager.membranePanelRadio.click();
  await Promise.all([p1, p2]);

  expect(window.MembranePanel.passThroughCheckbox.checked).toBe(true);
  expect(window.MembranePanel.primordialsCheckbox.checked).toBe(true);
  expect(window.MembranePanel.getPassThrough()).toContain("// hello world");
});
