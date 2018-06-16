/*
import "../docs/dist/es6-modules/Membrane.js";
import "../docs/dist/es6-modules/MembraneMocks.js";
*/

if ((typeof MembraneMocks != "function") ||
    (typeof loggerLib != "object") ||
    (typeof DAMP != "symbol")) {
  if (typeof require == "function") {
    var { MembraneMocks, loggerLib, DAMP } = require("../docs/dist/node/mocks.js");
  }
}

if (typeof MembraneMocks != "function") {
  throw new Error("Unable to run tests");
}

describe("Private API methods are not exposed: ", function() {
  "use strict";
  var wetDocument, dryDocument, membrane;
  
  beforeEach(function() {
    let parts = MembraneMocks();
    wetDocument = parts.wet.doc;
    dryDocument = parts.dry.doc;
    membrane = parts.membrane;
  });

  afterEach(function() {
    wetDocument = null;
    dryDocument = null;
    membrane = null;
  });

  it("Membrane.prototype.buildMapping", function() {
    const actual = typeof membrane.buildMapping;
    expect(actual).toBe("undefined");
  });
});
