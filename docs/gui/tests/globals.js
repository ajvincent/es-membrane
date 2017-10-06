/* XXX ajvincent This is a placeholder test:  please remove items from the array
 * as soon as at least one real test for the item's behavior exists.
 */
it("Top-level globals for the Distortion UI exist", function() {
  "use strict";
  [
    "DistortionsManager",
    "DistortionsRules",
    "DistortionsGUI",
    "HandlerNames",
    "OuterGridManager",
    "TabboxRadioEventHandler",
    "MultistateHandler",
    "StartPanel",
    "OutputPanel",
    "styleAndMoveTreeColumns",
    "CodeMirrorManager",
    "defineElementGetter",
    "getCustomStylesheet",
    "CSSClassToggleHandler",
    "CSSRuleEventHandler",
  ].forEach(function(k) {
    let val = testFrame.contentWindow[k];
    expect(typeof val).not.toBe("undefined", "missing " + k);
  });
});
