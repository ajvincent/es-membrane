const DistortionsManager = window.DistortionsManager = {
  commonFileURLs: new Map(),
  
  valueToValueName: new Map(/*
    value: valueName (string)
  */),

  valueNameToTabMap: new Map(/*
    valueName: <input type="radio"/>
  */),

  valueNameToRulesMap: new Map(/*
    valueName: new DistortionRules(value, treeroot)
  */),
};

function DistortionsRules() {
  this.inputToGroupMap = new Map(/*
    <input type="checkbox">: groupName
  */);
  this.groupToInputsMap = new Map(/*
    groupName: <input type="checkbox">[]
  */);

  this.settings = {
    /* serializable JSON settings */
  };
}
DistortionsRules.prototype = {
  bindUI: function() {
    {
      let multistates = this.treeroot.getElementsByClassName("multistate");
      for (let i = 0; i < multistates.length; i++)
        updateMultistate(multistates[i]);
    }

    {
      let lists = this.treeroot.getElementsByTagName("ul");
      for (let i = 0; i < lists.length; i++) {
        let list = lists[i];
        if (list.dataset.group)
          this.bindULInputsByGroup(list);
      }
    }
  },

  bindULInputsByGroup: function(list) {
    const inputList = [], groupName = list.dataset.group;
    this.groupToInputsMap.set(groupName, inputList);
    let items = list.children;
    for (let i = 0; i < items.length; i++) {
      let item = items[i];

      let label = item.firstElementChild;
      let propertyName = label.dataset.name || label.firstChild.nodeValue;

      let input = item.children[1].firstElementChild;
      while (input) {
        input.dataset.propertyName = propertyName;

        inputList.push(input);
        this.inputToGroupMap.set(input, groupName);
        let eventType = (input.localName === "button" ? "click" : "change");
        input.addEventListener(eventType, this, false);
        input = input.nextElementSibling;
      }
    }

    this.updateGroup(groupName);
  },

  initByValue: function(value, treeroot) {
    this.value = value;
    this.treeroot = treeroot;

    this.bindUI();
  },

  updateGroup: function(groupName) {
    const members = this.settings[groupName] = [];
    let inputs = this.groupToInputsMap.get(groupName);
    var truncateArgButtonValue;
    for (let i = 0; i < inputs.length; i++) {
      let input = inputs[i];
      if (input.dataset.propertyName === "truncateArgList") {
        // special handling
        if (input.localName === "button") {
          truncateArgButtonValue = input.value;
          if (truncateArgButtonValue === "true")
            this.settings.truncateArgList = true;
          else if (truncateArgButtonValue === "false")
            this.settings.truncateArgList = false;
        }
        else if (truncateArgButtonValue === "number")
          this.settings.truncateArgList = parseInt(input.value);
      }

      else if (input.checked)
        members.push(input.dataset.propertyName);
    }
  },

  updateFromConfiguration: function(/*config*/) {
    throw new Error("Not implemented!");
  },

  configurationAsJSON: function() {
    return JSON.stringify(this.settings);
  },

  handleEvent: function(event) {
    const el = event.target;
    if ((el.classList.contains("multistate")) &&
        (el.dataset.propertyName === "truncateArgList")) {
      el.nextElementSibling.disabled = (el.value !== "number");
    }

    {
      let groupName = this.inputToGroupMap.get(el);
      if (groupName) {
        this.updateGroup(groupName);
        return;
      }
    }
  }
};

const DistortionsGUI = window.DistortionsGUI = {
  // private, see below
  iframeBox: null,
  treeUITemplate: null,
  propertyTreeTemplate: null,

  gridTreeCount: 0,

  createValuePanel: function() {
    const valueName = AddValuePanel.form.nameOfValue.value;
    if (DistortionsManager.valueNameToTabMap.has(valueName))
      return;

    let urlObject = new URL("blob/BlobLoader.html", window.location.href);
    {
      let scriptIter = DistortionsManager.commonFileURLs.values();
      let step = scriptIter.next();
      while (!step.done) {
        urlObject.searchParams.append("scriptblob", step.value);
        step = scriptIter.next();
      }
    }

    {
      let sources = [
        "window.BlobLoader.getValue = ",
        AddValuePanel.getValueEditor.getValue()
      ];
      let b = new Blob(sources, { type: "application/javascript" });
      urlObject.searchParams.append("scriptblob", URL.createObjectURL(b));
    }

    const iframe = document.createElement("iframe");
    iframe.setAttribute("src", urlObject.href);

    const panel = document.createElement("section");
    panel.dataset.valueName = valueName;
    const radioClass = "valuepanel-" + DistortionsManager.valueNameToTabMap.size;
    panel.setAttribute("trapsTab", "value");

    const radio = OuterGridManager.insertValuePanel(
      valueName, radioClass, panel
    );
    DistortionsManager.valueNameToTabMap.set(valueName, radio);

    iframe.addEventListener("load", function() {
      DistortionsGUI.finalizeValuePanel(iframe.contentWindow.BlobLoader, panel);
      radio.click();
    });
    this.iframeBox.appendChild(iframe);
  },

  finalizeValuePanel: function(BlobLoader, panel) {
    var value;
    try {
      value = BlobLoader.getValue();
    }
    catch (e) {
      BlobLoader.registerError(e);
      console.error(e);
    }
    if (BlobLoader.errorFired) {
      panel.classList.add("error");
      let strong = document.createElement("strong");
      strong.appendChild(document.createTextNode("Error: "));
      panel.appendChild(strong);
      panel.appendChild(document.createTextNode(BlobLoader.errorMessage));
    }
    else {
      const rules = this.buildDistortions(panel, value);
      DistortionsManager.valueNameToRulesMap.set(
        panel.dataset.valueName, { "value": rules }
      );
    }

    AddValuePanel.mainPanels.appendChild(panel);

    if (typeof value === "function") {
      const valueName = DistortionsManager.valueToValueName.get(value);
      const radio = DistortionsManager.valueNameToTabMap.get(valueName);

      radio.dataset.valueIsFunction = true;
      const protoPanel = this.buildPrototypePanel(value, valueName);
      if (protoPanel)
        OuterGridManager.insertOtherPanel(radio, protoPanel);

      /*
      let instancePanel = this.buildInstancePanel(value);
      if (instancePanel)
        OuterGridManager.insertOtherPanel(radio, instancePanel);
      */
    }
  },

  buildDistortions: function(panel, value) {
    const keys = Reflect.ownKeys(value);

    // Build the GUI.
    const gridtree = this.treeUITemplate.content.firstElementChild.cloneNode(true);
    gridtree.setAttribute("id", "gridtree-" + this.gridTreeCount);
    this.gridTreeCount++;

    const propertyList = (function() {
      const lists = gridtree.getElementsByTagName("ul");
      for (let i = 0; i < lists.length; i++) {
        let list = lists[i];
        if (list.dataset.group === "ownKeys")
          return list;
      }
    })();
    const listItemBase = this.propertyTreeTemplate.content.firstElementChild;

    keys.forEach(function(key) {
      const listItem = listItemBase.cloneNode(true);
      const propElement = listItem.getElementsByClassName("propertyName")[0];
      propElement.appendChild(document.createTextNode(key));
      propertyList.appendChild(listItem);
    }, this);

    const treeroot = gridtree.getElementsByClassName("treeroot")[0];
    const rules = new DistortionsRules();
    rules.initByValue(value, treeroot);

    DistortionsManager.valueToValueName.set(value, panel.dataset.valueName);

    if (typeof value !== "function") {
      const fnCheckboxes = gridtree.getElementsByClassName("function-only");
      for (let i = 0; i < fnCheckboxes.length; i++)
        fnCheckboxes[i].disabled = true;
    }

    styleAndMoveTreeColumns(gridtree);
    panel.appendChild(gridtree);

    return rules;
  },

  buildPrototypePanel: function(value, valueName) {
    if (typeof value.prototype !== "object") {
      // Normally, this is never true... typeof Function.prototype == "function"
      return null;
    }

    const panel = document.createElement("section");
    panel.dataset.valueName = valueName;
    panel.setAttribute("trapsTab", "prototype");

    const rules = this.buildDistortions(panel, value.prototype);
    DistortionsManager.valueNameToRulesMap.get(valueName).proto = rules;

    return panel;
  },
};

{
  let elems = {
    "addValueForm": "grid-outer-addValue",
    "addValueTextarea": "grid-outer-addValue-valueReference",
    "iframeBox": "iframe-box",
    "treeUITemplate": "distortions-tree-ui-main",
    "propertyTreeTemplate": "distortions-tree-ui-property"
  };
  let keys = Reflect.ownKeys(elems);
  keys.forEach(function(key) {
    defineElementGetter(DistortionsGUI, key, elems[key]);
  });
}
