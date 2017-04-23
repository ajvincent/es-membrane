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
  },

  moveDown: function(event)
  {
    let row = this.rowForEvent(event);
    row.parentNode.insertBefore(row.nextSibling, row);
    this.resetMoveButtons();
  },

  removeRow: function(event)
  {
    let row = this.rowForEvent(event);
    row.parentNode.removeChild(row);
    this.resetMoveButtons();
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
    let names = new Set();
    let callbacks = new Set();
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
  },

  /**
   * @private
   */
  getGraphName: function(row, names, callbacks)
  {
    let kids = row.children;
    let isSymbol  = this.getCellChecked(kids[1]);
    let graphName = this.getCellValue(kids[0], !isSymbol ? names : null),
        callback  = this.getCellValue(kids[2], callbacks);
    return { graphName, callback };
  },

  /**
   * @private
   */
  getCellValue: function(td, nameSet)
  {
    let node = td.firstChild;
    var rv;

    if (node.nodeType == 1)
    {
      rv = node.value;
      if (nameSet)
      {
        if (rv.length === 0)
          node.setCustomValidity("Name must not be empty");
        else if (/\s/.test(rv))
          node.setCustomValidity("Spaces are not valid in name");
        else if (nameSet && nameSet.has(rv))
          node.setCustomValidity("This name is already defined.");
        else
          node.setCustomValidity("");
      }
      else
        node.setCustomValidity("");
    }
    else
    {
      rv = node.nodeValue;
    }

    if (nameSet)
      nameSet.add(rv);
    else
      rv = Symbol(rv);
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
    void(this.graphNames());
    var rv = this.form.reportValidity();
    TestDriver.setLockStatus(this.lockSymbol, !rv);
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

