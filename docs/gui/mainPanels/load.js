window.LoadPanel = {
  update: function() {
    // do nothing
  },
  
  // private, see below
  commonFilesInput: null,
  configFileInput: null,

  commonFilesLoaded: false,

  // treat this as restricted to testing purposes
  testMode: null,

  setTestModeFiles: function() {
    [
      "../dist/browser/assert.js",
      "../dist/browser/sharedUtilities.js",
      "../dist/browser/es7-membrane.js",
      "../dist/browser/mocks.js"
    ].forEach(function(filepath) {
      DistortionsManager.commonFileURLs.set(
        filepath, (new URL(filepath, window.location.href)).href
      );
    });
  },

  notifyTestOfInit: function(name) {
    if (this.testMode) {
      console.log("postMessage requested:", `${name} initialized`);
      window.postMessage(`${name} initialized`, window.location.origin);
    }
  },

  validateDistortions: function(instructions, index, graphIndex) {
    const errorPrefix = `config.graphs[${graphIndex}].distortions[${index}]`;
    function requireType(field, type) {
      if (typeof instructions[field] !== type)
        throw new Error(`${errorPrefix}.${field} must be of type ${type}`);
    }
    if (typeof instructions !== "object")
      throw new Error(errorPrefix + " must be an object");

    requireType("name", "string");
    requireType("source", "string");
    requireType("hash", "string");
    requireType("isFunction", "boolean");
    requireType("rules", "object");

    // XXX ajvincent We're not going to attempt parsing instructions.source now.
    const rulesMembers = ["value"];
    if (instructions.isFunction) {
      /*
      rulesMembers.push("proto");
      rulesMembers.push("instance");
      */
    }
    rulesMembers.forEach(function(member) {
      if (typeof instructions.rules[member] !== "object") {
        throw new Error(
          `${errorPrefix}.rules.${member} must be an object`
        );
      }
      try {
        DistortionsRules.validateConfiguration(instructions.rules[member]);
      }
      catch (msg) {
        throw new Error(`${errorPrefix}.rules.${member}.${msg}`);
      }
    }, this);

    if (!instructions.isFunction)
      return;

    // Special rules for functions
  },

  /**
   * @private
   */
  collectCommonFileURLs: async function() {
    if (this.testMode && this.testMode.fakeFiles) {
      this.setTestModeFiles();
    }
    else {
      let files = this.commonFilesInput.files;
      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        DistortionsManager.commonFileURLs.set(file, URL.createObjectURL(file));
      }
    }

    let urlArray = [];
    DistortionsManager.commonFileURLs.forEach(function(url) {
      urlArray.push(url);
    });

    if (this.commonFilesLoaded) {
      const iframe = window.document.getElementById("BlobLoader");
      let p = new Promise(function (resolve) {
        iframe.addEventListener("load", resolve, {once: true, capture: true});
      });
      this.commonFilesLoaded = false;
      iframe.contentWindow.location.reload(true);
      await p;
    }

    this.commonFilesLoaded = true;
    while (urlArray.length) {
      await DistortionsManager.BlobLoader.addCommonURL(urlArray.shift());
    }
  },

  getConfiguration: async function() {
    if (this.commonFilesInput.files.length || 
        (this.testMode && this.testMode.fakeFiles)) {
      await this.collectCommonFileURLs();
    }

    var config = {
      "configurationSetup": {},
      "membrane": {},
      "graphs": []
    };
    if (!this.configFileInput.files.length && (
        !this.testMode || !this.testMode.configSource))
      return config;

    try {
      {
        let p, jsonAsText;
        if (this.testMode) {
          p = Promise.resolve(this.testMode.configSource);
        }
        else {
          const file = this.configFileInput.files[0];
          p = FileReaderPromise(file, "readAsText");
        }

        jsonAsText = await p;
        config = JSON.parse(jsonAsText);
      }

      // Validate the configuration.
      {
        if (!Array.isArray(config.graphs))
          throw new Error("config.graphs must be an array of objects");

        let stringKeys = new Set();
        config.graphs.forEach((graph, graphIndex) => {
          if (typeof graph.name !== "string")
            throw new Error(`config.graphs[${graphIndex}].name must be a string`);
          if (typeof graph.isSymbol !== "boolean")
            throw new Error(`config.graphs[${graphIndex}].isSymbol must be a boolean`);
          if (!graph.isSymbol) {
            if (stringKeys.has(graph.name)) {
              throw new Error(
                `config.graphs[${graphIndex}].name = "${graph.name}", ` +
                "but this name appears earlier in config.graphs, and neither name is a symbol"
              );
            }
            stringKeys.add(graph.name);
          }

          if (!Array.isArray(graph.distortions)) {
            throw new Error(`config.graphs[${graphIndex}].distortions must be an array`);
          }

          graph.distortions.forEach(function(item, index) {
            this.validateDistortions(item, index, graphIndex);
          }, this);
        });
      }

      HandlerNames.importConfig(config);
      OuterGridManager.setCurrentErrorText(null);
    }
    catch (e) {
      OuterGridManager.setCurrentErrorText(e);
      throw e;
    }

    return config;
  }
};

{
  let elems = {
    "commonFilesInput": "grid-outer-load-location",
    "configFileInput":  "grid-outer-load-config-input",
  };
  let keys = Reflect.ownKeys(elems);
  keys.forEach(function(key) {
    defineElementGetter(window.LoadPanel, key, elems[key]);
  });
}
