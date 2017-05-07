const ObjectGraphManager = new TBodyRowManager({
  // see below, private
  customBody: null,  
  standardBody: null,
  rowTemplate: null,
  form: null,
  table: null,
  mockOptionsText: null,
  runMembraneTest: null,

  init: function()
  {
    this.finishTable();
    this.initEditors();
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
    TestDriver.setLockStatus("MembraneMocks", this.lockSymbol, !rv);
    if (rv)
    {
      let argList = graphData.map(function(o) {
        return o.callback;
      });
      argList.unshift("buildMembrane");
      this.defineTestsArgList(argList);
    }
  },

  defineTestsArgList: function(argList)
  {
    const line = `function defineMocksTests(${argList.join(", ")})`;
    // the editor's line 0 is rendered as line #1.
    const startPos = { line: 0, ch: 0}, endPos = { line: 0, ch: Infinity };
    this.runMembraneTestEditor.replaceRange(line, startPos, endPos);
  },

  initEditors: function()
  {
    this.mockOptionsEditor     = CodeMirrorManager.buildNewEditor(this.mockOptions);
    this.runMembraneTestEditor = CodeMirrorManager.buildNewEditor(this.runMembraneTest);
  },

  getBlobs: function(blobs)
  {
    "use strict";
    {
      // Assemble the blob defining the graph names.
      let graphData = this.graphNames();
      void(graphData);
      let sources = [
`
const graphData = [
`,
// individual graph info
`
];
`
      ];
      graphData.forEach(function(item) {
        let name = item.graphName.toString();
        if (typeof item.graphName == "symbol")
        {
          name = [
            'Symbol(`',
            name.substring(7, name.length - 1),
            '`)'
          ].join("");
        }
        else
          name = JSON.stringify(item.graphName);
        let lineSource = `
  {
    "graphName": ${name},
    "callback": "${item.callback}"
  },
`;
        sources.splice(sources.length - 1, 0, lineSource);
      });
      TestDriver.convertSourcesToTestBlob(sources, blobs);
    }

    [
      "mockOptionsEditor",
      "runMembraneTestEditor",
    ].forEach(function(propName) {
      if (!(propName in ObjectGraphManager)) {
        throw new Error("Missing editor: " + propName);
      }
      let source = this[propName].getValue();
      TestDriver.convertSourcesToTestBlob([source], blobs);
    }, this);
  },
});

{
  let elems = [
    "customBody",
    "standardBody",
    "rowTemplate",
    "form",
    "table",
    "mockOptions",
    "runMembraneTest",
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

