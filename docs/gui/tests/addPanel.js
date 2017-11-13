describe("Add Panel Operations:", function() {
  var window;
  beforeEach(async function() {
    await getDocumentLoadPromise("base/gui/index.html");
    window = testFrame.contentWindow;
    window.StartPanel.testMode = true;
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
    "provides each object with its own tab in the files tabbox, and resources",
    async function() {
      {
        let p = getGUIMocksPromise(["doc", "doc.rootElement", "Element"]);
        await p;
      }
      const OGM = window.OuterGridManager;

      {
        OGM.addPanelRadio.click();
        window.AddValuePanel.sourceGraphSelect.selectedIndex = 1;
        window.AddValuePanel.targetGraphSelect.selectedIndex = 0;
        window.AddValuePanel.form.nameOfValue.value = "parts.wet.foo";
        window.AddValuePanel.getValueEditor.setValue("() => {}");

        {
          let isValid = window.AddValuePanel.form.checkValidity();
          expect(isValid).toBe(true);
          if (!isValid)
            return;
        }

        let p = BlobLoaderPromise(window.DistortionsGUI.iframeBox);
        window.DistortionsGUI.buildValuePanel();
        await p;
      }

      // tabs: labels for objects
      {
        const tabs = OGM.filesTabbox;
        let labels = tabs.getElementsByTagName("label");
        expect(labels.length).toBe(7);
        expect(getText(labels[0])).toBe("Start");
        expect(getText(labels[labels.length - 2])).toBe("Add Value");
        expect(getText(labels[labels.length - 1])).toBe("Output");

        expect(getText(labels[1])).toBe("parts.wet.foo");
        expect(getText(labels[2])).toBe("parts.dry.doc");
        expect(getText(labels[3])).toBe("parts.dry.doc.rootElement");
        expect(getText(labels[4])).toBe("parts.dry.Element");
      }

      // tabs: object graph names by group
      {
        const tabs = OGM.filesTabbox;
        const GNC = OGM.graphNamesCache;
        const groups = tabs.getElementsByClassName("tabgroup");
        {
          expect(groups.length).toBe(2);
          expect(getText(groups[0])).toBe("wet"); // first named graph
          expect(getText(groups[1])).toBe("dry");

          expect(Array.isArray(GNC.items)).toBe(true);
          expect(GNC.items.length).toBe(2);
          expect(GNC.items[0]).toBe("wet");
          expect(GNC.items[1]).toBe("dry");
        }

        {
          const labelElems = GNC.labelElements;
          expect(labelElems.length).toBe(2);
          expect(groups[0]).toBe(labelElems[0]);
          expect(groups[1]).toBe(labelElems[1]);

          expect(getColumnCount(labelElems[0])).toBe(1);
          expect(getColumnCount(labelElems[1])).toBe(3);

          expect(Array.isArray(GNC.radioElementCounts)).toBe(true);
          expect(GNC.radioElementCounts.length).toBe(2);
          expect(GNC.radioElementCounts[0]).toBe(1);
          expect(GNC.radioElementCounts[1]).toBe(3);
        }
      }
    }
  );
});
