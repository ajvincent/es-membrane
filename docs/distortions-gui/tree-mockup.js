function getCustomStylesheet() {
  var elem = document.createElement("style");
  document.head.appendChild(elem);
  var comment = document.createComment(
    "This stylesheet exists to hold dynamically created style rules.  " +
    "That's why this is empty.  See tree-mockup.js for details."
  );
  elem.appendChild(comment);
  return elem.sheet;
}

function styleAndMoveTreeColumns(gridtree) {
  "use strict";
  const sheet = getCustomStylesheet(), inputMap = new Map();

  function checkboxListener(event) {
    let input = event.target;
    var ruleText = inputMap.get(input);

    if (input.checked) {
      // this means we've just expanded a collapsed section,
      // so we should remove the CSS rule hiding that section's cells.
      let rules = sheet.cssRules;
      for (let i = 0; i < rules.length; i++) {
        if (rules[i].cssText === ruleText) {
          sheet.deleteRule(i);
          break;
        }
      }
    }
    else {
      // we're collapsing an expanded section, so we should set a rule that
      // hides the row's associated cells.
      sheet.insertRule(ruleText, 0);

      // The browser may modify whitespace on the rule.
      ruleText = sheet.cssRules[0].cssText;
      inputMap.set(input, ruleText);
    }
  }

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
    const gridId = gridtree.getAttribute("id");
    for (let i = 0; i < inputs.length; i++) {
      let input = inputs[i], ul = input.parentNode.lastElementChild;
      if (ul.nodeName.toLowerCase() != "ul")
        continue;
      let ruleText = `#${gridId} > .rowblock-${ul.getAttribute("rowblock")}`;
      ruleText += " {\n  display: none;\n}";
      inputMap.set(input, ruleText);
      input.addEventListener("click", checkboxListener, true);
      checkboxListener({ target: input });
    }
  }

  // Step 3:  Ensure each li element has the same number of span elements.
  {
    let items = gridtree.getElementsByTagName("li");
    const minSpanCount = items[0].getElementsByTagName("span").length;
    items[0].setAttribute("row", 0);
    for (let i = 1; i < items.length; i++) {
      let item = items[i], refChild = item.lastElementChild;
      item.setAttribute("row", i);
      if (refChild.nodeName.toLowerCase() != "ul")
        refChild = null;
      let spanCount = 0;
      for (let j = 0; j < item.childNodes.length; j++) {
        if (item.childNodes[j].nodeName.toLowerCase() == "span")
          spanCount++;
      }
      while (spanCount < minSpanCount) {
        let span = document.createElement("span");
        item.insertBefore(span, refChild);
        spanCount++;
      }
    }
  }

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

      let refChild = listitemMap.get(item);
      gridtree.insertBefore(span, refChild);
      listitemMap.delete(item);
    }
  }

  // Step 6:  Hide the tree, since it no longer contains useful information.
  gridtree.removeChild(gridtree.firstElementChild);
}
