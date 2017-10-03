const CodeMirrorManager = {
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
    editor.setSize(600, 300);
    return editor;
  },
};


