function DistortionsRules() {
  this.inputToGroupMap = new Map(/*
    <input type="checkbox">: groupName
  */);
  this.groupToInputsMap = new Map(/*
    groupName: <input type="checkbox">[]
  */);

  this.settings = {
    /* serializable JSON settings */
  };
}
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
      let lists = this.treeroot.getElementsByTagName("ul");
      for (let i = 0; i < lists.length; i++) {
        let list = lists[i];
        if (list.dataset.group)
          this.bindULInputsByGroup(list);
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

  updateFromConfiguration: function(/*config*/) {
    throw new Error("Not implemented!");
  },

  configurationAsJSON: function() {
    const rv = {
      formatVersion: "0.8.2",
      dataVersion: "0.1",

      /*
      filterOwnKeys: [] || null,
      inheritOwnKeys: false,
      storeUnknownAsLocal: false,
      requireLocalDelete: false,
      useShadowTarget: false,
      proxyTraps: allTraps.slice(0),
       */
    };

    // filterOwnKeys
    {
      let i = this.gridtree.getElementsByClassName("filterOwnKeys-control")[0];
      if (i.checked) {
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

    // other distortions
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

    return rv;
  },

  handleEvent: function(event) {
    let el = event.currentTarget;
    if ((el.classList.contains("multistate")) &&
        (el.dataset.name === "truncateArgList")) {
      el.nextElementSibling.disabled = (el.value !== "number");
    }
  }
};

defineElementGetter(
  DistortionsRules.prototype,
  "propertyTreeTemplate",
  "distortions-tree-ui-property"
);

