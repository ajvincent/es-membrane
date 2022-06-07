describe("ObjectGraphManager", function() {
  var window;
  beforeEach(async function() {
    await getDocumentLoadPromise("base/gui/index.html");
    window = testFrame.contentWindow;
    window.LoadPanel.testMode = {fakeFiles: true};
  });

  function getText(elem) {
    let range = elem.ownerDocument.createRange();
    range.selectNodeContents(elem);
    let rv = range.toString();
    range.detach();
    return rv.replace(/^\s*/g, "").replace(/\s*$/g, "");
  }

  function getColumnCount(tabgroup) {
    let end = window.getComputedStyle(tabgroup, null).gridColumnEnd;
    expect(end.startsWith("span ")).toBe(true);
    return parseInt(end.substr(5), 10);
  }

  it(
    "provides each object with its own tab in the files tabbox, and supporting graph tabs",
    async function() {
      await getGUIMocksPromise(["doc", "doc.rootElement", "Element"]);
      const OGM = window.OuterGridManager;

      {
        const wetController = OGM.graphNamesCache.controllers[0];
        wetController.radio.click();
        wetController.nameOfValue.value = "parts.wet.foo";
        wetController.valueGetterEditor.setValue("function() { return {}; }");

        {
          let isValid = wetController.newValueForm.checkValidity();
          expect(isValid).toBe(true);
          if (!isValid)
            return;
        }

        await window.DistortionsGUI.buildValuePanel();
      }

      // tabs: labels for objects
      {
        const tabs = OGM.filesTabbox;
        let labels = tabs.getElementsByTagName("label");
        expect(labels.length).toBe(9);
        expect(getText(labels[0])).toBe("Load");
        expect(getText(labels[1])).toBe("Membrane");
        expect(getText(labels[labels.length - 1])).toBe("Output");

        expect(getText(labels[2])).toBe("(Graph)");
        expect(getText(labels[3])).toBe("parts.wet.foo");
        expect(getText(labels[4])).toBe("(Graph)");
        expect(getText(labels[5])).toBe("parts.dry.doc");
        expect(getText(labels[6])).toBe("parts.dry.doc.rootElement");
        expect(getText(labels[7])).toBe("parts.dry.Element");
      }

      // tabs: object graph names by group
      {
        const tabs = OGM.filesTabbox;
        const GNC = OGM.graphNamesCache;
        const groups = tabs.getElementsByClassName("tabgroup");
        {
          expect(groups.length).toBe(2);
          expect(getText(groups[0])).toBe('"wet"'); // first named graph
          expect(getText(groups[1])).toBe('"dry"');
        }

        {
          const labelElems = GNC.labelElements;
          expect(labelElems.length).toBe(2);
          expect(groups[0]).toBe(labelElems[0]);
          expect(groups[1]).toBe(labelElems[1]);

          expect(getColumnCount(labelElems[0])).toBe(2);
          expect(getColumnCount(labelElems[1])).toBe(4);

          expect(Array.isArray(GNC.radioElementCounts)).toBe(true);
          expect(GNC.radioElementCounts.length).toBe(2);
          expect(GNC.radioElementCounts[0]).toBe(2);
          expect(GNC.radioElementCounts[1]).toBe(4);
        }
      }
    }
  );
});
