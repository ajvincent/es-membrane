const ObjectGraphManager = {
  // see below, private
  rowTemplate: null, 
  customBody: null,  
  standardBody: null,
  form: null,

  addRow: function()
  {
    let row = this.rowTemplate.content.firstElementChild;
    row = row.cloneNode(true);
    this.customBody.appendChild(row);
    this.resetMoveButtons();
    this.inputChangeListener();
  },

  moveUp: function(event)
  {
    let row = this.rowForEvent(event);
    row.parentNode.insertBefore(row, row.previousSibling);
    this.resetMoveButtons();
    this.inputChangeListener();
  },

  moveDown: function(event)
  {
    let row = this.rowForEvent(event);
    row.parentNode.insertBefore(row.nextSibling, row);
    this.resetMoveButtons();
    this.inputChangeListener();
  },

  removeRow: function(event)
  {
    let row = this.rowForEvent(event);
    row.parentNode.removeChild(row);
    this.resetMoveButtons();
    this.inputChangeListener();
  },

  rowForEvent: function(event)
  {
    let elem = event.target;
    while (elem.localName != "tr")
      elem = elem.parentNode;
    return elem;
  },

  resetMoveButtons: function()
  {
    const UP = 0, DOWN = 1, TOP_ROW = 0, LAST_ROW = -1;
    this.setButtonDisabled(TOP_ROW,      DOWN, false);
    this.setButtonDisabled(TOP_ROW + 1,  UP,   false);

    this.setButtonDisabled(LAST_ROW,     UP,   false);
    this.setButtonDisabled(LAST_ROW - 1, DOWN, false);

    this.setButtonDisabled(TOP_ROW,  UP,   true);
    this.setButtonDisabled(LAST_ROW, DOWN, true);
  },

  /**
   * @private
   */
  setButtonDisabled: function(rowIndex, btnIndex, disabled)
  {
    const rows = this.customBody.children;
    let length = rows.length;
    if (rowIndex < 0)
      rowIndex += length;
    if ((0 <= rowIndex) && (rowIndex < length))
      rows[rowIndex].getElementsByTagName("button")[btnIndex].disabled = disabled;
  },

  graphNames: function()
  {
    let names = [];     // Object graph names
    let callbacks = []; // Arguments named in runMembraneTest
    callbacks.push("buildMembrane");
    let rv = [];
    rv = rv.concat(this.getGraphNamesByBody(this.standardBody, names, callbacks));
    rv = rv.concat(this.getGraphNamesByBody(this.customBody,   names, callbacks));

    return rv;
  },

  /**
   * @private
   */
  getGraphNamesByBody: function(tbody, names, callbacks)
  {
    let rv = [];
    let row = tbody.firstElementChild;
    while (row)
    {
      rv.push(this.getGraphName(row, names, callbacks));
      row = row.nextElementSibling;
    }
    return rv;
  },

  /**
   * @private
   */
  getGraphName: function(row, names, callbacks)
  {
    let kids = row.children;
    let isSymbol  = this.getCellChecked(kids[1]);
    let graphName = this.getCellValue(kids[0], names, isSymbol),
        callback  = this.getCellValue(kids[2], callbacks, false);
    return { graphName, callback };
  },

  /**
   * @private
   */
  getCellValue: function(td, nameSet, isSymbol)
  {
    let node = td.firstChild;
    var rv;

    if (node.nodeType == 1)
    {
      rv = node.value;
      if (rv.length === 0)
        node.setCustomValidity("Name must not be empty");
      else if (/\s/.test(rv))
        node.setCustomValidity("Spaces are not valid in name");
      else if (nameSet.includes(rv))
        node.setCustomValidity("This name is already defined.");
      else
        node.setCustomValidity("");
    }
    else
    {
      rv = node.nodeValue;
    }

    if (isSymbol)
      rv = Symbol(rv);

    nameSet.push(rv);
    return rv;
  },

  /**
   * @private
   */
  getCellChecked: function(td)
  {
    let node = td.firstChild;
    return (node.nodeType == 1) ? node.checked : false;
  },

  attachEvents: function()
  {
    this.form.addEventListener(
      "change",
      this.inputChangeListener.bind(this),
      false
    );
  },

  /**
   * @private
   */
  inputChangeListener: function() {
    const graphData = this.graphNames();
    var rv = this.form.reportValidity();
    TestDriver.setLockStatus(this.lockSymbol, !rv);
    if (rv)
    {
      let argList = graphData.map(function(o) {
        return o.callback;
      });
      argList.unshift("buildMembrane");
      CodeMirrorManager.defineTestsArgList(argList);
    }
  }
};

{
  let elems = [
    "customBody",
    "standardBody",
    "rowTemplate",
    "form"
  ];
  elems.forEach(function(idSuffix)
  {
    defineElementGetter(ObjectGraphManager, idSuffix, "objectGraph-" + idSuffix);
  });

  Reflect.defineProperty(ObjectGraphManager, "lockSymbol", {
    value: Symbol("graphNames"),
    writable: false,
    enumerable: false,
    configurable: false
  });
}

