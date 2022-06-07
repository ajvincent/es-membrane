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

  describe(
    "The graph handler names API requires at least two distinct names (either symbols or strings)",
    function() {
      function validateControls() {
        window.HandlerNames.update();
        const inputs = window.MembranePanel.form.getElementsByClassName("objectgraph-name");
        const rv = [];
        const length = inputs.length;
        for (let i = 0; i < length; i++) {
          rv.push(inputs[i].checkValidity());
          expect(inputs[i].nextElementSibling.disabled).toBe(length == 2);
        }
        return rv;
      }

      it("initial state is disallowed for two inputs", function() {
        const states = validateControls();
        expect(states.length).toBe(2);
        expect(states[0]).toBe(false);
        expect(states[1]).toBe(false);
      });

      it("allows a name to be an unique string", function() {
        const inputs = window.MembranePanel.form.getElementsByClassName("objectgraph-name");
        inputs[0].value = "foo";
        inputs[1].value = "bar";

        const states = validateControls();
        expect(states.length).toBe(2);
        expect(states[0]).toBe(true);
        expect(states[1]).toBe(true);
      });

      it("clicking on the addRow button really does add a new row", function() {
        window.HandlerNames.addRow();
        const inputs = window.MembranePanel.form.getElementsByClassName("objectgraph-name");
        inputs[0].value = "foo";
        inputs[1].value = "bar";

        const states = validateControls();
        expect(states.length).toBe(3);
        expect(states[0]).toBe(true);
        expect(states[1]).toBe(true);
        expect(states[2]).toBe(false);
      });

      it("disallows non-unique strings", function() {
        window.HandlerNames.addRow();
        const inputs = window.MembranePanel.form.getElementsByClassName("objectgraph-name");
        inputs[0].value = "foo";
        inputs[1].value = "bar";
        inputs[2].value = "foo";

        const states = validateControls();
        expect(states.length).toBe(3);
        expect(states[0]).toBe(true);
        expect(states[1]).toBe(true);
        expect(states[2]).toBe(false);
      });

      it("allows removing a row", function() {
        window.HandlerNames.addRow();
        const inputs = window.MembranePanel.form.getElementsByClassName("objectgraph-name");
        inputs[0].value = "foo";
        inputs[1].value = "bar";
        inputs[2].value = "baz";

        inputs[0].nextElementSibling.click();
        expect(inputs.length).toBe(2);
        expect(inputs[0].value).toBe("bar");
        expect(inputs[1].value).toBe("baz");

        const states = validateControls();
        expect(states.length).toBe(2);
        expect(states[0]).toBe(true);
        expect(states[1]).toBe(true);
      });

      it("allows a symbol to share a name with a string", function() {
        window.HandlerNames.addRow();
        const inputs = window.MembranePanel.form.getElementsByClassName("objectgraph-name");
        inputs[0].value = "foo";
        inputs[1].value = "bar";
        inputs[2].value = "foo";
        inputs[2].previousElementSibling.firstElementChild.checked = true; // symbol

        const states = validateControls();
        expect(states.length).toBe(3);
        expect(states[0]).toBe(true);
        expect(states[1]).toBe(true);
        expect(states[2]).toBe(true);
      });

      it("allows two symbols to share a name", function() {
        window.HandlerNames.addRow();
        const inputs = window.MembranePanel.form.getElementsByClassName("objectgraph-name");
        inputs[0].value = "foo";
        inputs[1].value = "bar";
        inputs[2].value = "foo";
        inputs[0].previousElementSibling.firstElementChild.checked = true; // symbol
        inputs[2].previousElementSibling.firstElementChild.checked = true; // symbol

        const states = validateControls();
        expect(states.length).toBe(3);
        expect(states[0]).toBe(true);
        expect(states[1]).toBe(true);
        expect(states[2]).toBe(true);
      });
    }
  );
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
