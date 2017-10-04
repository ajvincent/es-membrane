const OuterGridManager = window.OuterGridManager = {
  // private, see below
  sheet: null,
  grid: null,
  panels: null,
  filesTabbox: null,
  trapsTabbox: null,
  tabboxForm: null,
  startForm: null,
  startPanelRadio: null,
  addPanelRadio: null,
  outputPanelRadio: null,
  prototypeRadio: null,
  helpAndNotes: null,
  selectedHelpAndNotesPanel: null,

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

    /* CodeMirror requires visible textareas, which will not happen until the
     * panel is visible.
     */
    this.filesTabbox.addEventListener("change", {
      handleEvent: function(event) {
        if (event.target !== OuterGridManager.addPanelRadio)
          return;
        OuterGridManager.filesTabbox.removeEventListener("change", this, true);
        DistortionsGUI.addValuePanel.init();
      }
    }, true);

    this.filesTabbox.addEventListener("change", {
      handleEvent: function(event) {
        if (event.target !== OuterGridManager.outputPanelRadio)
          return;
        OuterGridManager.filesTabbox.removeEventListener("change", this, true);
        OutputPanel.init();
      }
    }, true);

    this.filesTabbox.addEventListener("change", {
      handleEvent: function(event) {
        if (event.target === OuterGridManager.outputPanelRadio)
          OutputPanel.update();
      }
    }, true);

    this.panels.addEventListener("click", function(event) {
      if (event.target.classList.contains("helpButton"))
        OuterGridManager.setHelpPanel(event.target);
    }, true);

    this.panels.addEventListener("click", MultistateHandler, true);
  },

  insertValuePanel: function(valueName, radioClass, panel) {
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

    const refChild = this.filesTabbox.getElementsByClassName("insertPoint")[0];
    this.filesTabbox.insertBefore(radio, refChild);
    this.filesTabbox.insertBefore(label, refChild);

    return radio;
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
    "startForm": "grid-outer-start",

    "startPanelRadio": "tabbox-files-start",
    "addPanelRadio": "tabbox-files-addPanel",
    "outputPanelRadio": "tabbox-files-output",

    "prototypeRadio": "tabbox-function-traps-prototype",

    "helpAndNotes": "help-and-notes"
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
