const OuterGridManager = window.OuterGridManager = {
  // private, see below
  sheet: null,
  grid: null,
  panels: null,
  filesTabbox: null,
  trapsTabbox: null,
  tabboxForm: null,
  loadPanelRadio: null,
  membranePanelRadio: null,
  outputPanelRadio: null,
  prototypeRadio: null,
  helpAndNotes: null,
  selectedHelpAndNotesPanel: null,
  currentErrorOutput: null,

  graphNamesCache: {
    controllers: [],
    visited: false,

    labelElements: [],
    firstRadioElements: [],
    radioElementCounts: [],

    groupColumnsRule: null,

    lastVisibleGraph: null,
  },

  selectedTabs: {
    file: null,
    trap: null,
  },

  // public
  init: function() {
    "use strict";
    this.tabboxForm.reset();

    // used to add CSS rules controlling dynamic tabbox panels.
    this.sheet = getCustomStylesheet(document);

    HandlerNames.init();

    {
      let listener = new TabboxRadioEventHandler(
        this.tabboxForm, "files", this.grid, "filesTab"
      );
      this.filesTabbox.addEventListener("change", listener, true);
      listener.handleEvent();
    }

    {
      let listener = new TabboxRadioEventHandler(
        this.tabboxForm, "functionTraps", this.grid, "trapsTab"
      );
      this.trapsTabbox.addEventListener("change", listener, true);
      listener.handleEvent();
    }

    /* CodeMirror requires visible textareas, which will not happen until the
     * panel is visible.
     */
    {
      const handler = {
        mainPanelRadios: [],

        handleEvent: function(event) {
          if (!this.mainPanelRadios.includes(event.target))
            return;
          let panel = event.target.value;
          panel = panel[0].toUpperCase() + panel.substr(1) + "Panel";
          window[panel].update(); // fire and forget:  update is async
          delete OuterGridManager.grid.dataset.showvalue;
        }
      };

      let inputs = this.filesTabbox.getElementsByTagName("input");
      for (let i = 0; i < inputs.length; i++)
        handler.mainPanelRadios.push(inputs[i]);
      this.filesTabbox.addEventListener("change", handler, true);
    }

    this.filesTabbox.addEventListener("change", function(event) {
      const radio = event.target;
      OuterGridManager.selectedTabs.file = radio;

      const fTabsDisabled = !(radio.dataset.valueIsFunction);
      OuterGridManager.prototypeRadio.disabled = fTabsDisabled;
      OuterGridManager.instanceRadio.disabled  = fTabsDisabled;

      if (radio.dataset.lastTrap)
        OuterGridManager.tabboxForm.functionTraps.value = radio.dataset.lastTrap;

      if (OuterGridManager.selectedTabs.file.dataset.lastTrap === "instance")
        window.DistortionsGUI.initializeInstancePanel();
    });

    this.trapsTabbox.addEventListener("change", function(event) {
      const t = event.target;
      OuterGridManager.selectedTabs.trap = t;
      OuterGridManager.selectedTabs.file.dataset.lastTrap = t.value;

      if (t.value === "instance")
        window.DistortionsGUI.initializeInstancePanel();
    }, true);

    this.panels.addEventListener("click", function(event) {
      if (event.target.classList.contains("helpButton"))
        OuterGridManager.setHelpPanel(event.target);
    }, true);

    this.loadPanelRadio.click();
  },

  defineGraphs: function() {
    const config = MembranePanel.cachedConfig;

    // Update the cached configuration
    {
      const [graphNames, graphSymbolLists] = HandlerNames.serializableNames();
      if (!Array.isArray(config.graphs)) {
        config.graphs = [];
      }
      while (config.graphs.length < graphNames.length)
        config.graphs.push({});
      graphNames.forEach(function(name, index) {
        config.graphs[index].name = name;
        config.graphs[index].isSymbol = graphSymbolLists.includes(index);
      });
    }

    // Define our object graph managers
    {
      const names = HandlerNames.getFormattedNames();
      for (let i = 0; i < names.length; i++) {
        const name = names[i];
        if (this.graphNamesCache.controllers.length == i) {
          this.graphNamesCache.controllers.push(new ObjectGraphManager());
        }
        const controller = this.graphNamesCache.controllers[i];
        controller.importJSON(config.graphs[i]);
        controller.setGraphName(name);
      }

      const deadControllers = this.graphNamesCache.controllers.slice(names.length);
      deadControllers.forEach((controller) => {controller.remove();});
      this.graphNamesCache.controllers.length = names.length;
    }

    if (!this.graphNamesCache.visited) {
      this.graphNamesCache.visited = true;
      this.graphNamesCache.controllers[0].selectPanel();
    }

    this.outputPanelRadio.disabled = false;
    if (LoadPanel.testMode) {
      window.postMessage(
        "OuterGridManager: object graphs defined", window.location.origin
      );
    }
  },
  
  insertValuePanel: function(graphIndex, valueName, radioClass, panel) {
    const radio = document.createElement("input");
    radio.setAttribute("form", "tabbox-form");
    radio.setAttribute("type", "radio");
    radio.setAttribute("name", "files");
    radio.setAttribute("value", radioClass);
    radio.setAttribute("id", radioClass);
    radio.dataset.lastTrap = "value";

    panel.classList.add(radioClass);
    this.addCSSPanelRule(radioClass, "value");

    const listener = new CSSClassToggleHandler(
      radio, this.panels, radioClass, true
    );
    this.filesTabbox.addEventListener("change", listener, true);

    const label = document.createElement("label");
    label.setAttribute("for", radioClass);
    label.appendChild(document.createTextNode(valueName));

    this.panels.appendChild(panel);

    const refChild = this.getGraphIndexRef(graphIndex, radio);
    this.filesTabbox.insertBefore(radio, refChild);
    this.filesTabbox.insertBefore(label, refChild);

    return radio;
  },

  addGraphUI: function(radioClass, groupLabel, radio, panelLabel) {
    const cache = this.graphNamesCache;
    cache.labelElements.push(groupLabel);
    cache.firstRadioElements.push(radio);
    cache.radioElementCounts.push(1);

    // Show the panel when the radio button is checked.
    {
      const cssRule = [
        `#grid-outer[filesTab="${radioClass}"] >`,
        "#grid-outer-mainpanels >",
        `section.${radioClass} {\n  `,
        "display: block;\n",
        "}\n\n"
      ].join("");
      this.sheet.insertRule(cssRule);

      const listener = new CSSClassToggleHandler(
        radio, this.panels, radioClass, true
      );
      this.filesTabbox.addEventListener("change", listener, true);
    }

    // Renumber the grid columns of this.filesTabbox.
    if (!cache.groupColumnsRule) {
      const widths = window.getComputedStyle(this.filesTabbox, null)
                           .gridTemplateColumns
                           .split(" ");
      widths.splice(3, 0, "repeat(var(--column-count), auto)");
      const ruleText = `#tabbox-files { grid-template-columns: ${widths.join(" ")};}`;
      const ruleIndex = this.sheet.insertRule(ruleText, this.sheet.cssRules.length);
      cache.groupColumnsRule = this.sheet.cssRules[ruleIndex];
    }

    // Ensure each column is counted.
    {
      const count = cache.radioElementCounts.reduce(
        (sum, value) => { return sum + value; }, 0
      );
      cache.groupColumnsRule.style.setProperty("--column-count", count);
    }
    groupLabel.style.gridColumnEnd = "span 1";

    // Actually show the UI.
    this.filesTabbox.insertBefore(groupLabel, this.loadPanelRadio);

    const ref = this.filesTabbox.getElementsByClassName("insertPoint")[0];
    this.filesTabbox.insertBefore(panelLabel, ref);
    this.filesTabbox.insertBefore(radio, panelLabel);
  },

  getGraphIndexRef: function(index) {
    const cache = this.graphNamesCache;
    cache.radioElementCounts[index]++;
    
    // Ensure each column is counted.
    {
      const count = cache.radioElementCounts.reduce(
        (sum, value) => { return sum + value; }, 0
      );
      cache.groupColumnsRule.style.setProperty("--column-count", count);
    }

    // Ensure the graph's label goes across all of its wrapped values.
    {
      const span = cache.labelElements[index];
      span.style.gridColumnEnd = "span " + cache.radioElementCounts[index];
    }

    // Now, finally, find where the radio button we were passed should be inserted.
    const firstRadios = this.graphNamesCache.firstRadioElements;
    index++;
    return index == firstRadios.length ?
           this.filesTabbox.getElementsByClassName("insertPoint")[0] :
           firstRadios[index];
  },

  insertOtherPanel: function(radio, panel) {
    const radioClass = radio.getAttribute("value");
    panel.classList.add(radioClass);
    this.addCSSPanelRule(radioClass, panel.getAttribute("trapsTab"));
    this.panels.appendChild(panel);
  },

  addCSSPanelRule: function(radioClass, trapsTab) {
    const cssRule = [
      `#grid-outer[filesTab="${radioClass}"][trapsTab="${trapsTab}"] >`,
      "#grid-outer-mainpanels >",
      `section[trapsTab="${trapsTab}"].${radioClass} {\n  `,
      "display: block;\n",
      "}\n\n"
    ].join("");
    this.sheet.insertRule(cssRule);
  },

  getSelectedPanel: function() {
    const id = this.tabboxForm.elements.files.value;
    const trap = this.tabboxForm.elements.functionTraps.value;
    const hash = document.getElementById(id).dataset.hash;
    const path = `//section[@trapsTab="${trap}"][@data-hash="${hash}"]`;
    const result = document.evaluate(
      path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
    );
    return result.singleNodeValue;
  },

  setHelpPanel: function(button) {
    if (this.selectedHelpAndNotesPanel)
      this.selectedHelpAndNotesPanel.dataset.selected = false;
    const panelId = "help-" + button.dataset.for;
    this.selectedHelpAndNotesPanel = document.getElementById(panelId);
    if (this.selectedHelpAndNotesPanel)
      this.selectedHelpAndNotesPanel.dataset.selected = true;
  },

  setCurrentErrorText: function(e) {
    if (!this.currentErrorOutput.firstChild) {
      let text = document.createTextNode("");
      this.currentErrorOutput.appendChild(text);
    }
    const errorText = e ? e.message : "";
    this.currentErrorOutput.firstChild.nodeValue = errorText;
  }
};

function TabboxRadioEventHandler(form, inputName, target, attr) {
  this.form = form;
  this.inputName = inputName;
  this.target = target;
  this.attr = attr;
}
TabboxRadioEventHandler.prototype.handleEvent = function() {
  const value = this.form[this.inputName].value;
  this.target.setAttribute(this.attr, value);
};

{
  let elems = {
    "grid": "grid-outer",
    "panels": "grid-outer-mainpanels",
    "filesTabbox": "tabbox-files",
    "trapsTabbox": "tabbox-function-traps",
    "tabboxForm": "tabbox-form",

    "loadPanelRadio": "tabbox-files-load",
    "membranePanelRadio": "tabbox-files-membrane",
    "outputPanelRadio": "tabbox-files-output",

    "valueRadio":     "tabbox-function-traps-value",
    "prototypeRadio": "tabbox-function-traps-prototype",
    "instanceRadio":  "tabbox-function-traps-instance",

    "helpAndNotes": "help-and-notes",

    "currentErrorOutput": "config-error",
  };
  let keys = Reflect.ownKeys(elems);
  keys.forEach(function(key) {
    defineElementGetter(OuterGridManager, key, elems[key]);
  });
}

window.addEventListener("load", {
  handleEvent: function (event) {
    if (event.target === window.document) {
      window.removeEventListener("load", this, true);
      OuterGridManager.init();
    }
  }
}, true);
