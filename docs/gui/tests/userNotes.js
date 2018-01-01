describe("User notes", function() {
  "use strict";
  var window, OGM, DM;

  beforeEach(function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;
    const iframe = document.getElementsByTagName("iframe")[0];
    iframe.setAttribute("width", "800");
    iframe.setAttribute("height", "600");
  });

  beforeEach(async function() {
    await getDocumentLoadPromise("base/gui/index.html");
    await getGUIMocksPromise(["doc"]);
    window = testFrame.contentWindow;
    OGM = window.OuterGridManager;
    DM = window.DistortionsManager;

    const graphRadio = OGM.graphNamesCache.firstRadioElements[1];
    graphRadio.nextElementSibling.nextElementSibling.click();
  });

  afterEach(function() {
    window = null;
    OGM = null;
    DM = null;
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

  function getNotesLink(panel, keyName) {
    const rules = getRules(panel);
    const row = getRowForProperty(panel, keyName);
    const cell = rules.gridtree.getCell(row, notesCol);
    return cell.firstElementChild;
  }

  // Yes, magic numbers suck.  Deal with it.
  const notesCol = 2;

  it("can accept user input", function() {
    const docPanel = OGM.getSelectedPanel();
    const rules = getRules(docPanel);
    {
      const exp = rules.exportJSON();
      expect("notesPerKey" in exp).toBe(false);
    }

    const textareaList = OGM.helpAndNotes.getElementsByTagName("textarea");
    expect(textareaList.length).toBe(0);

    getNotesLink(docPanel, "nodeName").click();
    expect(textareaList.length).toBe(1);
    expect(OGM.selectedHelpAndNotesPanel).toBe(textareaList[0]);

    textareaList[0].value = "The name of the node.";

    {
      const exp = rules.exportJSON();
      expect("notesPerKey" in exp).toBe(true);
      expect("nodeName" in exp.notesPerKey).toBe(true);
      expect(exp.notesPerKey.nodeName).toBe("The name of the node.");
    }

    getNotesLink(docPanel, "nodeType").click();

    expect(textareaList.length).toBe(2);
    expect(OGM.selectedHelpAndNotesPanel).toBe(textareaList[1]);

    textareaList[1].value = "The type of the node.";

    {
      const exp = rules.exportJSON();
      expect("notesPerKey" in exp).toBe(true);
      expect("nodeName" in exp.notesPerKey).toBe(true);
      expect(exp.notesPerKey.nodeName).toBe("The name of the node.");
      expect("nodeType" in exp.notesPerKey).toBe(true);
      expect(exp.notesPerKey.nodeType).toBe("The type of the node.");
    }
  });
});
