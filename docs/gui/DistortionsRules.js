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
  bindUI: function() {
    {
      let multistates = this.treeroot.getElementsByClassName("multistate");
      for (let i = 0; i < multistates.length; i++)
        updateMultistate(multistates[i]);
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
        input.dataset.propertyName = propertyName;

        inputList.push(input);
        this.inputToGroupMap.set(input, groupName);
        let eventType = (input.localName === "button" ? "click" : "change");
        input.addEventListener(eventType, this, false);
        input = input.nextElementSibling;
      }
    }

    this.updateGroup(groupName);
  },

  initByValue: function(value, treeroot) {
    this.value = value;
    this.treeroot = treeroot;

    this.bindUI();
  },

  updateGroup: function(groupName) {
    const members = this.settings[groupName] = [];
    let inputs = this.groupToInputsMap.get(groupName);
    var truncateArgButtonValue;
    for (let i = 0; i < inputs.length; i++) {
      let input = inputs[i];
      if (input.dataset.propertyName === "truncateArgList") {
        // special handling
        if (input.localName === "button") {
          truncateArgButtonValue = input.value;
          if (truncateArgButtonValue === "true")
            this.settings.truncateArgList = true;
          else if (truncateArgButtonValue === "false")
            this.settings.truncateArgList = false;
        }
        else if (truncateArgButtonValue === "number")
          this.settings.truncateArgList = parseInt(input.value);
      }

      else if (input.checked)
        members.push(input.dataset.propertyName);
    }
  },

  updateFromConfiguration: function(/*config*/) {
    throw new Error("Not implemented!");
  },

  configurationAsJSON: function() {
    return JSON.stringify(this.settings);
  },

  handleEvent: function(event) {
    let el = event.target;
    {
      let multistate = el;
      if (multistate.localName.toLowerCase() === "span") {
        multistate = multistate.parentNode;
        if ((multistate.localName.toLowerCase() === "button") &&
            multistate.classList.contains("multistate"))
          el = multistate;
      }
    }

    if ((el.classList.contains("multistate")) &&
        (el.dataset.propertyName === "truncateArgList")) {
      el.nextElementSibling.disabled = (el.value !== "number");
    }

    {
      let groupName = this.inputToGroupMap.get(el);
      if (groupName) {
        this.updateGroup(groupName);
        return;
      }
    }
  }
};

