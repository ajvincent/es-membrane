window.addEventListener(
  "DOMContentLoaded",
  function()
  {
    ObjectGraphManager.init();
    FreeformManager.init();
    TestDriver.init();
  },
  true
);

window.addEventListener("load", function() {
  TestDriver.firstRun();
}, true);
