const ObjectGraphManager = new TBodyRowManager({
  // see below, private
  customBody: null,  
  standardBody: null,
  form: null,
  table: null,

  init: function()
  {
    this.finishTable();
    this.attachEvents();
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
  inputChangeListener: function()
  {
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
  },

  finishTable: function()
  {
    var cell, content;
    cell = this.table.tFoot.getElementsByClassName("footerCell")[0];
    content = this.footerCell.content.firstElementChild.cloneNode(true);
    cell.appendChild(content);
    this.bindClickEvent(content, "addRowButton", "addRow");

    cell = this.rowTemplate.content.firstElementChild.getElementsByClassName("commandsCell")[0];
    content = this.commandsCell.content.firstElementChild.cloneNode(true);
    cell.appendChild(content);
  },
});

{
  let elems = [
    "customBody",
    "standardBody",
    "rowTemplate",
    "form",
    "table",
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

