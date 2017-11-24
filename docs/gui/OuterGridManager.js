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
  addPanelRadio: null,
  outputPanelRadio: null,
  prototypeRadio: null,
  helpAndNotes: null,
  selectedHelpAndNotesPanel: null,
  currentErrorOutput: null,

  graphNamesCache: {
    items: null,
    labelElements: [],
    firstRadioElements: [],
    radioElementCounts: [],
    groupColumnsRule: null,
  },

  selectedTabs: {
    file: null,
    trap: null,
  },

  // public
  init: function() {
    "use strict";

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
      /*
      OuterGridManager.instanceRadio.disabled  = fTabsDisabled;
      */

      if (radio.dataset.lastTrap)
        OuterGridManager.tabboxForm.functionTraps.value = radio.dataset.lastTrap;
    });

    this.trapsTabbox.addEventListener("change", function(event) {
      OuterGridManager.selectedTabs.trap = event.target;
      OuterGridManager.selectedTabs.file.dataset.lastTrap = event.target.value;
    }, true);

    this.panels.addEventListener("click", function(event) {
      if (event.target.classList.contains("helpButton"))
        OuterGridManager.setHelpPanel(event.target);
    }, true);

    this.loadPanelRadio.click();
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

  getGraphIndexRef: function(index, radioToInsert) {
    const cache = this.graphNamesCache;
    if (!cache.items) {
      cache.items = HandlerNames.getGraphNames();
    }

    // Cache the radio button, to insert another element before it later.
    if (!cache.firstRadioElements[index]) {
      cache.firstRadioElements[index] = radioToInsert;
    }

    // We should track how many values belong to an object graph.
    if (typeof cache.radioElementCounts[index] === "number")
      cache.radioElementCounts[index]++;
    else
      cache.radioElementCounts[index] = 1;

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
      const count = cache.radioElementCounts.reduce(function(sum, value) {
        return sum + (value || 0);
      }, 0);
      cache.groupColumnsRule.style.setProperty("--column-count", count);
    }

    // Insert the group label for the object graph.
    if (!cache.labelElements[index]) {
      const span = document.createElement("span");
      span.classList.add("tabgroup");
      cache.labelElements[index] = span;
      span.appendChild(document.createTextNode(cache.items[index]));

      // Find the insertion point
      const following = cache.labelElements.slice(index + 1);
      const ref = following.find(function(el) {
        return Boolean(el);
      }) || this.loadPanelRadio;

      this.filesTabbox.insertBefore(span, ref);
    }

    // Ensure the graph's label goes across all of its wrapped values.
    {
      const span = cache.labelElements[index];
      span.style.gridColumnEnd = "span " + cache.radioElementCounts[index];
    }

    // Now, finally, find where the radio button we were passed should be inserted.
    {
      const following = this.graphNamesCache.firstRadioElements.slice(index + 1);
      const ref = following.find(function(el) {
        return Boolean(el);
      }) || this.filesTabbox.getElementsByClassName("insertPoint")[0];
      return ref;
    }
  },

  insertOtherPanel: function(radio, panel) {
    const radioClass = radio.getAttribute("value");
    panel.classList.add(radioClass);
    this.addCSSPanelRule(radioClass, panel.getAttribute("trapsTab"));
    this.panels.appendChild(panel);
  },

  addCSSPanelRule: function(radioClass, trapsTab) {
    const cssRule = `#grid-outer[filesTab="${radioClass}"][trapsTab="${trapsTab}"] > #grid-outer-mainpanels > section[trapsTab="${trapsTab}"].${radioClass} {
      display: block;
    }`;
    this.sheet.insertRule(cssRule);
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
    "addPanelRadio": "tabbox-files-addPanel",
    "outputPanelRadio": "tabbox-files-output",

    "prototypeRadio": "tabbox-function-traps-prototype",

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
