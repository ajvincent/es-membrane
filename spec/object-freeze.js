"use strict"
/*
import "../docs/dist/es6-modules/Membrane.js";
import "../docs/dist/es6-modules/MembraneMocks.js";
*/

if (typeof MembraneMocks != "function") {
  if (typeof require == "function") {
    var { MembraneMocks, DAMP } = require("../docs/dist/node/mocks.js");
  }
}

if (typeof MembraneMocks != "function") {
  throw new Error("Unable to run tests");
}

describe("Freezing a function's prototype", function() {
  it("works on the dry side (without modification)", function() {
    let parts = MembraneMocks();

    Object.freeze(parts.dry.Element.prototype);
    let isFrozen = Object.isFrozen(parts.dry.Element.prototype);
    expect(isFrozen).toBe(true);
    expect(function() {
      void(parts.dry.doc.rootElement.nodeType);
    }).not.toThrow();
  });
});
