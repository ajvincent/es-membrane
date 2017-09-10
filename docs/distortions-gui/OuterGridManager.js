const OuterGridManager = {
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

  // public
  init: function() {
    "use strict";

    // used to add CSS rules controlling dynamic tabbox panels.
    this.sheet = getCustomStylesheet(document);

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

    this.filesTabbox.addEventListener("change", {
      handleEvent: function(event) {
        if (event.target !== OuterGridManager.addPanelRadio)
          return;
        OuterGridManager.filesTabbox.removeEventListener("change", this, true);
        DistortionsGUI.addValuePanel.init();
      }
    }, true);
  },

  insertValuePanel: function(valueName, radioClass, panel) {
    const radio = document.createElement("input");
    radio.setAttribute("form", "tabbox-form");
    radio.setAttribute("type", "radio");
    radio.setAttribute("name", "files");
    radio.setAttribute("value", radioClass);

    radio.setAttribute("id", radioClass);

    panel.classList.add(radioClass);

    const cssRule = `#grid-outer[filesTab="${radioClass}"][trapsTab="value"] > #grid-outer-mainpanels > section[trapsTab="value"].${radioClass} {
      display: block;
    }`;
    this.sheet.insertRule(cssRule);

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
