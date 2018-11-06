if (typeof MembraneMocks != "function") {
  if (typeof require == "function") {
    var { MembraneMocks } = require("../../docs/dist/node/mocks.js");
  }
  else
    throw new Error("Unable to run tests: cannot get MembraneMocks");
}

describe("Security checks for object graph handlers", function() {
  "use strict";
  var wetDocument, dryDocument, membrane, wetHandler, dryHandler;
  beforeEach(function() {
    let parts = MembraneMocks();
    wetDocument = parts.wet.doc;
    dryDocument = parts.dry.doc;
    wetHandler  = parts.handlers.wet;
    dryHandler  = parts.handlers.dry;
    membrane    = parts.membrane;
  });

  afterEach(function() {
    wetDocument = null;
    dryDocument = null;
    wetHandler  = null;
    dryHandler  = null;
    membrane    = null;
  });

  /* spec/security/exports.js guarantees ObjectGraphHandler (the function) is
   * not exposed to users.
   */

  it("setting the prototype of ObjectGraphHandler is disallowed", function() {
    const proto = Reflect.getPrototypeOf(dryHandler);
    expect(Reflect.ownKeys(proto).includes("ownKeys")).toBe(true);
    expect(Reflect.setPrototypeOf(proto, {})).toBe(false);

    // the prototype inherits only from Object
    expect(Reflect.getPrototypeOf(proto)).toBe(Object.prototype);
  });

  it("setting the prototype of a ChainHandler is disallowed", function() {
    const chain1 = membrane.modifyRules.createChainHandler(dryHandler);
    expect(Reflect.setPrototypeOf(chain1, {})).toBe(false);
  });
});
