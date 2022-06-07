/* XXX ajvincent This is a placeholder test:  please remove items from the array
 * as soon as at least one real test for the item's behavior exists.
 */
it("Top-level globals for the Distortion UI exist", async function() {
  "use strict";
  await getDocumentLoadPromise("base/gui/index.html");
  [
    "MultistateHandler",
    "defineElementGetter",
    "getCustomStylesheet",
    "CSSClassToggleHandler",
    "CSSRuleEventHandler",
    "JSZip",
  ].forEach(function(k) {
    let val = testFrame.contentWindow[k];
    expect(typeof val).not.toBe("undefined", "missing " + k);
  });
});
