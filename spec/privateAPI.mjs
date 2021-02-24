import MembraneMocks from "./helpers/mocks.mjs";

describe("Private API methods are not exposed when the membrane is marked 'secured': ", function() {
  "use strict";
  var membrane, isPrivate;

  beforeEach(function() {
    let parts = MembraneMocks();
    membrane = parts.membrane;
    isPrivate = membrane.secured;
  });

  afterEach(function() {
    membrane = null;
  });

  it("Membrane.prototype.buildMapping", function() {
    const actual = typeof membrane.buildMapping;
    expect(actual).toBe(isPrivate ? "undefined" : "function");
  });
});
