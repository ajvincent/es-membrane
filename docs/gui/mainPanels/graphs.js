function ObjectGraphManager() {
  /**
   * An unique CSS class name.
   */
  this.radioClass = `graphpanel-${ObjectGraphManager.instanceCount}`;
  ObjectGraphManager.instanceCount++;

  /**
   * An array of objects describing values and their distortions.
   *
   * @see DistortionsGUI.buildValuePanel
   * @private
   */
  this.distortionMaps = [/*
    // 
    {
      "about": {
        "valueName": valueName,
        "isFunction": (typeof value === "function"),
      },
      "value": rules,
    }
  */];

  /**
   * CodeMirror editor objects.
   * @private
   */
  this.passThroughEditor = null;
  this.valueGetterEditor = null;

  /**
   * UI controls.
   * @private
   */
  this.panel = null;
  this.groupLabel = null;
  this.radio = null;
  this.panelLabel = null;

  /**
   * Imported JSON data for all distortionMaps.
   * @private
   */
  this.jsonBase = null;

  this.buildUI();
}

/**
 * The number of ObjectGraphManagers created.  Used for radioclass above.
 * @static
 * @private
 */
ObjectGraphManager.instanceCount = 0;

/**
 * Construct our UI controls.
 *
 * @private
 */
ObjectGraphManager.prototype.buildUI = function() {
  this.panel = this.template.content.firstElementChild.cloneNode(true);
  this.panel.classList.add(this.radioClass);
  OuterGridManager.panels.appendChild(this.panel);

  this.groupLabel = document.createElement("span");
  this.groupLabel.classList.add("tabgroup");
  this.groupLabel.appendChild(document.createTextNode(""));

  this.radio = document.createElement("input");
  this.radio.setAttribute("form", "tabbox-form");
  this.radio.setAttribute("type", "radio");
  this.radio.setAttribute("name", "files");
  this.radio.setAttribute("value", this.radioClass);
  this.radio.setAttribute("id", this.radioClass);

  this.panelLabel = document.createElement("label");
  this.panelLabel.setAttribute("for", this.radioClass);
  this.panelLabel.appendChild(document.createTextNode("(Graph)"));

  this.radio.addEventListener("change", this, true);
};

/**
 * Rebuild the object graph from imported JSON data.
 *
 * @param data {Object} The JSON data.
 */
ObjectGraphManager.prototype.importJSON = async function(data) {
  this.jsonBase = data;
  if (Array.isArray(this.jsonBase.distortions)) {
    for (let i = 0; i < this.jsonBase.distortions.length; i++)
    {
      const distortionData = this.jsonBase.distortions[i];
      const details = {
        graph: this,
        valueName: distortionData.about.valueName,
        graphIndex: OuterGridManager.graphNamesCache.controllers.indexOf(this),
        hasValue: false,
        isGroup: false,
        valueFromSource: this.valueGetterSource.defaultValue,
      };
      if (distortionData.about.getExample)
        details.valueFromSource = details.valueFromSource.replace(
          "  return {};", `${distortionData.about.getExample}`
        );

      try {
        let valuePanel = await window.DistortionsGUI.buildValuePanel(details);
        const hash = valuePanel.dataset.hash;
        const dSet = DistortionsManager.valueNameToRulesMap.get(hash);
        dSet.value.importJSON(distortionData.value);
      }
      catch (exn) {
        if (!OuterGridManager.hasCurrentErrorText())
          OuterGridManager.setCurrentErrorText(exn);

        console.error(exn);
      }
    }
  }
};

/**
 * Generate JSON describing this object graph in full detail.
 *
 * @param graphIndex {Number} Our index in MembranePanel.cachedConfig
 *
 * @returns {Object} A serializable JSON object.
 */
ObjectGraphManager.prototype.exportJSON = function(graphIndex) {
  const rv = {
    "name": this.jsonBase.name,
    "isSymbol": this.jsonBase.isSymbol,
    "passThroughSource": null,
    "passThroughEnabled": false,
    "primordialsPass": false,
    "distortions": [],
  };

  if (this.passThroughEditor) {
    let lines = this.passThroughEditor.getValue().split("\n");
    lines = lines.slice(2, -6);
    rv.passThroughSource = lines.join("\n");

    rv.passThroughEnabled = this.passThroughCheckbox.checked;
    rv.primordialsPass = this.primordialsCheckbox.checked;
  }
  else {
    const config = MembranePanel.cachedConfig;
    const lastGraph = Array.isArray(config.graphs) ? config.graphs[graphIndex] : null;
    if (lastGraph) {
      if (typeof lastGraph.passThroughSource != "undefined")
        rv.passThroughSource = lastGraph.passThroughSource;
      if (typeof lastGraph.passThroughEnabled == "boolean")
        rv.passThroughEnabled = lastGraph.passThroughEnabled;
      if (typeof lastGraph.primordialsPass == "boolean")
        rv.primordialsPass = lastGraph.primordialsPass;
    }
  }

  this.distortionMaps.forEach(function(dm) {
    let d = {}, keys = Reflect.ownKeys(dm);
    keys.forEach(function(key) {
      if (key === "about") {
        d[key] = dm[key];
        return;
      }
      d[key] = dm[key].exportJSON();
    });

    rv.distortions.push(d);
  });

  return rv;
};

/**
 * Append a set of distortions.
 * @see DistortionsGUI.buildValuePanel
 */
ObjectGraphManager.prototype.appendDistortionsSet = function(distortionsSet) {
  this.distortionMaps.push(distortionsSet);
};

/**
 * Specify a name for the object graph this object represents.
 *
 * @param name {String} The name to assign.
 */
ObjectGraphManager.prototype.setGraphName = function(
  name/*, jsonName, isSymbol*/
)
{
  this.groupLabel.firstChild.nodeValue = name;
  if (!this.groupLabel.parentNode) {
    OuterGridManager.addGraphUI(
      this.radioClass, this.groupLabel, this.radio, this.panelLabel
    );
  }
};

/**
 * Get keys belonging to a particular group name.
 *
 * @param groupName {String} The name to look up.
 *
 * @return {String[]} The key names.
 */
ObjectGraphManager.prototype.getGroupKeys = function(groupName) {
  "use strict";
  let rv = [];
  this.distortionMaps.forEach(function(dm) {
    if (dm.about.isGroup)
      return;
    if ("value" in dm) {
      const name = dm.about.valueName;
      const keys = dm.value.getGroupKeys(groupName);
      keys.forEach(function(k) {
        rv.push(`${name}.${k}`);
      });
    }
    if ("proto" in dm) {
      const name = dm.about.valueName;
      const keys = dm.proto.getGroupKeys(groupName);
      keys.forEach(function(k) {
        rv.push(`${name}.prototype.${k}`);
      });
    }
  }, this);
  return rv;
};

/**
 * Show this panel.
 */
ObjectGraphManager.prototype.selectPanel = function() {
  this.radio.click();
};

/**
 * Build the CodeMirror editors this panel uses.
 * @private
 */
ObjectGraphManager.prototype.buildEditors = function() {
    this.passThroughEditor = CodeMirrorManager.buildNewEditor(
      this.passThroughSource
    );
    // CodeMirror uses 0 for the first line of text.
    CodeMirrorManager.getTextLock(this.passThroughEditor, 3, Infinity);
    this.primordialsTextSet = CodeMirrorManager.getTextLock(
      this.passThroughEditor, 0, 2
    );
    if (this.jsonBase.passThroughSource) {
      CodeMirrorManager.replaceLineWithSource(
        this.passThroughEditor,
        this.jsonBase.passThroughSource,
        2
      );
    }
    
    this.primordialsCheckbox.addEventListener("change", this, true);
    this.handlePrimordials({target: this.primordialsCheckbox});

    this.passThroughCheckbox.addEventListener("change", this, true);
    this.handlePassThrough({target: this.passThroughCheckbox});

    this.valueGetterEditor = CodeMirrorManager.buildNewEditor(
      this.valueGetterSource
    );
    CodeMirrorManager.getTextLock(this.valueGetterEditor, 2, Infinity);
    CodeMirrorManager.getTextLock(this.valueGetterEditor, 0, 1);
};

/**
 * Update the read-only portion of the graph configuration for primordials.
 *
 * @param event {MouseEvent}
 */
ObjectGraphManager.prototype.handlePrimordials = function(event) {
  const checked = event.target.checked;
  let source = `const PassThroughFilter = (function() {\n  const items = `;
  source += (checked ? "Membrane.Primordials.slice(0)" : "[]") + ";\n";
  this.primordialsTextSet(source);
};

/**
 * Update the read-only portion of the graph configuration for pass-through of unknown values.
 *
 * @param event {MouseEvent}
 */
ObjectGraphManager.prototype.handlePassThrough = function(event) {
  const checked = event.target.checked;
  this.primordialsCheckbox.disabled = !checked;
  CodeMirrorManager.setEditorEnabled(this.passThroughEditor, checked);
};

/**
 * Extract the pass-through function's contents.
 *
 * @param fullSource {Boolean} True if the read-only parts should be included.
 *
 * @returns {String} The source code of the pass-through function.
 */
ObjectGraphManager.prototype.getPassThrough = function(fullSource = false) {
  if (!this.passThroughCheckbox.checked)
    return null;

  if (!this.passThroughEditor) {
    const config = MembranePanel.cachedConfig;
    if (Array.isArray(config.graphs)) {
      let index = OuterGridManager.graphNamesCache.controllers.indexOf(this);
      if (config.graphs[index])
        return config.graphs[index].passThrough;
    }
    return null;
  }

  if (!fullSource) {
    let lines = this.passThroughEditor.getValue().split("\n");
    lines = lines.slice(2, -6);
    return lines.join("\n");
  }

  let value = this.passThroughEditor.getValue();
  value = value.substr(value.indexOf("("));
  value = value.replace(/;\n$/, ",\n");
  return value;
};

/**
 * EventListener
 */
ObjectGraphManager.prototype.handleEvent = function(event) {
  if (event.target === this.primordialsCheckbox)
    return this.handlePrimordials(event);
  if (event.target === this.passThroughCheckbox)
    return this.handlePassThrough(event);

  if ((event.target === this.radio) && this.radio.checked) {
    if (!this.valueGetterEditor)
      this.buildEditors();

    OuterGridManager.graphNamesCache.lastVisibleGraph = this;

    if (LoadPanel.testMode) {
      window.postMessage(
        "Graph panel shown: " + this.radioClass, window.location.origin
      );
    }

    return null;
  }
};

defineElementGetter(
  ObjectGraphManager.prototype, "template", "objectgraph-main"
);

{
  const elems = {
    "passThroughCheckbox": "enablePT",
    "primordialsCheckbox": "ignore-primordials",
    "passThroughSource":   "passThroughSource",
    "newValueForm":        "newValueForm",
    "nameOfValue":         "nameOfValue",
    "valueGetterSource":   "valueGetterSource",
  };
  const keys = Reflect.ownKeys(elems);
  keys.forEach(function(key) {
    const className = elems[key];
    Reflect.defineProperty(ObjectGraphManager.prototype, key, {
      enumerable: true,
      configurable: true,
      get: function() {
        if (!(this instanceof ObjectGraphManager))
          return null;
        const rv = this.panel.getElementsByClassName(className)[0];
        Reflect.defineProperty(this, key, {
          enumerable: true,
          configurable: false,
          writable: false,
          value: rv
        });
        return rv;
      }
    });
  });
}
