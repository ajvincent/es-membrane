window.LoadPanel = {
  update: function() {
    // do nothing
  },
  
  // private, see below
  commonFilesInput: null,
  configFileInput: null,

  commonFilesLoaded: false,
  commonFileURLs: new Map(),

  // private
  zipData: {
    // instance of JSZip
    reader: null,

    map: null,
  },

  // treat this as restricted to testing purposes
  testMode: null,

  setTestModeFiles: function() {
    // XXX ajvincent This is wrong, because it establishes a default ordering.
    [
      "../dist/browser/assert.js",
      "../dist/browser/sharedUtilities.js",
      "../dist/browser/es7-membrane.js",
      "../dist/browser/mocks.js"
    ].forEach(function(filepath) {
      this.commonFileURLs.set(
        filepath, (new URL(filepath, window.location.href)).href
      );
    }, this);
  },

  setTestModeZip: function() {
    const fileList = [
      "browser/assert.js",
      "browser/sharedUtilities.js",
      "browser/es7-membrane.js",
      "browser/mocks.js",
      "browser/fireJasmine.js"
    ];

    let zip = new window.JSZip();
    let p = Promise.all(fileList.map(function(filepath) {
      const abspath = (new URL("../dist/" + filepath, window.location.href)).href;
      let request = new Request(abspath);
      let filePromise = fetch(request);
      filePromise = filePromise.then(response => response.blob());
      filePromise = filePromise.then(function(blob) {
        zip.file(filepath, blob);
      });
      return filePromise;
    }));

    p = p.then(function() {
      return zip.generateAsync({type: "blob"});
    });

    p = p.then(this.updateZipTree.bind(this));

    p = p.then(function() {
      let requiredFiles = fileList.slice(0, 4);
      requiredFiles.sort();
      LoadPanel.testMode.requiredFiles = requiredFiles;
    });

    return p;
  },

  notifyTestOfInit: function(name) {
    if (this.testMode) {
      console.log("postMessage requested:", `${name} initialized`);
      window.postMessage(`${name} initialized`, window.location.origin);
    }
  },

  updateFlatFiles: function() {
    this.zipForm.reset();
    this.clearZipTree();
  },

  clearZipTree: function() {
    if (this.testMode && this.testMode.requiredFiles)
      this.testMode.requiredFiles = null;

    if (this.zipForm.children.length > 1) {
      let range = document.createRange();
      range.setStartAfter(this.zipForm.firstElementChild);
      range.setEndAfter(this.zipForm.lastChild);
      range.deleteContents();
      range.detach();
    }

    // clean up previous data
    this.commonFileURLs.forEach(function(url) {
      URL.revokeObjectURL(url);
    }, this);
    this.commonFileURLs.clear();
  },

  buildZipTree: function() {
    // Get the files for the existing environment.
    this.zipData.map = new Map();
    const tree = this.zipTreeTemplate.content.firstElementChild.cloneNode(true);
    tree.setAttribute("id", "grid-outer-load-ziptree");

    {
      // First pass: Extract all the file paths.
      // In particular, do not assume that JSZip sorts its entries.
      let paths = [];
      {
        const _this = this;
        this.zipData.reader.forEach(function(relPath, zipObject) {
          _this.zipData.map.set(relPath, {zipObject});
          paths.push(relPath);
        }, this);
      }
      paths.sort();

      // Second pass: establish the tree.
      const root = tree.getElementsByTagName("ul")[0];
      const treeitemBase = this.zipItemTemplate.content.firstElementChild;
      paths.forEach(function(relPath) {
        const item = treeitemBase.cloneNode(true);
        let isRoot, leafName;
        {
          let pathSteps = relPath.split("/");
          if (pathSteps[pathSteps.length - 1] === "")
            pathSteps.pop();
          isRoot = pathSteps.length === 1;
          leafName = pathSteps[pathSteps.length - 1];
        }
        item.firstElementChild.appendChild(document.createTextNode(leafName));

        const meta = this.zipData.map.get(relPath);
        meta.listitem = item;

        if (isRoot) {
          root.appendChild(item);
          return;
        }

        const parentPath = relPath.substr(0, relPath.length - leafName.length);
        const parentItem = this.zipData.map.get(parentPath).listitem;
        if (!parentItem.classList.contains("collapsible")) {
          let ul = document.createElement("ul");
          parentItem.appendChild(ul);

          let check = document.createElement("input");
          check.setAttribute("type", "checkbox");
          check.classList.add("collapsible-check");
          parentItem.insertBefore(check, parentItem.children[1]);

          parentItem.classList.add("collapsible");
        }

        parentItem.lastElementChild.appendChild(item);
      }, this);

      // Third pass:  establish the loadable files checkboxes.
      paths.filter((p) => p.endsWith(".js")).forEach(function(relPath) {
        const meta = this.zipData.map.get(relPath);
        const item = meta.listitem;
        if (item.classList.contains("collapsible")) {
          return;
        }
        let check = document.createElement("input");
        check.setAttribute("type", "checkbox");
        check.setAttribute("name", "selectFile");
        check.setAttribute("value", relPath);
        item.children[1].appendChild(check);
        meta.checkbox = check;
      }, this);
    }

    this.zipForm.appendChild(tree);
    styleAndMoveTreeColumns(tree);
  },

  validateConfiguration: function(config) {
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

  // nsIDOMEventListener
  handleEvent: function(event) {
    if ((event.target.form === this.zipForm) &&
        (event.target.name == "selectFile")) {
      this.updateLoadFiles();
    }
  },

  updateLoadFiles: async function() {
    window.MembranePanel.cachedConfig = null;
    await window.MembranePanel.reset();
  },

  updateZipTree: async function(blob) {
    this.commonFilesInput.form.reset();
    this.zipData.map = null;
    if (!blob) {
      this.zipData.reader = null;
      return;
    }

    this.clearZipTree();
    await this.readFromZip(blob);
    this.buildZipTree();
    // Beyond this point, we cannot fail.

    await this.updateLoadFiles();

    // Fourth pass:  Attach event listeners.
    this.zipData.map.forEach(function(meta, relPath) {
      if (meta.checkbox)
        meta.checkbox.addEventListener("change", this, true);
    }, this);
  },

  readFromZip: async function(blob) {
    this.zipData.reader = new window.JSZip();
    {
      let isValidZip = false;
      try {
        await this.zipData.reader.loadAsync(blob, {createFolders: true});
        isValidZip = true;
      }
      finally {
        if (!this.testMode)
          this.zipFileInput.setCustomValidity(
            isValidZip ? "" : "This does not appear to be a ZIP file."
          );
      }
    }
  },

  /**
   * @private
   */
  collectCommonFileURLs: async function() {
    if (this.testMode && this.testMode.fakeFiles) {
      this.setTestModeFiles();
    }
    else if (this.zipData.map) {
      let promiseArray = [];
      this.zipData.map.forEach(function(meta, relPath) {
        if (!meta.checkbox || !meta.checkbox.checked)
          return;
        let p = meta.zipObject.async("blob");
        p = p.then(function(blob) {
          const url = URL.createObjectURL(blob);
          LoadPanel.commonFileURLs.set(relPath, url);
        });
        promiseArray.push(p);
      });
      await Promise.all(promiseArray);
    }
    else if (this.commonFilesInput.files.length) {
      let files = this.commonFilesInput.files;
      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        this.commonFileURLs.set(file, URL.createObjectURL(file));
      }
    }
  },

  getConfiguration: async function() {
    if (this.commonFilesInput.files.length ||
        this.zipData.map ||
        (this.testMode && this.testMode.fakeFiles)) {
      await this.collectCommonFileURLs();
      await this.loadCommonScripts();
    }

    var config = {
      "configurationSetup": {},
      "membrane": {},
      "graphs": []
    };
    if (!this.configFileInput.files.length &&
        (!this.testMode || !this.testMode.configSource))
      return config;

    try {
      config = await this.readConfigFromFile();
      this.validateConfiguration(config);


      if (config.configurationSetup &&
          Array.isArray(config.configurationSetup.commonFiles)) {
        if (this.zipData.map && (config.configurationSetup.useZip === true)) {
          const fileSet = new Set(config.configurationSetup.commonFiles);
          this.zipData.map.forEach(function(meta, relPath) {
            if (meta.checkbox)
              meta.checkbox.checked = fileSet.has(relPath);
          }, this);
        }

        // file load ordering goes here
      }

      HandlerNames.importConfig(config);
      OuterGridManager.setCurrentErrorText(null);
    }
    catch (e) {
      OuterGridManager.setCurrentErrorText(e);
      throw e;
    }

    return config;
  },

  loadCommonScripts: async function() {
    let urlArray = [];
    this.commonFileURLs.forEach(function(url) {
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

    while (urlArray.length) {
      await DistortionsManager.BlobLoader.addCommonURL(urlArray.shift());
    }
    this.commonFilesLoaded = true;
  },

  readConfigFromFile: async function() {
    let p, jsonAsText;
    if (this.testMode) {
      p = Promise.resolve(this.testMode.configSource);
    }
    else {
      const file = this.configFileInput.files[0];
      p = FileReaderPromise(file, "readAsText");
    }

    jsonAsText = await p;
    let isJSON = false;
    try {
      var config = JSON.parse(jsonAsText);
      isJSON = true;
    }
    finally {
      if (!this.testMode)
        this.configFileInput.setCustomValidity(
          isJSON ? "" : "This does not appear to be a JSON file."
        );
    }
    return config;
  },
};

{
  let elems = {
    "commonFilesInput": "grid-outer-load-location",
    "configFileInput":  "grid-outer-load-config-input",
    "zipForm":          "grid-outer-load-zipform",
    "zipFileInput":     "grid-outer-load-zipfile",
    "zipTreeTemplate":  "zipform-tree",
    "zipItemTemplate":  "zipform-listitem",
  };
  let keys = Reflect.ownKeys(elems);
  keys.forEach(function(key) {
    defineElementGetter(window.LoadPanel, key, elems[key]);
  });
}
