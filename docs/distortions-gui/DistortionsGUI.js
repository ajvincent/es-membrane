const DistortionsManager = {
  commonFileURLs: new Map(),
  
  valueToValueName: new Map(/*
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
    let lists = this.treeroot.getElementsByTagName("ul");
    for (let i = 0; i < lists.length; i++) {
      let list = lists[i];
      if (list.dataset.group)
        this.bindULInputsByGroup(list);
    }
  },

  bindULInputsByGroup: function(list) {
    const inputList = [], groupName = list.dataset.group;
    this.groupToInputsMap.set(groupName, inputList);
    let items = list.children;
    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      let input = item.children[1].firstElementChild;

      let label = item.firstElementChild;
      let propertyName = label.dataset.name || label.firstChild.nodeValue;
      input.dataset.propertyName = propertyName;

      inputList.push(input);
      this.inputToGroupMap.set(input, groupName);
      input.addEventListener("change", this, false);
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
    for (let i = 0; i < inputs.length; i++) {
      let input = inputs[i];
      if (input.checked)
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
    {
      let groupName = this.inputToGroupMap.get(event.target);
      if (groupName) {
        this.updateGroup(groupName);
        return;
      }
    }
  }
};


const DistortionsGUI = {
  // private, see below
  configFileInput: null,
  commonFilesInput: null,
  iframeBox: null,
  treeUITemplate: null,
  propertyTreeTemplate: null,

  gridTreeCount: 0,

  addValuePanel: {
    // private, see below
    form: null,
    textarea: null,
    mainPanels: null,

    // private, set in event listener from OuterGridManager.init().
    getValueEditor: null,
    
    init: function() {
      this.getValueEditor = CodeMirrorManager.buildNewEditor(this.textarea);
    }
  },

  loadConfigAndStart: function() {
    if (this.configFileInput.files.length) {
      /* loading config files isn't yet supported. */
    }

    {
      let files = this.commonFilesInput.files;
      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        DistortionsManager.commonFileURLs.set(file, URL.createObjectURL(file));
      }
    }

    OuterGridManager.addPanelRadio.disabled = false;
    OuterGridManager.outputPanelRadio.disabled = false;

    OuterGridManager.addPanelRadio.click();
  },

  createValuePanel: function() {
    const valueName = this.addValuePanel.form.nameOfValue.value;
    if (DistortionsManager.valueNameToTabMap.has(valueName))
      return;

    let urlObject = new URL("BlobLoader.html", window.location.href);
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
        this.addValuePanel.getValueEditor.getValue()
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
      this.buildDistortions(panel, value);
    }

    this.addValuePanel.mainPanels.appendChild(panel);
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
    DistortionsManager.valueNameToRulesMap.set(panel.dataset.valueName, rules);

    styleAndMoveTreeColumns(gridtree);

    panel.appendChild(gridtree);
  }
};

{
  let elems = {
    "configFileInput": "grid-outer-start-config",
    "commonFilesInput": "grid-outer-start-location",
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

{
  let elems = {
    "form": "grid-outer-addValue",
    "textarea": "grid-outer-addValue-valueReference",
    "mainPanels": "grid-outer-mainpanels",
  };
  let keys = Reflect.ownKeys(elems);
  keys.forEach(function(key) {
    defineElementGetter(DistortionsGUI.addValuePanel, key, elems[key]);
  });
}
