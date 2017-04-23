/*
window.addEventListener("load", function() {
  var myCodeMirror = CodeMirror.fromTextArea(myTextArea);
}, true);
*/



window.addEventListener("load", function() {
  ObjectGraphManager.attachEvents();
  TestDriver.run(["test-startup"]);
  CodeMirrorManager.setInitialState();
}, true);
