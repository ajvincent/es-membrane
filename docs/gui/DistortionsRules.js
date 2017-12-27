window.DistortionsRules = function DistortionsRules() {
  this.inputToGroupMap = new Map(/*
    <input type="checkbox">: groupName
  */);
  this.groupToInputsMap = new Map(/*
    groupName: <input type="checkbox">[]
  */);
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
  requireType("formatVersion", "string");
  if (!/^\d+\.\d+(?:\.\d)?$/.test(config.formatVersion))
    throw `formatVersion must be a normal semantic versioning number`;
  requireType("dataVersion", "string");
  if (!/^\d+\.\d+(?:\.\d)?$/.test(config.dataVersion))
    throw `dataVersion must be a normal semantic versioning number`;

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
    if (value.length && (valid || option)) {
      button.firstChild.nodeValue = value;

      if (!option && valid) {
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
    this.fillProperties();
    this.bindUI();
    this.treeroot = null;
  },

  importJSON: function(/*config*/) {
    throw new Error("Not implemented!");
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
       */
    };

    // filterOwnKeys
    {
      if (this.filterOwnKeysControl.checked) {
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
        let keyName;
        {
          let elem = button.parentNode;
          while (!elem.hasAttribute("row"))
            elem = elem.parentNode;
          const row = parseInt(elem.getAttribute("row"), 10);

          const span = this.gridtree.getCell(row, 0);
          keyName = span.firstChild.nodeValue;
        }

        foundGroups[keyName] = group;
        count++;
      }
      if (count > 0)
        rv.groupDistortions = foundGroups;
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

  openDistortionsGroup: function(/*groupName*/) {
    
  },

  handleEvent: function(event) {
    let el = event.currentTarget;
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
        return this.openDistortionsGroup(prev.firstChild.nodeValue);
    }
  }
};

defineElementGetter(
  DistortionsRules.prototype,
  "propertyTreeTemplate",
  "distortions-tree-ui-property"
);
