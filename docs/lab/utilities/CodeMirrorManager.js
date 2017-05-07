const CodeMirrorManager = {
  buildNewEditor: function(textarea)
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
    const editor = CodeMirror.fromTextArea(textarea, options);
    editor.setSize(600, 300);
    return editor;
  },
};


