function ObjectGraphManager() {
  this.radioClass = `graphpanel-${ObjectGraphManager.instanceCount}`;
  ObjectGraphManager.instanceCount++;
  this.distortions = [];
  this.passThroughEditor = null;
  this.valueGetterEditor = null;

  this.buildUI();
}
ObjectGraphManager.instanceCount = 0;

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
}

ObjectGraphManager.prototype.setGraphName = function(name) {
  this.groupLabel.firstChild.nodeValue = name;
  if (!this.groupLabel.parentNode) {
    OuterGridManager.addGraphUI(
      this.radioClass, this.groupLabel, this.radio, this.panelLabel
    );
  }
};

ObjectGraphManager.prototype.readDistortionsData = function(data) {
  
};

ObjectGraphManager.prototype.remove = function() {
  
};

ObjectGraphManager.prototype.selectPanel = function() {
  this.radio.click();
};

ObjectGraphManager.prototype.buildEditors = function() {
    this.passThroughEditor = CodeMirrorManager.buildNewEditor(
      this.passThroughSource
    );
    // CodeMirror uses 0 for the first line of text.
    CodeMirrorManager.getTextLock(this.passThroughEditor, 3, Infinity);
    this.primordialsTextSet = CodeMirrorManager.getTextLock(
      this.passThroughEditor, 0, 2
    );
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

ObjectGraphManager.prototype.handlePrimordials = function(event) {
  const checked = event.target.checked;
  let source = `const PassThroughFilter = (function() {\n  const items = `;
  source += (checked ? "Membrane.Primordials.slice(0)" : "[]") + ";\n";
  this.primordialsTextSet(source);
};

ObjectGraphManager.prototype.handlePassThrough = function(event) {
  const checked = event.target.checked;
  this.primordialsCheckbox.disabled = !checked;
  CodeMirrorManager.setEditorEnabled(this.passThroughEditor, checked);
};

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
