import MembraneMocks from "../helpers/mocks.mjs";
import ObjectGraphHandler from "../../source/core/ObjectGraphHandler-old.mjs";

describe("Security checks for object graph handlers", function() {
  "use strict";
  var membrane, dryHandler;
  beforeEach(function() {
    let parts = MembraneMocks();
    dryHandler  = parts.handlers.dry;
    membrane    = parts.membrane;
  });

  afterEach(function() {
    dryHandler  = null;
    membrane    = null;
  });

  it("Setting the prototype of ObjectGraphHandler is disallowed", function() {
    const proto = Reflect.getPrototypeOf(dryHandler);
    expect(proto).toBe(ObjectGraphHandler.prototype);
    expect(Reflect.setPrototypeOf(dryHandler, {})).toBe(false);

    // the prototype inherits only from Object
    expect(Reflect.getPrototypeOf(proto)).toBe(Object.prototype);
  });

  it("The object graph handler disallows setting its graphName", function() {
    const desc = Reflect.getOwnPropertyDescriptor(dryHandler, "graphName");
    expect(desc.writable).toBe(false);
    expect(desc.configurable).toBe(false);
  });

  /* spec/features/replaceProxies.js guarantees chain handlers can have
   * additional properties.  They just can't be of the reserved property names.
   *
   * The same spec guarantees we can override inherited traps.
   */
});
