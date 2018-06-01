const DistortionsManager = window.DistortionsManager = {
  get BlobLoader() {
    try {
      return document.getElementById("BlobLoader").contentWindow.BlobLoader;
    }
    catch (e) {
      console.error(e);
      return null;
    }
  },

  valueToValueName: new Map(/*
    value: hash(valueName, graphIndex) (string)
  */),

  valueNameToTabMap: new Map(/*
    hash: <input type="radio"/>
  */),

  groupNameToTabMap: new Map(/*
    hash: <input type="radio"/>
  */),

  valueNameToRulesMap: new Map(/*
    hash: {
      "value": new DistortionRules(value, treeroot),
      "source": source code to generate value
      "proto": new DistortionRules(value.prototype, treeroot)
    }
  */),

  valueToPanelMap: new Map(/*
    value: <section/>
  */),

  hashGraphAndValueNames: function(valueName, graphIndex) {
    return valueName + "-" + graphIndex;
  },

  getNameAndGraphIndex: function(hash) {
    let index = hash.lastIndexOf("-");
    let valueName = hash.substr(0, index);
    let graphIndex = parseInt(hash.substr(index + 1), 10);
    return [valueName, graphIndex];
  }
};

const DistortionsGUI = window.DistortionsGUI = {
  // private, see below
  iframeBox: null,
  treeUITemplate: null,
  propertyTreeTemplate: null,

  gridTreeCount: 0,

  buildDistortions:
  function(panel, value, details = {
    isTopValue: false,
    isGroup: false,
    isInstance: false,
  }) {
    const {isTopValue, isGroup, isInstance} = details;
    // Build the GUI.
    const gridtree = this.treeUITemplate.content.firstElementChild.cloneNode(true);
    gridtree.setAttribute("id", "gridtree-" + this.gridTreeCount);
    this.gridTreeCount++;

    if (isGroup) {
      panel.appendChild(this.groupPreludeTemplate.content.cloneNode(true));
    }

    const rules = new DistortionsRules();
    rules.isTopValue = isTopValue;
    rules.isGroup    = isGroup;
    rules.isInstance = isInstance;
    rules.initByValue(value, gridtree);

    if (!isGroup) {
      DistortionsManager.valueToValueName.set(value, panel.dataset.hash);
      DistortionsManager.valueToPanelMap.set(value, panel);
    }

    styleAndMoveTreeColumns(gridtree);
    panel.appendChild(gridtree);

    return rules;
  },

  buildPrototypePanel: function(value, hash) {
    if (typeof value.prototype !== "object") {
      // Normally, this is never true... typeof Function.prototype == "function"
      return null;
    }

    const panel = document.createElement("section");
    panel.dataset.hash = hash;
    {
      const valueName = DistortionsManager.getNameAndGraphIndex(hash)[0];
      panel.dataset.valueName = valueName + ".prototype";
    }
    panel.setAttribute("trapstab", "proto");

    const rules = this.buildDistortions(panel, value.prototype);
    DistortionsManager.valueNameToRulesMap.get(hash).proto = rules;

    return panel;
  },

  buildInstancePanel: function(value, hash) {
    if (typeof value.prototype !== "object") {
      // Normally, this is never true... typeof Function.prototype == "function"
      return null;
    }

    const panel = document.createElement("section");
    panel.dataset.hash = hash;
    {
      const valueName = DistortionsManager.getNameAndGraphIndex(hash)[0];
      panel.dataset.valueName = valueName + ":instance";
    }
    panel.setAttribute("trapstab", "instance");

    const prelude = this.instancePreludeTemplate.content.cloneNode(true);
    panel.appendChild(prelude);

    return panel;
  },

  initializeInstancePanel: function() {
    const panel = OuterGridManager.getSelectedPanel();
    if (panel.initialized)
      return;

    // Set up the CodeMirror instance.
    {
      const textarea = panel.getElementsByClassName("exampleSource")[0];

      let source = textarea.value;
      {
        const ctorName = DistortionsManager.getNameAndGraphIndex(
          panel.dataset.hash
        )[0];
        source = source.replace(
          "Object",
          `window.BlobLoader.valuesByName.get("${ctorName}")`
        );
      }
      textarea.value = source;

      panel.exampleEditor = CodeMirrorManager.buildNewEditor(textarea);
      // CodeMirror uses 0 for the first line of text.
      CodeMirrorManager.getTextLock(panel.exampleEditor, 0, 2);
      CodeMirrorManager.getTextLock(panel.exampleEditor, 3, Infinity);
    }

    panel.initialized = true;
  },

  metadataInGraphOrder: function() {
    const rv = [];
    if (!Array.isArray(OuterGridManager.graphNamesCache.items))
      return rv;

    for (let i = 0; i < OuterGridManager.graphNamesCache.items.length; i++)
      rv.push([]);

    const entries = DistortionsManager.valueToValueName.entries();
    let step;
    while ((step = entries.next()) && !step.done) {
      let [value, hash] = step.value;
      const [
        valueName,
        graphIndex
      ] = DistortionsManager.getNameAndGraphIndex(hash);

      const data = {
        name: valueName,
        source: null,
        rules: {},
        hash: hash,
        isFunction: (typeof value === "function"),
      };

      const rulesMap = DistortionsManager.valueNameToRulesMap.get(hash);
      for (let prop in rulesMap) {
        if (rulesMap[prop] instanceof DistortionsRules)
          data.rules[prop] = rulesMap[prop].configurationAsJSON();
        else if (prop === "source")
          data[prop] = rulesMap[prop];
        else
          data.rules[prop] = rulesMap[prop];
      }

      rv[graphIndex].push(data);
    }

    return rv;
  },

  buildValuePanel: async function(details = null) {
    if (!details) {
      const graph = OuterGridManager.graphNamesCache.lastVisibleGraph;
      details = {
        graph: graph,
        valueName: graph.nameOfValue.value,
        graphIndex: OuterGridManager.graphNamesCache.controllers.indexOf(graph),
        hasValue: false,
        isGroup: false,
        valueFromSource: graph.valueGetterEditor.getValue(),
      };
    }

    const {
      graph, valueName, graphIndex, hasValue, isGroup, valueFromSource
    } = details;
    const hash = DistortionsManager.hashGraphAndValueNames(
      valueName, graphIndex
    );
    if (DistortionsManager.valueNameToTabMap.has(hash) ||
        DistortionsManager.groupNameToTabMap.has(hash))
      // XXX ajvincent Need to let the GUI know this value name is taken
      return;

    const BL = DistortionsManager.BlobLoader;
    if (!hasValue && !isGroup)
    {
      await BL.addNamedValue(valueName, valueFromSource);
    }

    const panel = document.createElement("section");
    panel.dataset.valueName = valueName;
    panel.dataset.graphIndex = graphIndex;
    panel.dataset.hash = hash;
    const radioClass = isGroup ?
                       "grouppanel-" + DistortionsManager.groupNameToTabMap.size :
                       "valuepanel-" + DistortionsManager.valueNameToTabMap.size;
    panel.setAttribute("trapstab", "value");

    const radio = OuterGridManager.insertValuePanel(
      graphIndex, valueName, radioClass, panel
    );
    radio.dataset.hash = hash;
    if (isGroup)
      DistortionsManager.groupNameToTabMap.set(hash, radio);
    else
      DistortionsManager.valueNameToTabMap.set(hash, radio);

    const value = hasValue || isGroup ?
                  details.value :
                  BL.valuesByName.get(panel.dataset.valueName);
    const rules = this.buildDistortions(
      panel, value, { isTopValue: true, isGroup }
    );
    const distortionsSet = {
      "about": {
        "valueName": valueName,
        "isFunction": (typeof value === "function"),
      },
      "value": rules,
    };
    if (isGroup) {
      distortionsSet.about.isGroup = true;
    }
    else if (!hasValue) {
      const getExample = valueFromSource.split("\n").slice(1, -2).join("\n");
      distortionsSet.about.getExample = getExample;
    }
    DistortionsManager.valueNameToRulesMap.set(hash, distortionsSet);
    graph.appendDistortionsSet(distortionsSet);

    OuterGridManager.panels.appendChild(panel);

    if (typeof value === "function") {
      radio.dataset.valueIsFunction = true;
      const protoPanel = this.buildPrototypePanel(value, hash);
      if (protoPanel)
        OuterGridManager.insertOtherPanel(radio, protoPanel);

      let instancePanel = this.buildInstancePanel(value, hash);
      if (instancePanel)
        OuterGridManager.insertOtherPanel(radio, instancePanel);
    }
    radio.click();

    return panel;
  },

  finishInstancePanel: async function() {
    const panel = OuterGridManager.getSelectedPanel();
    const source = panel.exampleEditor.getValue();
    let sourceExtract;
    {
      let lines = source.split("\n");
      lines = lines.slice(2, -2);
      sourceExtract = lines.join("\n");
    }

    const exampleValue = await DistortionsManager.BlobLoader.addNamedValue(
      panel.dataset.valueName, source
    );
    
    // Build the DistortionRules UI.
    {
      panel.appendChild(document.createElement("hr"));

      const details = {
        isTopValue: false,
        isGroup: false,
        isInstance: true,
      }
      const rules = this.buildDistortions(panel, exampleValue, details);
      const map = DistortionsManager.valueNameToRulesMap.get(panel.dataset.hash);
      map.instance = rules;
      map.about.getInstance = sourceExtract;
    }

    // Disable the prelude UI.
    {
      const submitButton = panel.getElementsByClassName("submitButton")[0];
      submitButton.disabled = true;
      submitButton.nextElementSibling.disabled = true;

      window.CodeMirrorManager.setEditorEnabled(panel.exampleEditor, false);
    }

    window.LoadPanel.notifyTestOfInit("instanceof panel");
  },
};

{
  let elems = {
    "iframeBox":               "iframe-box",
    "treeUITemplate":          "distortions-tree-ui-main",
    "propertyTreeTemplate":    "distortions-tree-ui-property",
    "instancePreludeTemplate": "distortions-instanceof-prelude",
    "groupPreludeTemplate":    "distortions-groups-panel-prelude",
  };
  let keys = Reflect.ownKeys(elems);
  keys.forEach(function(key) {
    defineElementGetter(DistortionsGUI, key, elems[key]);
  });
}
