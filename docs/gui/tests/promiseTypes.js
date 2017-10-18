function TimeoutPromise(delay) {
  return new Promise((resolve) => { setTimeout(resolve, delay); });
}

function IFrameLoadPromise(iframe, url) {
  const p = new Promise(function (resolve/*, reject */) {
    iframe.addEventListener("load", function() {
      resolve(iframe.contentDocument);
    }, CAPTURE_ONCE);
  });
  iframe.setAttribute("src", url);
  return p;
}

function BlobLoaderPromise(frameParentNode) {
  let pResolve;
  const mObs = new MutationObserver(function(records) {
    mObs.disconnect();
    let iframe = records[0].addedNodes[0];
    iframe.addEventListener("load", function() {
      pResolve(iframe.contentWindow.BlobLoader);
    }, CAPTURE_ONCE);
  });
  mObs.observe(frameParentNode, {childList: true});
  return new Promise((resolve) => {pResolve = resolve;});
}

function MessageEventPromise(target, expectedMessage) {
  let pResolve;
  target.addEventListener("message", {
    handleEvent: function(evt) {
      if ((evt.origin !== window.location.origin) ||
          (evt.data !== expectedMessage))
        return;
      target.removeEventListener("message", this, false);
      pResolve();
    }
  }, false);
  return new Promise((resolve) => {pResolve = resolve;});
}

function XHRPromise(url, body = null) {
  const XHR = new XMLHttpRequest();
  XHR.open("GET", url, true);
  const p = new Promise((resolve, reject) => {
    XHR.onload = function() {
      if (XHR.status >= 400)
        reject(XHR.status + " " + XHR.statusText + ": " + url);
      else
        resolve(XHR.responseText);
    };
    XHR.onerror = function() {
      reject(XHR.status + " " + XHR.statusText + ": " + url);
    };
  });
  XHR.send(body);
  return p;
}
