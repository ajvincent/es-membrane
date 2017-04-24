window.addEventListener(
  "DOMContentLoaded",
  function()
  {
    CodeMirrorManager.setInitialState();
  },
  true
);

window.addEventListener("load", function() {
  ObjectGraphManager.attachEvents();
  TestDriver.firstRun();
}, true);
