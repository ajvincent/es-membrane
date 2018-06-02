window.LoadPanel = {
  isInitialized: false,
  
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
    this.testMode.requiredFiles = [
      "../dist/browser/assert.js",
      "../dist/browser/sharedUtilities.js",
      "../dist/browser/es-membrane.js",
      "../dist/browser/mocks.js"
    ];
    this.testMode.requiredFiles.forEach(function(filepath) {
      this.commonFileURLs.set(
        filepath, (new URL(filepath, window.location.href)).href
      );
    }, this);
  },

  setTestModeZip: function() {
    this.testMode.fakeZip = true;
    const fileList = [
      "browser/assert.js",
      "browser/sharedUtilities.js",
      "browser/es-membrane.js",
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

    p = p.then(async function(blob) {
      LoadPanel.testMode.blob = blob;
      return LoadPanel.update("fromZip");
    });

    p = p.then(function() {
      let requiredFiles = fileList.slice(0, 4);
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
      let checkedSet;
      {
        let checkedPaths = [];
        const config = window.MembranePanel.cachedConfig;
        if (config && config.configurationSetup &&
            config.configurationSetup.useZip &&
            Array.isArray(config.configurationSetup.commonFiles)) {
          checkedPaths = config.configurationSetup.commonFiles.slice(0);
        }
        checkedSet = new Set(checkedPaths);
      }

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
        check.checked = checkedSet.has(relPath);

        item.children[1].appendChild(check);
        meta.checkbox = check;
      }, this);
    }

    this.zipForm.appendChild(tree);
    styleAndMoveTreeColumns(tree);
  },

  validateConfiguration: function(config) {
    if ((typeof config.configurationSetup !== "object") ||
        (config.configurationSetup === null))
      throw new Error("config.configurationSetup must be an object");
    {
      const setup = config.configurationSetup;
      if (typeof setup.useZip !== "boolean")
        throw new Error(
          "config.configurationSetup.useZip must be true or false"
        );
      if (!Array.isArray(setup.commonFiles) ||
          setup.commonFiles.some(val => typeof val !== "string")) {
        throw new Error(
          "config.configurationSetup.commonFiles must be an array of strings"
        );
      }

      if ((typeof setup.formatVersion !== "number") ||
          (!/^\d+(?:\.\d)?$/.test(setup.formatVersion.toString(10))))
        throw new Error(
          "config.configurationSetup.formatVersion must be a floating point version number"
        );
      if ((typeof setup.lastUpdated !== "string") ||
          isNaN(Date.parse(setup.lastUpdated))) {
        throw new Error(
          "config.configurationSetup.lastUpdated must be a date string"
        );
      }
      if (("comments" in setup) &&
          (!Array.isArray(setup.comments) ||
           setup.comments.some(val => typeof val !== "string"))) {
        throw new Error(
          "config.configurationSetup.comments must be an array of strings or undefined"
        );
      }
    }

    if ((typeof config.membrane !== "object") ||
        (config.membrane === null))
      throw new Error("config.membrane must be an object");
    {
      const mConfig = config.membrane;
      if ((typeof mConfig.passThroughSource !== "string") &&
          (mConfig.passThroughSource !== null)) {
        throw new Error(
          "config.membrane.passThroughSource must be a string or null"
        );
      }
      if (typeof mConfig.passThroughEnabled !== "boolean")
        throw new Error(
          "config.membrane.passThroughEnabled must be true or false"
        );
      if (typeof mConfig.primordialsPass !== "boolean")
        throw new Error(
          "config.membrane.primordialsPass must be true or false"
        );
      if (("comments" in mConfig) &&
          (!Array.isArray(mConfig.comments) ||
           mConfig.comments.some(val => typeof val !== "string"))) {
        throw new Error(
          "config.membrane.comments must be an array of strings or undefined"
        );
      }
    }

    if (!Array.isArray(config.graphs))
      throw new Error("config.graphs must be an array of objects");

    let stringKeys = new Set();
    config.graphs.forEach(this.validateGraph.bind(this, stringKeys));
  },

  validateGraph: function(stringKeys, graph, graphIndex) {
    const errorPrefix = `config.graphs[${graphIndex}]`;

    function requireType(field, type, extra = "", path = []) {
      let obj = graph;
      let msg = errorPrefix;
      path = path.slice(0);
      path.push(field);
      while (path.length) {
        let nextPart = path.shift();
        if (isNaN(nextPart))
          msg += "." + nextPart;
        else
          msg += `[${nextPart}]`;
        obj = obj[nextPart];
      }
      if (type === "array") {
        if (!Array.isArray(obj))
          throw new Error(`${msg} must be an array${extra}.`);
      }
      else if (typeof obj !== type)
        throw new Error(`${msg} must be of type ${type}${extra}.`);
      if ((type === "object") && (obj === null))
        throw new Error(`${msg} must be a non-null object${extra}.`);
    }

    requireType("name", "string");
    requireType("isSymbol", "boolean");
    if (!graph.isSymbol) {
      if (stringKeys.has(graph.name)) {
        throw new Error(
          `config.graphs[${graphIndex}].name = "${graph.name}", ` +
          "but this name appears earlier in config.graphs, and neither name is a symbol"
        );
      }
      stringKeys.add(graph.name);
    }
    if (graph.passThroughSource !== null)
      requireType("passThroughSource", "string", " or null");
    requireType("passThroughEnabled", "boolean");
    requireType("primordialsPass", "boolean");

    requireType("distortions", "array");
    graph.distortions.forEach(function(distortionSet, index) {
      requireType("about", "object", "", ["distortions", index]);
      const aboutPath = ["distortions", index, "about"];
      requireType("valueName", "string", "", aboutPath);
      requireType("isFunction", "boolean", "", aboutPath);

      // Exactly one of these must exist:
      // getExample, filterToMatch, getInstance
      {
        let actualKeys = Reflect.ownKeys(distortionSet.about);
        let foundKey = null, pass = false;
        ["getExample", "filterToMatch", "getInstance"].forEach(function(key) {
          if (!actualKeys.includes(key))
            return;
          if (foundKey) {
            pass = false;
            return;
          }
          foundKey = key;
          pass = true;
          requireType(key, "string", "", aboutPath);
        });

        if (!pass) {
          throw new Error(
            `${errorPrefix}.distortions[${index}].about must have exactly one of these properties: "getExample", "filterToMatch", "getInstance"`
          );
        }
      }

      if (typeof distortionSet.about.comments !== "undefined") {
        requireType("comments", "array", " or undefined", aboutPath);
        distortionSet.about.comments.forEach(function(subitem, subindex) {
          const commentPath = aboutPath.slice(0);
          commentPath.push(subindex);
          requireType(subindex, "string", "", commentPath);
        });
      }

      keys = Reflect.ownKeys(distortionSet);
      keys.splice(keys.indexOf("about"), 1);
      if (keys.length === 0) {
        throw new Error(
          `${errorPrefix}.distortions[${index}] must have a property besides about.`
        );
      }
      keys.forEach(function(key) {
        requireType(key, "object", "", ["distortions", index]);
        try {
          DistortionsRules.validateConfiguration(distortionSet[key]);
        }
        catch (errMsg) {
          throw new Error(
            `${errorPrefix}.distortions[${index}].${key}.${errMsg}`
          );
        }
      });
    }, this);

    // Optional String[] properties of each graph
    [
      "proxyListeners",
      "functionListeners",
      "comments"
    ].forEach(function(arrayName) {
      if (typeof graph[arrayName] !== "undefined") {
        requireType(arrayName, "array", " or undefined");
        graph[arrayName].forEach(function(listener, index) {
          requireType(index, "string", "", [arrayName]);
        });
      }
    });
  },

  getCommonFileOrdering: function() {
    let paths = [];
    let walker = document.createTreeWalker(this.loadOrderTree, NodeFilter.SHOW_TEXT, null, true);
    let found = false;
    while (walker.nextNode()) {
      paths.push(walker.currentNode.nodeValue);
      found = true;
    }

    if (!found && this.commonFilesInput.files.length)
      throw new Error("No common files selected?");
    return paths;
  },

  getInitialFileOrder: function(config) {
    if (!config)
      config = {};
    if (!config.configurationSetup)
      config.configurationSetup = {};
    if (!Array.isArray(config.configurationSetup.commonFiles))
      config.configurationSetup.commonFiles = [];

    const commonFiles = config.configurationSetup.commonFiles;

    // Get the list of raw file paths.
    const rawFilePaths = [];
    const excludedPaths = [];
    if (this.testMode && this.testMode.fakeFiles) {
      if (commonFiles.length == 0) {
        this.testMode.requiredFiles.forEach((path) => commonFiles.push(path));
      }
    }
    else if (this.zipData.map) {
      this.zipData.map.forEach(function(meta, relPath) {
        if (!meta.checkbox)
          return;
        let paths = meta.checkbox.checked ? rawFilePaths : excludedPaths;
        paths.push(relPath);
      });
    }
    else if (this.commonFilesInput.files.length) {
      const filesInput = this.commonFilesInput.files;
      for (let i = 0; i < filesInput.length; i++)
        rawFilePaths.push(filesInput[i].name);
    }

    let orderedFiles;
    if (excludedPaths.length) {
      orderedFiles = commonFiles.filter(function(j) {
        return !excludedPaths.includes(j);
      });
    }
    else
      orderedFiles = commonFiles;

    orderedFiles = orderedFiles.concat(rawFilePaths.filter(function(k) {
      return !commonFiles.includes(k);
    }));

    return orderedFiles;
  },

  buildFileOrderTree: function(config) {
    const orderedFiles = this.getInitialFileOrder(config);

    // Clear the file tree.
    this.loadOrderTree.classList.add("hidden");
    {
      let range = document.createRange();
      range.selectNodeContents(this.loadOrderTree);
      range.deleteContents();
      range.detach();
    }

    if (orderedFiles.length === 0)
      return;

    // Create the rows.
    const rowFrag = this.loadOrderRow.content.cloneNode(true);
    {
      for (let i = rowFrag.childNodes.length - 1; i >= 0; i--) {
        let child = rowFrag.childNodes[i];
        if (child.nodeType !== 1)
          rowFrag.removeChild(child);
      }
    }

    const frag = document.createDocumentFragment();
    orderedFiles.forEach(function(path) {
      const row = rowFrag.cloneNode(true);
      row.firstChild.appendChild(document.createTextNode(path));
      frag.appendChild(row);
    }, this);

    frag.childNodes[1].disabled = true;
    frag.lastChild.disabled = true;

    this.loadOrderTree.appendChild(frag);
    this.loadOrderTree.classList.remove("hidden");
  },
  
  // nsIDOMEventListener
  handleEvent: function(event) {
    if ((event.target instanceof HTMLInputElement) &&
        (event.target.form === this.zipForm) &&
        (event.target.name == "selectFile")) {
      this.updateLoadFiles();
      return;
    }

    if ((event.target instanceof HTMLButtonElement) &&
        (event.currentTarget === this.loadOrderTree) &&
        !event.target.disabled) {
      const isUp = event.target.classList.contains("up");
      let elem1, elem2;
      if (isUp) {
        elem1 = event.target.previousElementSibling;
        let i = 0;
        for (elem2 = elem1; i < 3; i++)
          elem2 = elem2.previousElementSibling;
      }
      else {
        // event.target.classList.has("down")
        elem1 = event.target.previousElementSibling.previousElementSibling;
        elem2 = event.target.nextElementSibling;
      }
      elem1.appendChild(elem2.firstChild);
      elem2.appendChild(elem1.firstChild);
    }
  },

  update: async function(action = "undeclared") {
    if (!this.isInitialized) {
      this.loadOrderTree.addEventListener("click", this, false);
      this.commonFilesInput.form.reset();
      this.configFileInput.form.reset();
      this.zipForm.reset();
      this.isInitialized = true;
    }

    if ((action == "pageLoad") || (action == "undeclared"))
      return;

    if (action == "fromZip") {
      this.commonFilesInput.form.reset();
    }
    else if (action == "fromFlatFiles") {
      this.zipForm.reset();
    }

    if (this.testMode && this.testMode.fakeZip)
      await this.updateZipTree(this.testMode.blob);
    else if (LoadPanel.zipFileInput.files.length)
      await this.updateZipTree(LoadPanel.zipFileInput.files[0]);
    else
      await this.updateLoadFiles();
  },

  updateLoadFiles: async function() {
    window.MembranePanel.cachedConfig = null;
    await window.MembranePanel.reset();
  },

  updateZipTree: async function(blob) {
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
          if (LoadPanel.commonFileURLs.has(relPath))
            return;
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
        this.commonFileURLs.set(file.name, URL.createObjectURL(file));
      }
    }
  },

  getConfiguration: async function() {
    var config = {
      "configurationSetup": {
        "commonFiles": []
      },
      "membrane": {},
      "graphs": []
    };
    // This is about the configuration file, not the common files...
    // (I write this because I've stumbled here about a dozen times.)
    if (!this.configFileInput.files.length &&
        (!this.testMode || !this.testMode.configSource)) {
      await this.collectCommonFileURLs();
      await this.buildFileOrderTree(config);
      await this.loadCommonScripts();
      config.configurationSetup.commonFiles = this.getCommonFileOrdering();
      return config;
    }

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

        await this.collectCommonFileURLs();
        await this.buildFileOrderTree(config);
        await this.loadCommonScripts();
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
    if (this.commonFilesLoaded) {
      const iframe = window.document.getElementById("BlobLoader");
      let p = new Promise(function (resolve) {
        iframe.addEventListener("load", resolve, {once: true, capture: true});
      });
      this.commonFilesLoaded = false;
      iframe.contentWindow.location.reload(true);
      await p;
    }

    let pathArray = this.getCommonFileOrdering();

    if (pathArray.length &&
        this.commonFileURLs &&
        !this.commonFileURLs.size &&
        (LoadPanel.zipFileInput.files.length ||
         this.commonFilesInput.files.length)) {
      /* XXX ajvincent if you encounter this running the project's automated
       * tests, it's far more likely you broke something in the project...
       */
      throw new Error("Path array defined, script sequence defined, but no script mappings... could it be the script list is corrupted?");
    }

    for (let i = 0; i < pathArray.length; i++) {
      let path = pathArray[i];
      let url = this.commonFileURLs ? this.commonFileURLs.get(path) : null;
      if (!url)
        continue;
      await DistortionsManager.BlobLoader.addCommonURL(url);
    };
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
    "loadOrderTree":    "grid-outer-load-fileorder",
    "loadOrderRow":     "fileorder-gridcells",
  };
  let keys = Reflect.ownKeys(elems);
  keys.forEach(function(key) {
    defineElementGetter(window.LoadPanel, key, elems[key]);
  });
}

window.addEventListener("load", function() {
  window.LoadPanel.update("pageLoad");
}, true);
