window.addEventListener(
  "DOMContentLoaded",
  function()
  {
    ObjectGraphManager.init();
    CodeMirrorManager.setInitialState();
  },
  true
);

window.addEventListener("load", function() {
  TestDriver.firstRun();
}, true);
