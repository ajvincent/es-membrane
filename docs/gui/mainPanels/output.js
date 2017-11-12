const OutputPanel = window.OutputPanel = {
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

    window.postMessage(
      "output initialized",
      window.location.origin
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

    if (!StartPanel.graphNamesForm.reportValidity()) {
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
      let fileList = StartPanel.commonFilesInput.files;
      for (let i = 0; i < fileList.length; i++)
        commonFiles.push(fileList[i].name);
    }
    
    var [graphNames, graphSymbolLists] = HandlerNames.serializableNames();

    /**************************************************************************
     * Step 2:  Get the DistortionsRules' configurations.                     *
     **************************************************************************/
    const distortionsData = DistortionsGUI.metadataInGraphOrder();

    /**************************************************************************
     * Step 3:  Generate Distortions GUI JSON file.                           *
     **************************************************************************/
    const guiConfig = JSON.stringify({
      "commonFiles": commonFiles,
      "graphNames": graphNames,
      "graphSymbolLists": graphSymbolLists,
      "distortionsByGraph": distortionsData,
    }, null, 2) + "\n";

    this.configEditor.setValue(guiConfig);
    {
      let blob = new Blob([guiConfig, "\n"], { type: "application/json" });
      let href = URL.createObjectURL(blob);
      this.configLink.href = href;
    }

    /**************************************************************************
     * Step 4:  Generate Membrane crafting JavaScript file.                   *
     **************************************************************************/
    var script = `function buildMembrane() {
  "use strict";
  const devMembrane = new Membrane();
  const graphNames = [\n    ${HandlerNames.getFormattedNames().join(",\n    ")}\n  ];
  const graphs = graphNames.map(function(name) {
    return devMembrane.getHandlerByName(name, true);
  });\n\n`;
    distortionsData.forEach(function(dataArray, graphIndex) {
      if (dataArray.length === 0)
        return;
      const nl = "\n    ";
      script += `  {\n    const rules = devMembrane.modifyRules.createDistortionsListener();\n`;
      dataArray.forEach(function(data) {
        script += `${nl}rules.addListener(${data.name}, "value", `;
        script += JSON.stringify(data.rules.value, null, 2).replace(/\n/gm, nl) + `);\n`;
        if (!("proto" in data.rules))
          return;
        script += `${nl}rules.addListener(${data.name}, "proto", `;
        script += JSON.stringify(data.rules.proto, null, 2).replace(/\n/gm, nl) + `);\n`;
      });
      script += `${nl}rules.bindToHandler(graphs[${graphIndex}]);\n  }\n\n`;
    });

    script += "  return devMembrane;\n}\n";

    this.jsEditor.setValue(script);
    {
      let blob = new Blob([script], { type: "application/javascript" });
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
