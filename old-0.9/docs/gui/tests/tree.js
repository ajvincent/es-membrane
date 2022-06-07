describe("Tree widget", function() {
  {
    let pass = false;
    try {
      if (Boolean(CSS) && (typeof CSS.supports === "function")) 
        pass = CSS.supports("display", "grid");
    }
    catch (e) {
      // do nothing
    }
    if (!pass)
      return;
  }

  function getTextOfCell(row, col) {
    let cell = gTree.getCell(row, col);
    return cell.firstChild ? cell.firstChild.nodeValue : "";
  }
  function isRowVisible(row) {
    return gTree.getCell(row, 0).getBoundingClientRect().height > 0;
  }

  var window, gTree;
  beforeEach(async function() {
    await getDocumentLoadPromise("base/gui/tests/tree-fixture.html");
    await new MessageEventPromise(testFrame.contentWindow, "tree fixture initialized");
    window = testFrame.contentWindow;
    gTree = window.document.getElementById("gTree");
  });

  afterEach(function() {
    window = null;
    gTree = null;
  });

  it("has a tree with display: grid", function() {    
    const display = window.getComputedStyle(gTree).display;
    expect(display).toBe("grid");
  });

  it("arranges the cells in document order", function() {
    expect(gTree.getRowCount()).toBe(9);
    expect(gTree.getColumnCount()).toBe(3);
    
    expect(getTextOfCell(0, 0)).toBe("Month / Year");
    expect(getTextOfCell(0, 1)).toBe("Amount Paid");
    expect(getTextOfCell(0, 2)).toBe("Payment Date");
    expect(gTree.getCollapseState(0)).toBe("not collapsible");

    expect(getTextOfCell(1, 0)).toBe("2018");
    expect(getTextOfCell(1, 1)).toBe("");
    expect(getTextOfCell(1, 2)).toBe("");
    expect(gTree.getCollapseState(1)).toBe("expanded");

    expect(getTextOfCell(2, 0)).toBe("February");
    expect(getTextOfCell(2, 1)).toBe("");
    expect(getTextOfCell(2, 1)).toBe("");
    expect(gTree.getCollapseState(2)).toBe("expanded");

    expect(getTextOfCell(3, 0)).toBe("1st Payment");
    expect(getTextOfCell(3, 1)).toBe("$150.00");
    expect(getTextOfCell(3, 2)).toBe("February 12");
    expect(gTree.getCollapseState(3)).toBe("not collapsible");

    expect(getTextOfCell(4, 0)).toBe("2nd Payment");
    expect(getTextOfCell(4, 1)).toBe("$200.00");
    expect(getTextOfCell(4, 2)).toBe("February 6");
    expect(gTree.getCollapseState(4)).toBe("not collapsible");

    expect(getTextOfCell(5, 0)).toBe("January");
    expect(getTextOfCell(5, 1)).toBe("$348.00");
    expect(getTextOfCell(5, 2)).toBe("January 17");
    expect(gTree.getCollapseState(5)).toBe("not collapsible");

    expect(getTextOfCell(6, 0)).toBe("2017");
    expect(getTextOfCell(6, 1)).toBe("");
    expect(getTextOfCell(6, 2)).toBe("");
    expect(gTree.getCollapseState(6)).toBe("expanded");

    expect(getTextOfCell(7, 0)).toBe("December");
    expect(getTextOfCell(7, 1)).toBe("$390.00");
    expect(getTextOfCell(7, 2)).toBe("December 29");
    expect(gTree.getCollapseState(7)).toBe("not collapsible");

    expect(getTextOfCell(8, 0)).toBe("November");
    expect(getTextOfCell(8, 1)).toBe("$260.00");
    expect(getTextOfCell(8, 2)).toBe("November 3");
    expect(gTree.getCollapseState(8)).toBe("not collapsible");

    for (let i = 0; i < 9; i++)
      expect(isRowVisible(i)).toBe(true);
  });

  it("correctly supports collapsing tree rows", function() {
    gTree.setCollapsed(1, true); // 2018
    for (let i = 0; i < 9; i++) {
      expect(isRowVisible(i)).toBe((i < 2) || (i > 5));
    }

    gTree.setCollapsed(1, true); // repeating test to be sure rule wasn't broken
    for (let i = 0; i < 9; i++) {
      expect(isRowVisible(i)).toBe((i < 2) || (i > 5));
    }

    gTree.setCollapsed(2, true); // February
    for (let i = 0; i < 9; i++) {
      expect(isRowVisible(i)).toBe((i < 2) || (i > 5));
    }

    gTree.setCollapsed(1, false);
    for (let i = 0; i < 9; i++) {
      expect(isRowVisible(i)).toBe((i < 3) || (i > 4));
    }

    gTree.setCollapsed(1, false); // repeating test to be sure rule wasn't broken
    for (let i = 0; i < 9; i++) {
      expect(isRowVisible(i)).toBe((i < 3) || (i > 4));
    }

    gTree.setCollapsed(2, false); // repeating test to be sure rule wasn't broken
    for (let i = 0; i < 9; i++) {
      expect(isRowVisible(i)).toBe(true);
    }
  });
});
