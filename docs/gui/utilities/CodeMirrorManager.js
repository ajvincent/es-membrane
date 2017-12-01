const CodeMirrorManager = window.CodeMirrorManager = {
  buildNewEditor: function(textarea, baseOptions = {})
  {
    const options = {
      name: "javascript",
      lineNumbers: true,
      foldGutter: true,
      gutters: [
        "CodeMirror-linenumbers",
        "CodeMirror-foldgutter"
      ],
    };
    let keys = Reflect.ownKeys(baseOptions);
    keys.forEach(function(prop) {
      options[prop] = baseOptions[prop];
    });
    const editor = CodeMirror.fromTextArea(textarea, options);
    editor.setSize(600, 150);
    return editor;
  },

  /**
   * Mark CodeMirror lines "read-only", and get a function that can alter them.
   *
   * @param editor    {CodeMirror} The editor.
   * @param startLine {Integer}    The line index to start at.
   * @param endLine   {Integer}    The line index to end at.
   *
   * @returns {Function(String)} A callback for replacing read-only content.
   *
   * @note CodeMirror uses zero-based indexes for the API, and one-based indexes
   * for the rendering:  the first line appears in gutters as line 1, but in the
   * API, it is line 0.
   */
  getTextLock: function(editor, startLine, endLine)
  {
    const doc = editor.getDoc();
    const options = { readOnly: true, className: "readOnly" };
    if (startLine === 0)
      options.inclusiveLeft = true;
    if (endLine === Infinity)
      options.inclusiveRight = true;
    Object.freeze(options);
    let mark = doc.markText(
      {line: startLine, ch: 0},
      {line: endLine, ch: 0},
      options
    );

    return function(newText) {
      if (typeof newText !== "string")
        throw new Error("text lock only allows replacements with strings");
      if (newText[newText.length - 1] !== "\n")
        newText += "\n";
      const positioning = mark.find();
      mark.clear();
      doc.replaceRange(newText, positioning.from, positioning.to);
      startLine = positioning.from.line;
      endLine = startLine + newText.split("\n").length - 1;
      mark = doc.markText(
        {line: startLine, ch: 0},
        {line: endLine, ch: 0},
        options
      );
    };
  },

  getEditorEnabled: function(editor) {
    return !editor.getOption("readOnly");
  },

  setEditorEnabled: function(editor, enabled) {
    editor.setOption("readOnly", enabled ? false : "nocursor");
    const classList = editor.getWrapperElement().classList;
    classList[enabled ? "remove" : "add"]("disabled");
  },
};


