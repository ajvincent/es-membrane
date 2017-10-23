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

  collectCommonFileURLs: function() {
    if (this.testMode) {
      this.setTestModeFiles();
    }
    else {
      if (!this.startFilesForm.reportValidity())
        return;
      let files = this.commonFilesInput.files;
      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        DistortionsManager.commonFileURLs.set(file, URL.createObjectURL(file));
      }
    }
  },

  startWithGraphNames: function() {
    this.collectCommonFileURLs();
    if (!this.testMode && !this.startFilesForm.reportValidity())
      return;
    this.enableOtherPanels();
  },

  startWithConfigFile: async function(testJSONSource) {
    var config;
    this.collectCommonFileURLs();
    if (!this.testMode && !this.startFilesForm.reportValidity())
      return;
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
