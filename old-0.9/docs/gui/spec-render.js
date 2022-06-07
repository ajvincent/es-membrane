window.addEventListener("load", function() {
  let editor = CodeMirrorManager.buildNewEditor(
    document.getElementById("root-source"),
    {readOnly: true}
  );
  editor.setSize(800, 300);

  editor = CodeMirrorManager.buildNewEditor(
    document.getElementById("distortions"),
    {readOnly: true}
  );
  editor.setSize(800, 300);
}, true);
