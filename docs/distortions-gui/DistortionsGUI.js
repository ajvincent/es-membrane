const Distortions = {
  commonFileURLs: new Map(),

  valueToTabMap: new Map(/*
  */)
};

const DistortionsGUI = {
  // private, see below
  configFileInput: null,
  commonFilesInput: null,

  addValuePanel: {
    form: null,
    textarea: null,

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
        Distortions.commonFileURLs.set(file, URL.createObjectURL(file));
      }
    }

    OuterGridManager.addPanelRadio.disabled = false;
    OuterGridManager.outputPanelRadio.disabled = false;

    OuterGridManager.addPanelRadio.click();
  },

  createValuePanel: function() {
    const valueName = this.addValuePanel.form.nameOfValue.value;
    if (Distortions.valueToTabMap.has(valueName))
      return;

    let urlObject = new URL("distortions.html", window.location.href);
    {
      let scriptIter = Distortions.commonFileURLs.values();
      let step = scriptIter.next();
      while (!step.done) {
        urlObject.searchParams.append("scriptblob", step.value);
        step = scriptIter.next();
      }
    }

    const panel = document.createElement("section");
    const iframe = document.createElement("iframe");
    iframe.setAttribute("src", urlObject.href);
    panel.appendChild(iframe);
    
    const radioClass = "valuepanel-" + Distortions.valueToTabMap.size;

    const radio = OuterGridManager.insertValuePanel(valueName, radioClass, panel);
    Distortions.valueToTabMap.set(valueName, radio);
    radio.click();
  },
};

{
  let elems = {
    "configFileInput": "grid-outer-start-config",
    "commonFilesInput": "grid-outer-start-location",
    "addValueForm": "grid-outer-addValue",
    "addValueTextarea": "grid-outer-addValue-valueReference",
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
  };
  let keys = Reflect.ownKeys(elems);
  keys.forEach(function(key) {
    defineElementGetter(DistortionsGUI.addValuePanel, key, elems[key]);
  });
}
