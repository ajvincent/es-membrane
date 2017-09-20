window.BlobLoader = {
  getValue: () => undefined,
  errorFired: false,
  errorMessage: undefined,
  
  init: function() {
    "use strict";
    const params = new URL(window.location.href).searchParams;
    const blobs = params.getAll("scriptblob");

    blobs.forEach(function(b) {
      let scriptElem = document.createElement("script");
      scriptElem.setAttribute("src", b);
      document.head.appendChild(scriptElem);
    });

    window.addEventListener("error", this, true);
    window.addEventListener("load", this, true);
  },

  registerError: function(e) {
    if (this.errorFired)
      return;
    this.errorFired = true;
    this.errorMessage = e.message;
  },

  handleEvent: function(event) {
    if (event.target !== document)
      return;
    window.removeEventListener("error", this, true);
    window.removeEventListener("load", this, true);
    if (event.type === "error") {
      this.registerError(event);
    }
  }
};

window.BlobLoader.init();
