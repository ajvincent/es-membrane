function styleAndMoveTreeColumns(gridtree) {
  "use strict";
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

  if (!gridtree.hasAttribute("id"))
    throw new Error("gridtree needs an ID attribute");
  const gridId = gridtree.getAttribute("id");

  gridtree.firstElementChild.style.display = "none";

  const sheet = getCustomStylesheet(document);

  // Step 1:  Mark all the ul elements as a row block.
  {
    let lists = gridtree.getElementsByTagName("ul");
    
    const listDigits = Math.max(1, Math.ceil(Math.log(lists.length) / Math.log(10)));
    // ten digits means ten billion possible:  probably more than memory can safely hold
    const zeros = "0000000000"; 
    for (let i = 0; i < lists.length; i++) {
      let digits = (zeros + i.toString(10)).substr(-listDigits);
      lists[i].setAttribute("rowblock", digits);
    }
  }

  // Step 2:  Bind each collapsible-check input to the appropriate row block by CSS selectors.
  {
    let inputs = gridtree.getElementsByClassName("collapsible-check");
    for (let i = 0; i < inputs.length; i++) {
      let input = inputs[i], ul = input.parentNode.lastElementChild;
      if (ul.nodeName.toLowerCase() != "ul")
        continue;
      let ruleText = `#${gridId} > .rowblock-${ul.getAttribute("rowblock")}`;
      ruleText += " {\n  display: none;\n}";
      let ruleHandler = new CSSRuleEventHandler(sheet, input, ruleText, false);
      input.addEventListener("change", ruleHandler, true);
      ruleHandler.handleEvent({ target: input });

      // create binding for DOM as well
      input.previousElementSibling.collapseCheckbox = input;
    }
  }

  // Step 3:  Ensure each li element has the same number of span elements.
  const gridCellsByRow = [ /*
    [ span+ ], [ span+ ]... one span for each cell, one array for each row
  */ ];
  {
    let items = gridtree.getElementsByTagName("li");
    let widthRule = `#${gridId} {\n  grid-template-columns: `;
    {
      let currentRow = [], item = items[0];
      gridCellsByRow.push(currentRow);
      item.setAttribute("row", 0);
      for (let j = item.firstElementChild; j; j = j.nextElementSibling) {
        if (j.nodeName.toLowerCase() == "span") {
          currentRow.push(j);
          widthRule += j.dataset.columnWidth + " ";
        }
      }
      Object.freeze(currentRow);
    }
    const minSpanCount = gridCellsByRow[0].length;
    widthRule += `;\n  width: ${gridtree.dataset.width};\n}`;
    sheet.insertRule(widthRule, 0);
    
    for (let i = 1; i < items.length; i++) {
      let currentRow = [];
      gridCellsByRow.push(currentRow);

      let item = items[i], refChild = item.lastElementChild;
      item.setAttribute("row", i);
      if (refChild.nodeName.toLowerCase() != "ul")
        refChild = null;
      let spanCount = 0;
      for (let j = item.firstElementChild; j; j = j.nextElementSibling) {
        if (j.nodeName.toLowerCase() == "span") {
          spanCount++;
          currentRow.push(j);
        }
      }
      while (spanCount < minSpanCount) {
        let span = document.createElement("span");
        item.insertBefore(span, refChild);
        spanCount++;
        currentRow.push(span);
      }

      Object.freeze(currentRow);
    }
  }

  /* XXX ajvincent If we were concerned with dynamically modifying the rows of
   * the tree, this is not how I would get cells. But the contents of the grid
   * are static, so for convenience of testing, I am keeping this simple.
   */
  Object.freeze(gridCellsByRow);
  Reflect.defineProperty(gridtree, "__cellsByRow__", {
    value: gridCellsByRow,
    writable: false,
    enumerable: false,
    configurable: false
  });

  /*
  if (CSS.supports("display", "subgrid"))
    gridtree.setAttribute("rowdisplay", "subgrid");
  else
  */
  if (CSS.supports("display", "contents"))
  {
    gridtree.setAttribute("cellgrouping", "row-contents");

    // Step 4:  Move all contents of each li (excluding ul) to a new row.
    let items = gridtree.getElementsByTagName("li");
    for (let i = 0; i < items.length; i++) {
      let item = items[i], spanCount = 0;

      let row = document.createElement("div");
      row.setAttribute("row", item.getAttribute("row"));
      if (item.classList.contains("header"))
        row.classList.add("header");

      let ul = item.parentNode, indent = 0;
      do {
        let className = "rowblock-" + ul.getAttribute("rowblock");
        if (ul.parentNode.classList.contains("collapsible"))
          row.classList.add(className);
        if (ul.parentNode.classList.contains("treeroot"))
          break;
        ul = ul.parentNode.parentNode;
        indent++;
      } while (true);

      row.setAttribute("indent", indent);
      gridtree.appendChild(row);

      while (true) {
        let elem = item.firstElementChild;
        if (elem === null)
          break;
        let name = elem.localName.toLowerCase();
        if (name === "ul")
          break;
        if (name === "span")
        {
          spanCount++;
          if (spanCount === 1) {
            let firstSpan = document.createElement("span");
            row.appendChild(firstSpan);
            firstSpan.appendChild(elem);
          }
          else
            row.appendChild(elem);
        }
        else if ((name === "input") &&
                 (spanCount === 1) &&
                 elem.classList.contains("collapsible-check") &&
                 item.classList.contains("collapsible"))
        {
          row.firstChild.insertBefore(elem, row.firstChild.firstChild);
        }
        else
          row.appendChild(elem);
      }

      {
        let spacer = document.createElement("span");
        spacer.classList.add("spacer");
        let firstCell = row.firstElementChild;
        firstCell.insertBefore(spacer, firstCell.firstChild);
      }
    }
  }
  else {
    gridtree.setAttribute("cellgrouping", "none");

    // the second span in each listitem
    const listitemMap = new Map();
  
    // Step 4:  Assign class names to li > span:not(first-child) elements and append them to the grid.
    {
      let spanList = gridtree.getElementsByTagName("span");
      for (let i = 0; i < spanList.length; i++) {
        let span = spanList[i], parent = span.parentNode;
        if (parent.nodeName.toLowerCase() != "li")
          continue;
        if (span.previousElementSibling === null)
          continue;
  
        span.setAttribute("row", parent.getAttribute("row"));
        if (parent.classList.contains("header"))
          span.classList.add("header");
  
        // Beyond this point, we are committed.
        i--;
        let ul = parent.parentNode;
        do {
          let className = "rowblock-" + ul.getAttribute("rowblock");
          span.classList.add(className);
          if (ul.parentNode.classList.contains("treeroot"))
            break;
          ul = ul.parentNode.parentNode;
        } while (true);
        gridtree.appendChild(span);
  
        if (!listitemMap.has(parent))
          listitemMap.set(parent, span);
      }
    }
  
    // Step 5:  Move li contents to the grid.
    {
      let items = gridtree.getElementsByTagName("li");
      for (let i = 0; i < items.length; i++) {
        let item = items[i],
            span = document.createElement("span"),
            checkSpan = document.createElement("span"),
            child;
        checkSpan.setAttribute("checkspan", "true");
        span.setAttribute("row", item.getAttribute("row"));
        if (item.classList.contains("header"))
          span.classList.add("header");
        span.setAttribute("firstCol", "true");
  
        while ((child = item.firstElementChild)) {
          if (child.nodeName.toLowerCase() === "ul")
            break;
          
          if (child.classList.contains("collapsible-check") &&
              item.classList.contains("collapsible") &&
              !checkSpan.parentNode) {
            span.insertBefore(checkSpan, span.firstChild);
            span.insertBefore(child, checkSpan);
            continue;
          }
  
          span.appendChild(child);
        }
  
        let ul = item.parentNode, indent = 0;
        do {
          let className = "rowblock-" + ul.getAttribute("rowblock");
          span.classList.add(className);
          if (ul.parentNode.classList.contains("treeroot"))
            break;
          ul = ul.parentNode.parentNode;
          indent++;
        } while (true);
        span.setAttribute("indent", indent);

        {
          let spacer = document.createElement("span");
          spacer.classList.add("spacer");
          let firstCell = span;
          firstCell.insertBefore(spacer, firstCell.firstChild);
        }
  
        let refChild = listitemMap.get(item);
        gridtree.insertBefore(span, refChild);
        listitemMap.delete(item);
      }
    }
  }

  // DOM properties.  This API should be considered unstable, but is mainly for testing.
  gridtree.getRowCount = function() {
    return this.__cellsByRow__.length;
  };
  gridtree.getColumnCount = function() {
    return this.__cellsByRow__[0].length;
  };

  Reflect.defineProperty(gridtree, "__ensureValidRow__", {
    value: function(row) {
      if (!Number.isInteger(row) || (row < 0) || (row >= this.__cellsByRow__.length))
        throw new Error("row must be an integer between 0 and " + (this.__cellsByRow__.length - 1));
    },
    writable: false,
    enumerable: false,
    configurable: false
  });

  gridtree.getCell = function(row, col) {
    this.__ensureValidRow__(row);
    if (!Number.isInteger(col) || (col < 0) || (col >= this.__cellsByRow__[0].length))
      throw new Error("col must be an integer between 0 and " + (this.__cellsByRow__[0].length - 1));

    return this.__cellsByRow__[row][col];
  };

  gridtree.getCollapseState = function(row) {
    this.__ensureValidRow__(row);
    let cell = this.getCell(row, 0);
    if (!cell.collapseCheckbox)
      return "not collapsible";
    return cell.collapseCheckbox.checked ? "expanded" : "collapsed";
  };

  gridtree.setCollapsed = function(row, state) {
    this.__ensureValidRow__(row);
    if (typeof state !== "boolean")
      throw new Error("state must be true or false");
    let cell = this.getCell(row, 0);
    if (!cell.collapseCheckbox)
      throw new Error("row is not collapsible");
    if (state === cell.collapseCheckbox.checked)
      cell.collapseCheckbox.click();
  };

  // Final step:  Remove the tree, since it no longer contains useful information.
  gridtree.removeChild(gridtree.firstElementChild);
}
