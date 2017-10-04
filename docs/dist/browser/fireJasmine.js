window.addEventListener("load", function() {
  window.setTimeout(function() {
    jasmine.getEnv().execute();
  }, 100);
}, {once: true, capture: true});
