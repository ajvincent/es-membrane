describe("Secondary distortions", function() {
  var window, OGM, DM;
  beforeEach(async function() {
    await getDocumentLoadPromise("base/gui/index.html");
    await getGUIMocksPromise(["doc"]);
    window = testFrame.contentWindow;
    OGM = window.OuterGridManager;
    DM = window.DistortionsManager;

    const graphRadio = OGM.graphNamesCache.firstRadioElements[1];
    graphRadio.nextElementSibling.nextElementSibling.click();
  });

  function getRowForProperty(panel, keyName) {
    let path = './/*[@row][.//span[contains(@class, "propertyName")]';
    path += `/text()[.="${keyName}"]]`;
    const result = window.document.evaluate(
      path, panel, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
    );
    const elem = result.singleNodeValue;
    return parseInt(elem.getAttribute("row"), 10);
  }

  function getRules(panel) {
    const hash = panel.dataset.hash;
    return DM.valueNameToRulesMap.get(hash).value;
  }

  // Yes, magic numbers suck.  Deal with it.
  const groupCol = 3;

  it("can open a new panel for a known property", async function() {
    const docPanel = OGM.getSelectedPanel();
    let doc;
    {
      const row = getRowForProperty(docPanel, "rootElement");
      const rules = getRules(docPanel);
      doc = rules.value;
      const link = rules.gridtree.getCell(row, groupCol).lastElementChild;
      const p = MessageEventPromise(
        window, "openDistortionsGroup: property panel created"
      );

      link.click();
      await p;
    }

    {
      const panel = OGM.getSelectedPanel();
      const rules = getRules(panel);
      expect(rules.value).toBe(doc.rootElement);

      const row = getRowForProperty(panel, "ownerDocument");

      const link = rules.gridtree.getCell(row, groupCol).lastElementChild;
      const p = MessageEventPromise(
        window, "openDistortionsGroup: existing panel selected"
      );

      link.click();
      await p;
    }

    {
      const panel = OGM.getSelectedPanel();
      const rules = getRules(panel);
      expect(rules.value).toBe(doc);
    }
  });
});
