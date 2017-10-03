const OutputPanel = {
  // private, see below
  configTextarea: null,
  jsTextarea: null,
  configLink: null,
  jsLink: null,
  errorDiv: null,

  configEditor: null,
  jsEditor: null,

  /**
   * Initialize the output panel.
   */
  init: function() {
    this.configEditor = CodeMirrorManager.buildNewEditor(
      this.configTextarea, { readOnly: true }
    );
    this.jsEditor     = CodeMirrorManager.buildNewEditor(
      this.jsTextarea, { readOnly: true }
    );
  },

  /**
   * Ensure we are ready to generate valid Membrane code.
   *
   * @private
   */
  validate: function() {
    while (this.errorDiv.firstChild)
      this.errorDiv.removeChild(this.errorDiv.firstChild);

    if (!OuterGridManager.startForm.reportValidity()) {
      this.errorDiv.appendChild(document.createTextNode(
        `There is a problem with the graph names.  Please return to the Start ` +
        `panel and fix the errors.`
      ));
      return false;
    }

    return true;
  },

  /**
   * Generate the Distortions GUI JSON and the membrane crafting file.
   */
  update: function() {
    if (!this.validate()) {
      this.configEditor.setValue("");
      this.jsEditor.setValue("");
      return;
    }

    /**************************************************************************
     * Step 1:  Gather metadata.                                              *
     **************************************************************************/
    const commonFiles = [];
    {
      let fileList = DistortionsGUI.commonFilesInput.files;
      for (let i = 0; i < fileList.length; i++)
        commonFiles.push(fileList[i].name);
    }
    
    var [graphNames, graphSymbolLists] = HandlerNames.getNames();

    /**************************************************************************
     * Step 2:  Generate Distortions GUI JSON file.                           *
     **************************************************************************/
    const guiConfig = JSON.stringify({
      "commonFiles": commonFiles,
      "graphNames": graphNames,
      "graphSymbolLists": graphSymbolLists
    }, null, 2) + "\n";

    this.configEditor.setValue(guiConfig);
    {
      let blob = new Blob([guiConfig, "\n"], { type: "application/json" });
      let href = URL.createObjectURL(blob);
      this.configLink.href = href;
    }

    /**************************************************************************
     * Step 3:  Generate Membrane crafting JavaScript file.                   *
     **************************************************************************/
    graphNames = graphNames.map(function(elem, index) {
      elem = JSON.stringify(elem);
      if (graphSymbolLists.length && (graphSymbolLists[0] === index)) {
        graphSymbolLists.shift();
        return `Symbol(${elem})`;
      }
      return elem;
    });

    const script = `function buildMembrane() {
  "use strict";
  const devMembrane = new Membrane();
  const graphNames = [\n    ${graphNames.join(",\n    ")}\n  ];
  graphNames.forEach(function(name) {
    devMembrane.getHandlerByName(name, true);
  });

  return devMembrane;
}\n`;

    this.jsEditor.setValue(script);
    {
      let blob = new Blob([script, "\n"], { type: "application/javascript" });
      let href = URL.createObjectURL(blob);
      this.jsLink.href = href;
    }
  }
};

{
  let elems = {
    "configTextarea": "grid-outer-output-configuration",
    "jsTextarea": "grid-outer-output-javascript",
    "configLink": "grid-outer-output-config-download",
    "jsLink": "grid-outer-output-js-download",
    "errorDiv": "grid-outer-output-error",
  };
  let keys = Reflect.ownKeys(elems);
  keys.forEach(function(key) {
    defineElementGetter(OutputPanel, key, elems[key]);
  });
}
