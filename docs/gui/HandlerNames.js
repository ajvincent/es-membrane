const HandlerNames = window.HandlerNames = {
  // private
  grid: null,
  template: null,
  cachedNames: null,

  /**
   * Initialize the UI.
   */
  init: function() {
    // we start with two rows:  less than that makes no sense.
    this.addRow();
    this.addRow();
  },

  /**
   * Add a graph name row.
   */
  addRow: function() {
    let frag = this.template.content.cloneNode(true);
    this.grid.insertBefore(frag, this.grid.lastElementChild);
    this.update();
  },

  /**
   * Delete a graph name row.
   *
   * @param event {DOMEvent} The click event on a delete button.
   */
  deleteRow: function(event) {
    let range = document.createRange();
    const delButton = event.target;
    range.setEndAfter(delButton);
    range.setStartBefore(delButton.previousElementSibling.previousElementSibling);
    range.deleteContents();

    this.update();
  },

  /**
   * Update the validity of the elements, and control whether rows can be deleted.
   *
   * @private
   */
  update: function() {
    const buttons = this.grid.getElementsByTagName("button");
    const disabled = (buttons.length <= 3);

    let names = new Set();

    for (let i = 0; i < buttons.length - 1; i++) {
      buttons[i].disabled = disabled;

      let input = buttons[i].previousElementSibling,
      checkbox =  input.previousElementSibling.firstElementChild;
      valid = checkbox.checked || !names.has(input.value);
      input.setCustomValidity(valid ? "" : "String names of object graphs must be unique.");
      if (!checkbox.checked)
        names.add(input.value);
    }
  },

  /**
   * Get the graph names to use.
   *
   * @returns [
   *   graphNames       {String[]}  The names of each graph.
   *   graphSymbolLists {Integer[]} Element indexes of symbols in graphNames.
   * ]
   */
  serializableNames: function() {
    const graphNames = [], graphSymbolLists = [];
    const buttons = this.grid.getElementsByTagName("button");
    for (let i = 0; i < buttons.length - 1; i++) {
      let input = buttons[i].previousElementSibling,
      checkbox =  input.previousElementSibling.firstElementChild;
      graphNames.push(input.value);
      if (checkbox.checked)
        graphSymbolLists.push(graphNames.length - 1);
    }
    return [graphNames, graphSymbolLists];
  },

  getFormattedNames: function() {
    const [graphNames, graphSymbolLists] = this.serializableNames();
    return graphNames.map(function(elem, index) {
      elem = JSON.stringify(elem);
      if (graphSymbolLists.length && (graphSymbolLists[0] === index)) {
        graphSymbolLists.shift();
        return `Symbol(${elem})`;
      }
      return elem;
    });
  },

  getGraphNames: function() {
    if (!this.cachedNames) {
      const [graphNames, graphSymbolLists] = this.serializableNames();
      this.cachedNames = graphNames.map(function(elem, index) {
        if (graphSymbolLists.length && (graphSymbolLists[0] === index)) {
          graphSymbolLists.shift();
          return Symbol(elem);
        }
        return elem;
      });
    }
    return this.cachedNames.slice(0);
  },
};

{
  let elems = {
    "grid": "grid-outer-start-objectgraphs",
    "template": "objectgraph-name-row",
  };
  let keys = Reflect.ownKeys(elems);
  keys.forEach(function(key) {
    defineElementGetter(HandlerNames, key, elems[key]);
  });
}
