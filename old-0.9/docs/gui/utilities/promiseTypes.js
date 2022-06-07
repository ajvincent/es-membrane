/*
function TimeoutPromise(delay) {
  return new Promise((resolve) => { setTimeout(resolve, delay); });
}
*/

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
