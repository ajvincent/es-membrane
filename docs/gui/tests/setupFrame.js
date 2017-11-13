const CAPTURE_ONCE = Object.freeze({once: true, capture: true});
var testFrame;

function getDocumentLoadPromise(url) {
  if (!testFrame) {
    testFrame = document.createElement("iframe");
    document.body.appendChild(testFrame);
  }
  return IFrameLoadPromise(testFrame, url);
}

afterEach(getDocumentLoadPromise.bind(null, "about:blank"));

afterAll(function() {
  testFrame.setAttribute("src", "data:text/html," + encodeURIComponent([
    "<p>Tests complete.  This is a dummy iframe used to load pages for exercising",
    "simple widgets or complete UI.  Feel free to load whatever pages you need",
    "into this iframe, provided:</p> <ol><li>the source for the iframe is under ",
    "docs/gui/tests/,</li> <li>you delay running your tests until the iframe is",
    "completely loaded,</li> <li>you write your spec function with a done argument,",
    "which you invoke at the end of your spec's run.</li></ol>",
    "<p>See docs/gui/tests/setupFrame.js for some simple examples.</p>",
  ].join(" ")));
});
