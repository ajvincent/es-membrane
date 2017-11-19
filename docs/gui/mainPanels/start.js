// see also HandlerNames.js

const StartPanel = window.StartPanel = {
  // private, see below
  commonFilesInput: null,
  startFilesForm: null,
  configFileForm: null,
  configFileInput: null,
  configFileSubmit: null,
  configFileError: null,
  graphNamesForm: null,
  graphNamesSubmit: null,

  // public for testing purposes
  testMode: false,

  setTestModeFiles: function() {
    [
      "../dist/browser/assert.js",
      "../dist/browser/sharedUtilities.js",
      "../dist/browser/es7-membrane.js",
      "../dist/browser/mocks.js"
    ].forEach(function(filepath) {
      DistortionsManager.commonFileURLs.set(
        filepath, new URL(filepath, window.location.href)
      );
    });
  },

  /**
   * @private
   */
  collectCommonFileURLs: async function() {
    if (this.testMode) {
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
      urlArray.push(url.href);
    });
    while (urlArray.length) {
      await DistortionsManager.BlobLoader.addCommonURL(urlArray.shift());
    }
  },

  startWithGraphNames: async function() {
    if (!this.testMode && !this.startFilesForm.reportValidity())
      return;
    await this.collectCommonFileURLs();
    this.enableOtherPanels();
  },

  validateDistortions:
  function(instructions, index, graphIndex, graphsTotal) {
    const errorPrefix = `config.distortionsByGraph[${graphIndex}][${index}]`;
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

    {
      const max = graphsTotal - 1;
      if (!Number.isInteger(instructions.sourceGraphIndex) ||
          (instructions.sourceGraphIndex < 0) ||
          (instructions.sourceGraphIndex >= graphsTotal))
        throw new Error(
          `${errorPrefix}.sourceGraphIndex must be an integer from 0 to ${max}`
        );
    }

    if (instructions.sourceGraphIndex === graphIndex)
      throw new Error(
        `${errorPrefix}.sourceGraphIndex cannot be the target graph index ${graphIndex}`
      );

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

  startWithConfigFile: async function(testJSONSource) {
    if (!this.testMode && !this.startFilesForm.reportValidity())
      return;
    var config;
    await this.collectCommonFileURLs();
    try {
      {
        let p, jsonAsText;
        if (this.testMode) {
          p = Promise.resolve(testJSONSource);
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
        if (!Array.isArray(config.graphNames))
          throw new Error("config.graphNames must be an array of strings");

        if (!Array.isArray(config.graphSymbolLists) || !config.graphSymbolLists.every(function(key, index) {
          let rv = Number.isInteger(key) && (0 <= key) && (key < config.graphNames.length);
          if (rv && (index > 0))
            rv = key > config.graphSymbolLists[index - 1];
          return rv;
        }))
          throw new Error("config.graphSymbolLists must be an ordered array of unique non-negative integers, each member of which is less than config.graphNames.length");

        let stringKeys = new Set();
        config.graphNames.forEach((key, index) => {
          if (typeof key !== "string")
            throw new Error("config.graphNames must be an array of strings");
          if (!(config.graphSymbolLists.includes(index))) {
            if (stringKeys.has(key)) {
              throw new Error(`config.graphNames[${index}] = "${key}", but this string name appears earlier in config.graphNames`);
            }
            stringKeys.add(key);
          }
        });

        if (!Array.isArray(config.distortionsByGraph) ||
            (config.distortionsByGraph.length != config.graphNames.length) ||
            !config.distortionsByGraph.every(Array.isArray))
          throw new Error(
            `config.distortionsByGraph must be an array with length ` +
            config.graphNames.length + ` of arrays`
          );

        config.distortionsByGraph.forEach(function(items, graphIndex) {
          items.forEach(function(item, index) {
            this.validateDistortions(
              item, index, graphIndex, config.graphNames.length
            );
          }, this);
        }, this);
      }

      HandlerNames.importConfig(config);

      this.enableOtherPanels();
    }
    catch (e) {
      if (!this.configFileError.firstChild) {
        let text = document.createTextNode("");
        this.configFileError.appendChild(text);
      }
      this.configFileError.firstChild.nodeValue = e.message;
      throw e;
    }
  },

  enableOtherPanels: function() {
    OuterGridManager.startPanelRadio.disabled = true;
    OuterGridManager.addPanelRadio.disabled = false;
    OuterGridManager.outputPanelRadio.disabled = false;

    OuterGridManager.addPanelRadio.click();
  }
};

{
  let elems = {
    "commonFilesInput": "grid-outer-start-location",
    "startFilesForm":   "grid-outer-start-filesform",
    "configFileForm":   "grid-outer-start-configform",
    "configFileInput":  "grid-outer-start-config-input",
    "configFileSubmit": "grid-outer-start-configform-submit",
    "configFileError":  "grid-outer-start-postSubmitError",
    "graphNamesForm":   "grid-outer-start-graphnamesform",
    "graphNamesSubmit": "grid-outer-start-graphnames-submit",
  };
  let keys = Reflect.ownKeys(elems);
  keys.forEach(function(key) {
    defineElementGetter(StartPanel, key, elems[key]);
  });
}
