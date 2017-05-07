function TBodyRowManager(obj) {
  Reflect.ownKeys(obj).forEach(function(name) {
    let desc = Reflect.getOwnPropertyDescriptor(obj, name);
    Reflect.defineProperty(this, name, desc);
  }, this);
}
TBodyRowManager.prototype = {
  // private, see below
  footerCellTemplate: null,

  finishTable: function()
  {
    var cell, content;
    cell = this.table.tFoot.getElementsByClassName("footerCell")[0];
    content = this.footerCell.content.firstElementChild.cloneNode(true);
    cell.appendChild(content);
    this.bindClickEvent(content, "addRowButton", "addRow");
    {
      let btn  = content.getElementsByClassName("addRowButton")[0];
      let text = this.table.getAttribute("addRowText");
      btn.appendChild(document.createTextNode(text));
    }

    cell = this.rowTemplate.content.firstElementChild.getElementsByClassName("commandsCell")[0];
    content = this.commandsCell.content.firstElementChild.cloneNode(true);
    cell.appendChild(content);
  },

  addRow: function()
  {
    let row = this.rowTemplate.content.firstElementChild;
    row = row.cloneNode(true);
    this.customBody.appendChild(row);

    this.bindClickEvent(row, "moveUpButton", "moveUp");
    this.bindClickEvent(row, "moveDnButton", "moveDown");
    this.bindClickEvent(row, "deleteButton", "removeRow");
    this.resetMoveButtons();
    this.inputChangeListener();
    return row;
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

  bindClickEvent: function(content, className, callbackName)
  {
    content.getElementsByClassName(className)[0].addEventListener(
      "click", this[callbackName].bind(this), true
    );
  },

  inputChangeListener: function() { /* do nothing */ }
};

{
  let elems = [
    "commandsCell",
    "footerCell",
  ];
  elems.forEach(function(idSuffix)
  {
    defineElementGetter(TBodyRowManager.prototype, idSuffix, "TBodyRowManager-" + idSuffix);
  });
}
