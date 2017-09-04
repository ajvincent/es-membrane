function buildTabbox(tabbox)
{
  "use strict";
  const document = tabbox.ownerDocument,
        sheet = getCustomStylesheet(document),
        boxID = tabbox.getAttribute("id"),
        radiogroupId = boxID + "-radiogroup",
        tabSet = new WeakSet();
  let firstSection = null, tailTab = null, doneWithInitialTabs = false;
  tabbox.tabCount = 0;
  tabbox.uniqueTabCount = 0;

  function closeTab(section)
  {
    const radio = section.linkedTab.previousElementSibling;
    if (radio.checked) {
      if (tabbox.tabCount == 1)
        return;
      const method = (radio.previousElementSibling) ? "previousElementSibling" : "nextElementSibling";
      const nextChecked = radio[method][method];
      nextChecked.checked = true;
    }

    const range = document.createRange();
    range.setStartBefore(radio);
    range.setEndAfter(section.linkedTab);
    range.deleteContents();
    tabbox.removeChild(section);
    tabbox.tabCount--;
  }
  
  function confirmCloseTab(section)
  {
    let dialog = tabbox.lastElementChild;
    if ((dialog.nodeName.toLowerCase() !== "dialog") ||
        (dialog.getAttribute("confirm-close") !== "true"))
    {
      dialog = document.createElement("dialog");
      dialog.setAttribute("confirm-close", "true");

      let p = document.createElement("p");
      p.appendChild(document.createTextNode("Do you want to close this tab?"));
      dialog.appendChild(p);
    }

    {
      let buttons = dialog.getElementsByTagName("button");
      for (let i = 0; (i < buttons.length) && !dialog.okButton && !dialog.cancelButton; i++) {
        let button = buttons[i];
        if (button.value === "ok")
          dialog.okButton = button;
        else if (button.value === "cancel")
          dialog.cancelButton = button;
      }
    }

    if (!dialog.okButton && !dialog.cancelButton) {
      let span = document.createElement("span");

      let yesButton = document.createElement("button");
      yesButton.setAttribute("value", "ok");
      yesButton.appendChild(document.createTextNode("Yes"));

      span.appendChild(yesButton);

      span.appendChild(document.createTextNode(" ")); // spacer

      let noButton = document.createElement("button");
      noButton.appendChild(document.createTextNode("No"));

      span.appendChild(noButton);
      dialog.appendChild(span);

      dialog.okButton = yesButton;
      dialog.cancelButton = noButton;

      dialog.okButton.addEventListener("click", () => {
        dialog.close("ok");
      }, true);

      dialog.cancelButton.addEventListener("click", () => {
        if (dialog.open)
          dialog.close("cancel");
      }, true);

      document.body.addEventListener("click", (event) => {
        if (dialog.opening)
          dialog.opening = false;
        else if (dialog.open && !dialog.contains(event.target)) {
          dialog.close("cancel");
        }
      }, true);

      dialog.addEventListener("close", (event) => {
        if (event.target !== dialog)
          return;
        if (dialog.returnValue === "ok")
          closeTab(section);
      }, true);      
    }

    if ((typeof dialog.show !== "function") ||
        (typeof dialog.close !== "function")) {
      dialog.setAttribute("moz-open", "false");
      dialog.show = function() {
        dialog.setAttribute("moz-open", "true");
        dialog.open = true;
      };

      dialog.close = function(msg) {
        if (!dialog.open)
          return;
        dialog.removeAttribute("moz-open");
        dialog.returnValue = msg;
        dialog.open = false;
        let closeEvent = new Event("close", {"bubbles": true, "cancelable": false});
        dialog.dispatchEvent(closeEvent);
      };
    }

    if (!dialog.parentNode)
      tabbox.appendChild(dialog);

    dialog.currentSection = section;
    dialog.opening = true;
    dialog.show();
  }

  function addTab(section)
  {
    /* Tab creation */
    const frag = document.createDocumentFragment();

    const input = document.createElement("input");
    const inputID = radiogroupId + "-" + tabbox.uniqueTabCount;
    input.setAttribute("type", "radio");
    input.setAttribute("name", radiogroupId);
    input.setAttribute("id", inputID);
    input.setAttribute("value", tabbox.uniqueTabCount);
    frag.appendChild(input);

    const label = document.createElement("label");
    label.setAttribute("for", inputID);
    const labelText = document.createTextNode(section.getAttribute("tablabel"));
    label.appendChild(labelText);
    frag.appendChild(label);

    const mayClose = section.getAttribute("mayclose");
    if ((mayClose === "true") ||
        (mayClose === "confirm"))
    {
      const image = document.createElement("img");
      image.setAttribute("src", "minusicon.svg");
      label.appendChild(image);

      if (mayClose === "true")
        image.addEventListener("click", closeTab.bind(null, section), true);
      else if (mayClose === "confirm")
        image.addEventListener("click", confirmCloseTab.bind(null, section), true);
    }

    section.classList.add("tabpanel-" + tabbox.uniqueTabCount);

    if (!firstSection)
    {
      firstSection = section;
      input.setAttribute("checked", true);
    }

    if (!tailTab && (section.getAttribute("tailtab") === "true"))
      tailTab = input;
    
    label.linkedPanel = section;
    section.linkedTab = label;

    /* CSS rules */
    const ruleText = `#${boxID} > input[value="${tabbox.uniqueTabCount}"]:checked ~ section[tablabel].tabpanel-${tabbox.uniqueTabCount} {
      display: block;
    }`;
    sheet.insertRule(ruleText, 0);

    tabbox.insertBefore(frag, doneWithInitialTabs ? tailTab : firstSection);
    tabbox.uniqueTabCount++;
    tabbox.tabCount++;
    tabSet.add(section);
  }

  function maybeAddTab(elem) {
    if ((elem.nodeName.toLowerCase() === "section") &&
        elem.hasAttribute("tablabel"))
      addTab(elem);
  }

  {
    let elem = tabbox.firstElementChild;

    do {
      maybeAddTab(elem);
    } while ((elem = elem.nextElementSibling));
    doneWithInitialTabs = true;
    if (!tailTab)
      tailTab = firstSection;
  }

  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      for (let i = 0; i < m.addedNodes.length; i++) {
        maybeAddTab(m.addedNodes[i]);
      }
    });
  });
  observer.observe(tabbox, {"childList": true});
}
