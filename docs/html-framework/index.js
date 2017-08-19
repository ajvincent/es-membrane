const editors = {};

const sourceURLs = new Map();
function getBlobURL(type, source) {
  let hash = type + "\n" + source;
  if (!sourceURLs.has(hash)) {
    let blob = new Blob([source], { type });
    let url = URL.createObjectURL(blob);
    sourceURLs.set(hash, url);
  }
  return sourceURLs.get(hash);
}

window.onload = function() {
  editors.html = CodeMirrorManager.buildNewEditor(
    document.getElementById("source-html"),
    "text/html"
  );
  editors.html.setValue(`<html>
<head>
  <title></title>
  <base href="../">
  <meta charset="UTF-8">
</head>
<body>
</body>
</html>`);

  editors.css = CodeMirrorManager.buildNewEditor(
    document.getElementById("source-css"),
    "text/css"
  );

  editors.js = CodeMirrorManager.buildNewEditor(
    document.getElementById("source-js"),
    "application/javascript"
  );

  updateRender();
  editors.html.on("changes", updateRenderWithDelay);
  editors.css.on("changes",  updateRenderWithDelay);
  editors.js.on("changes",   updateRenderWithDelay);
};

window.onunload = function() {
  sourceURLS.forEach(URL.revokeObjectURL);
};

function updateRender() {
  let html = editors.html.getValue();
  document.getElementById("render-html").src = getBlobURL("text/html", html);

  let css = editors.css.getValue();
  if (css !== "") {
    let cssURL = getBlobURL("text/css", css);
    let cssTag = `<link rel="stylesheet" href="${cssURL}">`;
    html = html.replace("</head>", `  ${cssTag}\n</head>`);
  }
  document.getElementById("render-css").src = getBlobURL("text/html", html);

  let js = editors.js.getValue();
  if (js !== "") {
    let jsURL = getBlobURL("application/javascript", js);
    let jsTag = `<script type="application/javascript" src="${jsURL}"></script>`;
    html = html.replace("</head>", `  ${jsTag}\n</head>`);
  }
  document.getElementById("render-js").src = getBlobURL("text/html", html);
}

var updateRenderTimeout = null;
function updateRenderWithDelay() {
  if (updateRenderTimeout)
    clearTimeout(updateRenderTimeout);
  updateRenderTimeout = setTimeout(updateRender, 1000);
}
