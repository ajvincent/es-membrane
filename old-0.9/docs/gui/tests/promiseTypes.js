/*
function TimeoutPromise(delay) {
  return new Promise((resolve) => { setTimeout(resolve, delay); });
}
*/

function IFrameLoadPromise(iframe, url) {
  const p = new Promise(function (resolve) {
    iframe.addEventListener("load", function() {
      resolve(iframe.contentDocument);
    }, CAPTURE_ONCE);
  });
  iframe.setAttribute("src", url);
  return p;
}

function MessageEventPromise(target, expectedMessage, failMessage) {
  let pResolve, pReject;
  target.addEventListener("message", {
    handleEvent: function(evt) {
      if (evt.origin !== window.location.origin)
        return;

      if (failMessage && (evt.data === failMessage)) {
        target.removeEventListener("message", this, false);
        pReject(new Error(failMessage));
      }

      if (evt.data == expectedMessage) {
        target.removeEventListener("message", this, false);
        pResolve();
      }
    }
  }, false);
  return new Promise((resolve, reject) => {
    pResolve = resolve;
    pReject  = reject;
  });
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

function FileReaderPromise(file, methodName) {
  const reader = new FileReader();
  const p = new Promise((resolve, reject) => {
    reader.onload = function() {
      resolve(reader.result);
    };
    reader.onerror = function() {
      reject(reader.error);
    };
  });
  reader[methodName](file);
  return p;
}

function TimeLimitPromise(promise, limit=500, message="Time limit expired") {
  return new Promise((resolve, reject) => {
    promise.then(resolve);
    setTimeout(function() {
      reject(message);
    }, limit);
  });
}
