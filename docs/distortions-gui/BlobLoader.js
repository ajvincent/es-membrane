const BlobLoader = {
  init: function() {
    "use strict";
    const params = new URL(window.location.href).searchParams;
    const blobs = params.getAll("scriptblob");

    blobs.forEach(function(b) {
      let scriptElem = document.createElement("script");
      scriptElem.setAttribute("src", b);
      document.head.appendChild(scriptElem);
    });
  }
};

BlobLoader.init();
