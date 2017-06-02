/*
import "../docs/dist/es6-modules/Membrane.js";
*/

if (typeof Membrane != "function") {
  if (typeof require == "function") {
    var { Membrane } = require("../docs/dist/node/es7-membrane.js");
  }
  else
    throw new Error("Unable to run tests: cannot get Membrane");
}

/* XXX ajvincent This is actually one case where the MembraneMocks are not
 * appropriate, because they forcibly insert a "membraneGraphName" property in a
 * way that is not entirely friendly to Object.freeze() or Object.seal() calls.
 *
 * This should be fixed at some point, but for now we'll just manually create
 * the wet and dry graphs and experiment with freezing and sealing on those.
 */

{
let FreezeSealMocks = function(defineListeners, adjustParts) {
  function wetA() {}
  wetA.prototype.letter = "A";

  function wetB() {}
  wetB.prototype = new wetA();
  wetB.prototype.letter = "B";

  function wetC() {}
  wetC.prototype.letter = "C";

  const parts = {
    wet: {
      A: wetA,
      B: wetB,
      C: wetC,

      b: new wetB()
    },

    dry: {},

    handlers: {},

    membrane: new Membrane()
  };

  parts.wet.b.instance = 1;

  parts.handlers.wet = parts.membrane.getHandlerByField("wet", true);
  parts.handlers.dry = parts.membrane.getHandlerByField("dry", true);

  defineListeners(parts);

  let keys = Reflect.ownKeys(parts.wet);
  keys.forEach(function(k) {
    parts.dry[k] = parts.membrane.convertArgumentToProxy(
      parts.handlers.wet,
      parts.handlers.dry,
      parts.wet[k]
    );
  });
  
  adjustParts(parts);
  return parts;
};

/* These tests are specifically crafted for a perfect mirroring.  Very different
 * results will occur when the mirroring is not perfect.
 */
let freezeSealTests = function(expectedFrozen, defineListeners, adjustParts) {
  var parts;
  beforeEach(function() {
    parts = FreezeSealMocks(defineListeners, adjustParts);
  });
  afterEach(function() {
    parts.handlers.wet.revokeEverything();
    parts.handlers.dry.revokeEverything();
    parts = null;
  });

  it("works as expected when manipulating the wet side", function() {
    expect(Reflect.isExtensible(parts.wet.b)).toBe(false);
    expect(Reflect.isExtensible(parts.wet.B)).toBe(false);

    expect(Reflect.isExtensible(parts.dry.b)).toBe(false);
    expect(Reflect.isExtensible(parts.dry.B)).toBe(false);

    // undefined property cannot be set
    expect(Reflect.defineProperty(parts.wet.b, "extra", {
      value: 5,
      writable: true,
      enumerable: true,
      configurable: true
    })).toBe(false);
    expect(parts.wet.b.extra).toBe(undefined);
    expect(parts.dry.b.extra).toBe(undefined);

    {
      let desc = Reflect.getOwnPropertyDescriptor(parts.wet.b, "instance");
      expect(desc.configurable).toBe(false);
      expect(desc.writable).toBe(!expectedFrozen);
    }

    {
      let desc = Reflect.getOwnPropertyDescriptor(parts.dry.b, "instance");
      expect(desc.configurable).toBe(false);
      expect(desc.writable).toBe(!expectedFrozen);
    }

    {
      let oldDesc = Reflect.getOwnPropertyDescriptor(parts.wet.b, "instance");
      let newDesc = {
        value: 2,
        writable: true,
        enumerable: oldDesc.enumerable,
        configurable: oldDesc.configurable
      };
      let actual = Reflect.defineProperty(parts.wet.b, "instance", newDesc);
      expect(actual).toBe(!expectedFrozen);
    }

    const expectedValue = expectedFrozen ? 1 : 2;
    expect(parts.wet.b.instance).toBe(expectedValue);
    expect(parts.dry.b.instance).toBe(expectedValue);

    expect(Object.isFrozen(parts.wet.b)).toBe(expectedFrozen);
    expect(Object.isFrozen(parts.dry.b)).toBe(expectedFrozen);

    expect(Object.isSealed(parts.wet.b)).toBe(true);
    expect(Object.isSealed(parts.dry.b)).toBe(true);

    // setPrototypeOf
    expect(Reflect.getPrototypeOf(parts.wet.b)).toBe(parts.wet.B.prototype);

    /* XXX ajvincent Disabled for now:  see issue #82.
    expect(Reflect.getPrototypeOf(parts.dry.b)).toBe(parts.dry.B.prototype);
    */

    expect(Reflect.setPrototypeOf(parts.wet.b, parts.wet.A.prototype)).toBe(false);
    expect(Reflect.getPrototypeOf(parts.wet.b)).toBe(parts.wet.B.prototype);
    /* XXX ajvincent Disabled for now:  see issue #82.
    expect(Reflect.getPrototypeOf(parts.dry.b)).toBe(parts.dry.B.prototype);
    */

    expect(Reflect.setPrototypeOf(parts.wet.b, parts.wet.C.prototype)).toBe(false);
    expect(Reflect.getPrototypeOf(parts.wet.b)).toBe(parts.wet.B.prototype);
    /* XXX ajvincent Disabled for now:  see issue #82.
    expect(Reflect.getPrototypeOf(parts.dry.b)).toBe(parts.dry.B.prototype);
    */

    expect(Reflect.setPrototypeOf(parts.wet.b, parts.wet.B.prototype)).toBe(true);
    expect(Reflect.getPrototypeOf(parts.wet.b)).toBe(parts.wet.B.prototype);
    /* XXX ajvincent Disabled for now:  see issue #82.
    expect(Reflect.getPrototypeOf(parts.dry.b)).toBe(parts.dry.B.prototype);
    */

    expect(Reflect.setPrototypeOf(parts.wet.b, {})).toBe(false);
    expect(Reflect.getPrototypeOf(parts.wet.b)).toBe(parts.wet.B.prototype);
    /* XXX ajvincent Disabled for now:  see issue #82.
    expect(Reflect.getPrototypeOf(parts.dry.b)).toBe(parts.dry.B.prototype);
    */
  });


  it("works as expected when manipulating the dry side", function() {
    expect(Reflect.isExtensible(parts.wet.b)).toBe(false);
    expect(Reflect.isExtensible(parts.wet.B)).toBe(false);

    expect(Reflect.isExtensible(parts.dry.b)).toBe(false);
    expect(Reflect.isExtensible(parts.dry.B)).toBe(false);

    // undefined property cannot be set
    expect(Reflect.defineProperty(parts.wet.b, "extra", {
      value: 5,
      writable: true,
      enumerable: true,
      configurable: true
    })).toBe(false);
    expect(parts.wet.b.extra).toBe(undefined);
    expect(parts.dry.b.extra).toBe(undefined);

    {
      let desc = Reflect.getOwnPropertyDescriptor(parts.wet.b, "instance");
      expect(desc.configurable).toBe(false);
      expect(desc.writable).toBe(!expectedFrozen);
    }

    {
      let desc = Reflect.getOwnPropertyDescriptor(parts.dry.b, "instance");
      expect(desc.configurable).toBe(false);
      expect(desc.writable).toBe(!expectedFrozen);
    }

    {
      let oldDesc = Reflect.getOwnPropertyDescriptor(parts.dry.b, "instance");
      let newDesc = {
        value: 2,
        writable: true,
        enumerable: oldDesc.enumerable,
        configurable: oldDesc.configurable
      };
      let actual = Reflect.defineProperty(parts.dry.b, "instance", newDesc);
      expect(actual).toBe(!expectedFrozen);
    }

    const expectedValue = expectedFrozen ? 1 : 2;
    expect(parts.wet.b.instance).toBe(expectedValue);
    expect(parts.dry.b.instance).toBe(expectedValue);

    expect(Object.isFrozen(parts.wet.b)).toBe(expectedFrozen);
    expect(Object.isFrozen(parts.dry.b)).toBe(expectedFrozen);

    expect(Object.isSealed(parts.wet.b)).toBe(true);
    expect(Object.isSealed(parts.dry.b)).toBe(true);

    // setPrototypeOf
    /* XXX ajvincent Disabled for now:  see issue #82.
    expect(Reflect.getPrototypeOf(parts.wet.b)).toBe(parts.wet.B.prototype);
    expect(Reflect.getPrototypeOf(parts.dry.b)).toBe(parts.dry.B.prototype);

    expect(Reflect.setPrototypeOf(parts.dry.b, parts.wet.A.prototype)).toBe(false);
    expect(Reflect.getPrototypeOf(parts.wet.b)).toBe(parts.wet.B.prototype);
    expect(Reflect.getPrototypeOf(parts.dry.b)).toBe(parts.dry.B.prototype);

    expect(Reflect.setPrototypeOf(parts.dry.b, parts.wet.C.prototype)).toBe(false);
    expect(Reflect.getPrototypeOf(parts.wet.b)).toBe(parts.wet.B.prototype);
    expect(Reflect.getPrototypeOf(parts.dry.b)).toBe(parts.dry.B.prototype);

    expect(Reflect.setPrototypeOf(parts.dry.b, parts.wet.B.prototype)).toBe(true);
    expect(Reflect.getPrototypeOf(parts.wet.b)).toBe(parts.wet.B.prototype);
    expect(Reflect.getPrototypeOf(parts.dry.b)).toBe(parts.dry.B.prototype);

    expect(Reflect.setPrototypeOf(parts.dry.b, {})).toBe(false);
    expect(Reflect.getPrototypeOf(parts.wet.b)).toBe(parts.wet.B.prototype);
    expect(Reflect.getPrototypeOf(parts.dry.b)).toBe(parts.dry.B.prototype);
    */
  });
};

const voidFunc = function() { /* do nothing */ };

describe("Object.freeze on the wet value", function() {
  freezeSealTests(
    true,
    voidFunc,
    function(parts) {
      Object.freeze(parts.wet.b);
      Object.freeze(parts.wet.B);
    }
  );
});

describe("Object.freeze on the dry proxy", function() {
  freezeSealTests(
    true,
    voidFunc,
    function(parts) {
      Object.freeze(parts.dry.b);
      Object.freeze(parts.dry.B);
    }
  );
});

describe("Object.seal on the wet value", function() {
  freezeSealTests(
    false,
    voidFunc,
    function(parts) {
      Object.seal(parts.wet.b);
      Object.seal(parts.wet.B);
    }
  );
});

describe("Object.seal on the dry proxy", function() {
  freezeSealTests(
    false,
    voidFunc,
    function(parts) {
      Object.seal(parts.dry.b);
      Object.seal(parts.dry.B);
    }
  );
});
}
