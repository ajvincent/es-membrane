const FreeformManager = new TBodyRowManager({
  // private, see below
  table: null,
  customBody: null,
  rowTemplate: null,

  init: function()
  {
    this.editorsByRow = new WeakMap();
    this.finishTable();
  },

  addRow: function()
  {
    let row = TBodyRowManager.prototype.addRow.apply(this);
    let textarea = row.getElementsByTagName("textarea")[0];
    let editor = CodeMirrorManager.buildNewEditor(textarea);
    this.editorsByRow.set(row, editor);
  },

  getBlobs: function(blobs)
  {
    const rows = this.table.tBodies[0].rows;
    for (let i = 0; i < rows.length; i++)
    {
      let editor = this.editorsByRow.get(rows[i]);
      let source = editor.getValue();
      TestDriver.convertSourcesToTestBlob([source], blobs);
    }
  },
});

{
  let elems = [
    "table",
    "customBody",
    "rowTemplate",
  ];
  elems.forEach(function(idSuffix)
  {
    defineElementGetter(FreeformManager, idSuffix, "Freeform-" + idSuffix);
  });
}
