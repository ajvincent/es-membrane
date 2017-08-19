const CodeMirrorManager = {
  buildNewEditor: function(textarea, lang)
  {
    const options = {
      mode: lang,
      lineNumbers: true,
      foldGutter: true,
      gutters: [
        "CodeMirror-linenumbers",
        "CodeMirror-foldgutter"
      ],
    };
    const editor = CodeMirror.fromTextArea(textarea, options);
    editor.setSize(400, 300);
    return editor;
  },
};
