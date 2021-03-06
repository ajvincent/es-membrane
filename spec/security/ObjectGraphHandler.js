if (typeof MembraneMocks != "function") {
  if (typeof require == "function") {
    var { MembraneMocks } = require("../../docs/dist/node/mocks.js");
  }
  else
    throw new Error("Unable to run tests: cannot get MembraneMocks");
}

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

  /* spec/security/exports.js guarantees ObjectGraphHandler (the function) is
   * not exposed to users.
   */

  it("Setting the prototype of ObjectGraphHandler is disallowed", function() {
    const proto = Reflect.getPrototypeOf(dryHandler);
    expect(Reflect.ownKeys(proto).includes("ownKeys")).toBe(true);
    expect(Reflect.setPrototypeOf(proto, {})).toBe(false);

    // the prototype inherits only from Object
    expect(Reflect.getPrototypeOf(proto)).toBe(Object.prototype);
  });

  it("Setting the prototype of a ChainHandler is disallowed", function() {
    const chain1 = membrane.modifyRules.createChainHandler(dryHandler);
    expect(Reflect.setPrototypeOf(chain1, {})).toBe(false);
  });

  it("The object graph handler disallows setting its fieldName", function() {
    const desc = Reflect.getOwnPropertyDescriptor(dryHandler, "fieldName");
    expect(desc.writable).toBe(false);
    expect(desc.configurable).toBe(false);
  });

  it(
    "A chain handler disallows setting properties it inherits from ObjectGraphHandler",
    function() {
      const chain1 = membrane.modifyRules.createChainHandler(dryHandler);
      const keys = Reflect.ownKeys(dryHandler);

      const desc = {
        value: "hello",
        writable: true,
        enumerable: true,
        configurable: true
      };

      keys.forEach(function(key) {
        expect(Reflect.defineProperty(chain1, key, desc)).toBe(false);
      });
    }
  );

  /* spec/features/replaceProxies.js guarantees chain handlers can have
   * additional properties.  They just can't be of the reserved property names.
   *
   * The same spec guarantees we can override inherited traps.
   */
});
