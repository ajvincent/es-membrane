describe("Secondary distortions", function() {
  "use strict";
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

  function getGroupButton(panel, keyName) {
    const rules = getRules(panel);
    const row = getRowForProperty(panel, keyName);
    const cell = rules.gridtree.getCell(row, groupCol);
    return cell.firstElementChild;
  }

  // Yes, magic numbers suck.  Deal with it.
  const groupCol = 3;

  it("can open a new panel for a known property", async function() {
    const docPanel = OGM.getSelectedPanel();
    const doc = getRules(docPanel).value;
    {
      const button = getGroupButton(docPanel, "rootElement");
      const link = button.nextElementSibling;
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

      const button = getGroupButton(panel, "ownerDocument");
      const link = button.nextElementSibling;
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

  it("can open a new panel for a group of properties", async function() {
    const docPanel = OGM.getSelectedPanel();
    const doc = getRules(docPanel).value;

    const propList = Object.freeze([
      "addEventListener",
      "dispatchEvent",
      "handleEventAtTarget",
      "createElement",
      "insertBefore",
    ]);

    propList.forEach(function(propName) {
      const button = getGroupButton(docPanel, propName);
      button.appendChild(window.document.createTextNode("methods"));
    });

    {
      const button = getGroupButton(docPanel, "addEventListener");
      const link = button.nextElementSibling;
      const p = MessageEventPromise(
        window, "openDistortionsGroup: property group panel created"
      );

      link.click();
      await p;
    }

    {
      const panel = OGM.getSelectedPanel();
      const properties = panel.getElementsByClassName("propertyName");
      expect(properties.length).toBe(0);
      const rules = getRules(panel);
      expect(Boolean(rules)).toBe(true);
      expect(rules.value).toBe(undefined);
    }
  });
});
