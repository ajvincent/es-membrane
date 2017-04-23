function addBlobs()
{
  "use strict";
  let masterURL = new URL(window.location.href);
  let blobs = masterURL.searchParams.getAll("scriptblob");
  let blobURLs = [];
  blobs.forEach(function(b) {
    let scriptElem = document.createElement("script");
    scriptElem.setAttribute("src", b);
    document.head.appendChild(scriptElem);
    blobURLs.push(b);
  });

  window.addEventListener("load", function() {
    blobURLs.forEach(function(b) {
      URL.revokeObjectURL(b);
    });
  });
}

addBlobs();
