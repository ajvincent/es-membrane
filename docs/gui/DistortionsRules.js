window.DistortionsRules = function DistortionsRules() {
  this.inputToGroupMap = new Map(/*
    <input type="checkbox">: groupName
  */);
  this.groupToInputsMap = new Map(/*
    groupName: <input type="checkbox">[]
  */);

  this.value = null;
  this.gridtree = null;
  this.treeroot = null;
  this.isGroup = false;
  this.isTopValue = false;
  this.filterOwnKeysControl = null;
  this.helpAndNotesMap = null;
};

/**
 * Throws a string if a configuration is unusable.
 *
 * @param config {Object} The configuration to test.
 */
DistortionsRules.validateConfiguration = function(config) {
  // assume we've tested typeof config === "object" already

  function requireType(field, type) {
    if (typeof config[field] !== type)
      throw `${field} must be of type ${type}`;
  }

  // filterOwnKeys
  {
    const errPrefix = "filterOwnKeys must be null or an array of unique strings and symbols";
    if (!("filterOwnKeys" in config))
      throw `${errPrefix} (absent)`;
    if (config.filterOwnKeys === null) 
    {
      // do nothing
    }
    else if (!Array.isArray(config.filterOwnKeys))
      throw `${errPrefix} (not an array)`;
    else {
      const keys = config.filterOwnKeys.slice(0).filter(function(k) {
        return typeof k !== "symbol";
      });
      keys.sort();
      let lastKey;
      keys.forEach(function(key, index) {
        if (typeof key !== "string")
          throw `${errPrefix} (not a string or symbol: ${key})`;
        if ((index > 0) && (key === lastKey))
          throw `${errPrefix} (duplicate key "${key}")`;
        lastKey = key;
      });
    }
  }

  // proxyTraps
  {
    if (!Array.isArray(config.proxyTraps))
      throw "config.proxyTraps is not an array";
    const allTraps = [
      "getPrototypeOf",
      "setPrototypeOf",
      "isExtensible",
      "preventExtensions",
      "getOwnPropertyDescriptor",
      "defineProperty",
      "has",
      "get",
      "set",
      "deleteProperty",
      "ownKeys",
      "apply",
      "construct"
    ];
    const available = new Set(allTraps);
    config.proxyTraps.forEach(function(trap) {
      if (available.has(trap)) {
        available.delete(trap);
        return;
      }
      if (allTraps.includes(trap))
        throw `config.proxyTraps has a duplicate string: ${trap}`;
      throw `config.proxyTraps has an unexpected value: ${trap}`;
    });
  }

  requireType("inheritFilter", "boolean");
  requireType("storeUnknownAsLocal", "boolean");
  requireType("requireLocalDelete", "boolean");
  requireType("useShadowTarget", "boolean");
  if (typeof config.truncateArgList === "boolean")
  {
    // do nothing
  }
  else if (!Number.isInteger(config.truncateArgList) ||
           (config.truncateArgList < 0))
    throw "truncateArgList must be a boolean or a non-negative integer";
};

DistortionsRules.setDistortionGroup = function(event) {
  const dialog = event.target.parentNode;
  const button = dialog.parentNode.firstElementChild;
  if (event.key == "Enter") {
    const value = event.target.value;
    const list = document.getElementById("distortions-groups-list");
    let option = list.firstElementChild;
    while (option && option.value !== value)
      option = option.nextElementSibling;

    const valid = event.target.checkValidity();
    if (valid || option) {
      button.firstChild.nodeValue = value;

      if (!option && valid && value.length) {
        option = document.createElement("option");
        option.appendChild(document.createTextNode(value));
        option.value = value;
        list.appendChild(option);
      }
    }
  }

  if ((event.key == "Enter") || 
      (event.key == "Escape"))
    button.focus();
};

DistortionsRules.prototype = {
  propertyTreeTemplate: null,

  bindUI: function() {
    {
      const links = this.treeroot.getElementsByClassName("notesPanelLink");
      for (let i = 0; i < links.length; i++) {
        links[i].addEventListener("click", this, true);
      }
    }

    {
      let multistates = this.treeroot.getElementsByClassName("multistate");
      for (let i = 0; i < multistates.length; i++) {
        multistates[i].addEventListener("click", MultistateHandler, true);
        updateMultistate(multistates[i]);
      }
    }

    {
      let i = this.gridtree.getElementsByClassName("filterOwnKeys-control")[0];
      this.filterOwnKeysControl = i;
    }

    {
      let lists = this.treeroot.getElementsByTagName("ul");
      for (let i = 0; i < lists.length; i++) {
        let list = lists[i];
        if (list.dataset.group)
          this.bindULInputsByGroup(list);
      }
    }

    {
      const buttons = this.treeroot.getElementsByClassName("distortions-group");
      for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", this, true);
        buttons[i].nextElementSibling.addEventListener("click", this, true);
      }
    }
  },

  /**
   * Bind HTML inputs to this.updateGroup.
   *
   * @argument {list} <html:ul data-group="...">
   *
   * @private
   */
  bindULInputsByGroup: function(list) {
    const inputList = [], groupName = list.dataset.group;
    this.groupToInputsMap.set(groupName, inputList);
    let items = list.children;
    for (let i = 0; i < items.length; i++) {
      let item = items[i];

      let label = item.firstElementChild;
      let propertyName = label.dataset.name || label.firstChild.nodeValue;

      let input = item.children[1].firstElementChild;
      while (input) {
        if (!input.dataset.name)
          input.dataset.name = propertyName;
        inputList.push(input);
        if ((propertyName === "truncateArgList") &&
            (input.classList.contains("multistate")))
          input.addEventListener("click", this, false);
        input = input.nextElementSibling;
      }
    }
  },

  fillProperties: function() {
    let propertyList;
    {
      const lists = this.treeroot.getElementsByTagName("ul");
      for (let i = 0; i < lists.length; i++) {
        let list = lists[i];
        if (list.dataset.group === "ownKeys") {
          propertyList = list;
          break;
        }
      }
    }
    const listItemBase = this.propertyTreeTemplate.content.firstElementChild;
    let keys = Reflect.ownKeys(this.value);

    if (typeof this.value === "function") {
      /* XXX ajvincent JS functions are inconsistent between Google Chrome and
       * Mozilla Firefox.  Consider the following test:
       *
       * { let k = function() {}; k.foo = 3; k.bar = 6; Reflect.ownKeys(k) }
       *
       * In Mozilla Firefox, this returns:
       * Array [ "foo", "bar", "prototype", "length", "name" ]
       *
       * In Google Chrome, this returns:
       * (7) ["length", "name", "arguments", "caller", "prototype", "foo", "bar"]
       *
       * So, to make it consistent, we're going to enforce the following rules:
       * (1) The first five properties in the list will be
       * ["arguments", "caller", "length", "name", "prototype"]
       * (2) Additional properties will appear in their original order after these.
       */
      const forcedKeys = ["arguments", "caller", "length", "name", "prototype"];
      keys = keys.filter((k) => !forcedKeys.includes(k));
      keys = forcedKeys.concat(keys);
    }

    keys.forEach(function(key) {
      const listItem = listItemBase.cloneNode(true);

      const propElement = listItem.getElementsByClassName("propertyName")[0];
      propElement.appendChild(document.createTextNode(key));

      var type;
      try {
        type = typeof this.value[key];
      }
      catch (e) {
        type = "broken";
      }

      const button = listItem.getElementsByClassName("distortions-group")[0];

      let shouldRemove;
      if (type === "object")
        shouldRemove = this.value[key] === null;
      else
        shouldRemove = type !== "function";

      if (shouldRemove) {
        // no distortions possible for primitives
        listItem.removeChild(button.parentNode);
      }
      else if (this.isTopValue &&
               (typeof this.value === "function") &&
               (key === "prototype"))
      {
        button.disabled = true;
      }
      else if (this.isInstance)
      {
        // properties of an instance of a ctor cannot have distortion groups.
        button.disabled = true;
      }

      propertyList.appendChild(listItem);
    }, this);

    if (typeof this.value !== "function") {
      const fnInputs = this.treeroot.getElementsByClassName("function-only");
      for (let i = 0; i < fnInputs.length; i++)
        fnInputs[i].disabled = true;
    }
  },

  initByValue: function(value, gridtree) {
    this.value = value;
    this.gridtree = gridtree;
    this.treeroot = gridtree.firstElementChild;
    if (this.isGroup) {
      const ul = this.treeroot.firstElementChild;
      ul.removeChild(ul.children[1]);
      const header = ul.firstElementChild;
      header.removeChild(header.lastElementChild);
    }
    else {
      this.fillProperties();
      this.helpAndNotesMap = new Map(/*
        keyName (string) : { node: HTMLTextArea, savedValue: string }
      */);
    }
    this.bindUI();
    this.treeroot = null;
  },

  getKeyNameForCell: function(cell) {
    while (!cell.hasAttribute("row"))
      cell = cell.parentNode;
    const row = parseInt(cell.getAttribute("row"), 10);

    const span = this.gridtree.getCell(row, 0);
    return span.firstChild.nodeValue;
  },

  showNotesTextarea: function(link) {
    const keyName = this.getKeyNameForCell(link);
    if (!this.helpAndNotesMap.has(keyName)) {
      this.helpAndNotesMap.set(keyName, {
        savedValue: ""
      });
    }

    const bag = this.helpAndNotesMap.get(keyName);
    if (!bag.textarea) {
      bag.textarea = document.createElement("textarea");
      document.getElementById("help-and-notes").appendChild(bag.textarea);
      bag.textarea.value = bag.savedValue;
    }

    OuterGridManager.setNotesPanel(bag.textarea);
  },

  importJSON: function(config) {
    DistortionsRules.validateConfiguration(config);
    if (Array.isArray(config.filterOwnKeys)) {
      let inputs = this.groupToInputsMap.get("ownKeys");
      let s = new Set(config.filterOwnKeys);
      inputs.forEach(function(checkbox) {
        checkbox.checked = s.has(checkbox.dataset.name);
      });
    }

    if (Array.isArray(config.proxyTraps)) {
      let inputs = this.groupToInputsMap.get("traps");
      let s = new Set(config.proxyTraps);
      inputs.forEach(function(checkbox) {
        checkbox.checked = s.has(checkbox.dataset.name);
      });
    }

    // other distortions for this object
    {
      let inputs = this.groupToInputsMap.get("distortions");
      let truncateInputs = [];
      inputs.forEach(function(input) {
        const name = input.dataset.name;
        if (name.startsWith("truncateArg"))
          truncateInputs.push(input);
        else
          input.checked = config[name];
      });

      if (typeof this.value === "function") {
        let desiredState;
        if (typeof config.truncateArgList === "number") {
          truncateInputs[1].value = config.truncateArgList;
          desiredState = "number";
        }
        else if (typeof config.truncateArgList === "boolean")
          desiredState = config.truncateArgList.toString();

        while (desiredState && desiredState !== truncateInputs[0].value) {
          MultistateHandler({currentTarget: truncateInputs[0] });
        }
      }      
    }

    // references to properties' DistortionsRules objects
    if (typeof config.groupDistortions === "object") {
      const buttons = this.gridtree.getElementsByClassName("distortions-group");
      for (let i = 0; i < buttons.length; i++) {
        let button = buttons[i];
        let key = this.getKeyNameForCell(button);
        if (key in config.groupDistortions) {
          this.showDistortionsGroupNames(button);
          const input = document.getElementById("distortions-groups-input");
          input.value = config.groupDistortions[key];
          this.setDistortionGroup({key: "Enter", target: input});
        }
        else if (button.firstChild) {
          button.firstChild.nodeValue = "";
        }
      }
    }

    // Notes per property key
    if (typeof config.notesPerKey === "object") {
      this.helpAndNotesMap.clear();
      let keys = Reflect.ownKeys(config.notesPerKey);
      keys.forEach(function(key) {
        this.helpAndNotesMap.set(key, { savedValue: config.notesPerKey[key] });
      }, this);
    }
  },

  exportJSON: function() {
    const rv = {
      /*
      filterOwnKeys: [] || null,
      inheritOwnKeys: false,
      storeUnknownAsLocal: false,
      requireLocalDelete: false,
      useShadowTarget: false,
      proxyTraps: allTraps.slice(0),
      truncateArgList: Non-negative integer || false || true,
      notesPerKey: { keyName (string) : notes (string) },
       */
    };

    // filterOwnKeys
    {
      if (this.filterOwnKeysControl && this.filterOwnKeysControl.checked) {
        let inputs = this.groupToInputsMap.get("ownKeys");
        rv.filterOwnKeys = inputs.filter((checkbox) => checkbox.checked)
                                 .map((checkbox) => checkbox.dataset.name);
      }
      else
        rv.filterOwnKeys = null;
    }

    // proxyTraps
    {
      let inputs = this.groupToInputsMap.get("traps");
      rv.proxyTraps = inputs.filter((checkbox) => checkbox.checked)
                            .map((checkbox) => checkbox.dataset.name);
    }

    // other distortions for this object
    {
      let inputs = this.groupToInputsMap.get("distortions");
      let truncateInputs = [];
      inputs.forEach((input) => {
        const name = input.dataset.name;
        if (name.startsWith("truncateArg"))
          truncateInputs.push(input);
        else
          rv[name] = input.checked;
      });

      if (typeof this.value === "function") {
        if (truncateInputs[0].value === "number")
          rv.truncateArgList = parseInt(truncateInputs[1].value, 10);
        else
          rv.truncateArgList = truncateInputs[0].value === "true";
      }
    }

    // references to properties' DistortionsRules objects
    {
      const buttons = this.gridtree.getElementsByClassName("distortions-group");
      const foundGroups = {};
      let count = 0;
      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        if (!button.firstChild)
          continue;
        const group = button.firstChild.nodeValue;
        if (!group)
          continue;
        const keyName = this.getKeyNameForCell(button.parentNode);
        foundGroups[keyName] = group;
        count++;
      }
      if (count > 0)
        rv.groupDistortions = foundGroups;
    }

    // Notes per property key
    if (this.helpAndNotesMap && this.helpAndNotesMap.size) {
      rv.notesPerKey = {};
      let found = false;
      this.helpAndNotesMap.forEach(function(bag, keyName) {
        const value = bag.textarea ? bag.textarea.value : bag.savedValue;
        if (value) {
          found = true;
          rv.notesPerKey[keyName] = value;
        }
      });
      if (!found)
        delete rv.notesPerKey;
    }

    return rv;
  },

  showDistortionsGroupNames: function(button) {
    const dialog = document.getElementById("distortions-groups-dialog");
    const rect = button.parentNode.getBoundingClientRect();
    dialog.style.left = rect.left + 10;
    dialog.style.top  = rect.top + 5;
    button.parentNode.appendChild(dialog);

    if (!button.firstChild)
      button.appendChild(document.createTextNode(""));

    const input = document.getElementById("distortions-groups-input");
    input.value = button.firstChild.nodeValue;
    dialog.classList.add("visible");
    input.focus();
  },

  openDistortionsGroup: function(event) {
    const button = event.currentTarget.previousElementSibling;
    const keyName = this.getKeyNameForCell(button.parentNode);
    const target = this.value[keyName];

    {
      const existingPanel = DistortionsManager.valueToPanelMap.get(target);
      if (existingPanel) {
        const hash = existingPanel.dataset.hash;
        const valueRadio = DistortionsManager.valueNameToTabMap.get(hash);
        valueRadio.click();

        const trap = existingPanel.getAttribute("trapstab");
        OuterGridManager.tabboxForm.functionTraps.value = trap;
        OuterGridManager.grid.setAttribute("trapstab", trap);

        if (LoadPanel.testMode) {
          const msg = "openDistortionsGroup: existing panel selected";
          console.log("postMessage requested:", msg);
          window.postMessage(msg, window.location.origin);
        }
        return;
      }
    }

    if (this.isTopValue &&
        (typeof this.value === "function") &&
        (keyName === "prototype")) {
      OuterGridManager.prototypeRadio.click();
      return;
    }

    const panel = this.gridtree.parentNode;
    const graphIndex = DistortionsManager.getNameAndGraphIndex(
      panel.dataset.hash
    )[1];

    const groupName = button.firstChild ? button.firstChild.nodeValue : "";
    let details = null, hash;
    if (groupName)
    {
      const path = `[${groupName}]`;
      hash = DistortionsManager.hashGraphAndValueNames(path, graphIndex);

      let radio = DistortionsManager.groupNameToTabMap.get(hash);
      if (radio) {
        radio.click();
        return;
      }

      details = {
        graph: OuterGridManager.graphNamesCache.controllers[graphIndex],
        valueName: path,
        graphIndex: graphIndex,
        hasValue: false,
        isGroup: true,
      };
    }
    else
    {
      const path = panel.dataset.valueName + "." + keyName;
      hash = DistortionsManager.hashGraphAndValueNames(path, graphIndex);

      let radio = DistortionsManager.valueNameToTabMap.get(hash);
      if (radio) {
        radio.click();
        return;
      }

      // OK, we have to build a new value panel.
      details = {
        graph: OuterGridManager.graphNamesCache.controllers[graphIndex],
        valueName: path,
        graphIndex: graphIndex,
        hasValue: true,
        value: target,
        isGroup: false,
      };
    }

    let p = DistortionsGUI.buildValuePanel(details);
    p.then(function() {
      if (!groupName) {
        const about = DistortionsManager.valueNameToRulesMap.get(hash).about;
        about.parent = panel.dataset.valueName;
        about.keyName = keyName;
      }

      OuterGridManager.valueRadio.click();
      OuterGridManager.grid.setAttribute("trapstab", "value");

      if (LoadPanel.testMode) {
        const msg = groupName ?
                    "openDistortionsGroup: property group panel created" :
                    "openDistortionsGroup: property panel created";
        console.log("postMessage requested:", msg);
        window.postMessage(msg, window.location.origin);
      }
    });
  },

  getGroupKeys: function(groupName) {
    let rv = [];
    const buttons = this.gridtree.getElementsByClassName("distortions-group");
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      if (!button.firstChild)
        continue;
      if (button.firstChild.nodeValue !== groupName)
        continue;
      rv.push(this.getKeyNameForCell(button));
    }
    return rv;
  },

  handleEvent: function(event) {
    const el = event.currentTarget;
    if (el.classList.contains("notesPanelLink"))
      return this.showNotesTextarea(el);

    if ((el.classList.contains("multistate")) &&
        (el.dataset.name === "truncateArgList")) {
      el.nextElementSibling.disabled = (el.value !== "number");
      return;
    }

    if (el.classList.contains("distortions-group"))
      return this.showDistortionsGroupNames(el);

    {
      const prev = el.previousElementSibling;
      if (prev && prev.classList.contains("distortions-group"))
        return this.openDistortionsGroup(event);
    }
  }
};

defineElementGetter(
  DistortionsRules.prototype,
  "propertyTreeTemplate",
  "distortions-tree-ui-property"
);
