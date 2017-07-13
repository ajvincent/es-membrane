if (typeof MembraneMocks != "function") {
  if (typeof require == "function") {
    var { MembraneMocks } = require("../../docs/dist/node/mocks.js");
  }
  else
    throw new Error("Unable to run tests: cannot get MembraneMocks");
}

/* XXX ajvincent This is very specifically testing internal API's.  Hence the
 * conditional block at the start of this auto-executing function.
 */
(function() {
{
  let parts = MembraneMocks(false);
  if (typeof parts.handlers.dry.defineLazyGetter === "undefined")
    return;
  parts = null;
}
describe("Internal API:  Defining a lazy getter", function() {
  "use strict";
  var parts, dryDocument, wetDocument, membrane, shadow;

  beforeEach(function() {
    parts = MembraneMocks(false);
    dryDocument  = parts.dry.doc;
    wetDocument  = parts.wet.doc;
    membrane     = parts.membrane;

    let mapping = membrane.map.get(dryDocument);
    shadow = mapping.getShadowTarget("dry");
  });

  it("by itself does not affect an original target", function() {
    parts.handlers.dry.defineLazyGetter(wetDocument, shadow, "parentNode");

    let wetDesc = Reflect.getOwnPropertyDescriptor(wetDocument, "parentNode");
    expect("value" in wetDesc).toBe(true);

    let dryDesc = Reflect.getOwnPropertyDescriptor(dryDocument, "parentNode");
    expect("value" in dryDesc).toBe(true);

    let shadowDesc = Reflect.getOwnPropertyDescriptor(shadow, "parentNode");
    expect(shadowDesc).not.toBe(undefined);
    if (shadowDesc) {
      expect("value" in shadowDesc).toBe(false);
      expect("get" in shadowDesc).toBe(true);
      expect(shadowDesc.configurable).toBe(true);
    }
  });

  it("and then defining a value through the dry object ignores the lazy getter", function() {
    parts.handlers.dry.defineLazyGetter(wetDocument, shadow, "nodeType");
    dryDocument.nodeType = 15;
    expect(wetDocument.nodeType).toBe(15);

    let shadowDesc = Reflect.getOwnPropertyDescriptor(shadow, "nodeType");
    expect(shadowDesc).not.toBe(undefined);
    if (shadowDesc) {
      expect("value" in shadowDesc).toBe(false);
      expect("get" in shadowDesc).toBe(true);
      expect(shadowDesc.configurable).toBe(true);
    }
  });

  it("and then defining a value through the wet object ignores the lazy getter", function() {
    parts.handlers.dry.defineLazyGetter(wetDocument, shadow, "nodeType");
    wetDocument.nodeType = 15;
    expect(wetDocument.nodeType).toBe(15);

    let shadowDesc = Reflect.getOwnPropertyDescriptor(shadow, "nodeType");
    expect(shadowDesc).not.toBe(undefined);
    if (shadowDesc) {
      expect("value" in shadowDesc).toBe(false);
      expect("get" in shadowDesc).toBe(true);
      expect(shadowDesc.configurable).toBe(true);
    }
  });

  it("and then invoking the lazy getter's .get() returns an expected value", function() {
    parts.handlers.dry.defineLazyGetter(wetDocument, shadow, "rootElement");
    let dryRoot = dryDocument.rootElement;

    let shadowDesc = Reflect.getOwnPropertyDescriptor(shadow, "rootElement");
    expect(shadowDesc).not.toBe(undefined);
    if (shadowDesc) {
      expect("value" in shadowDesc).toBe(false);
      expect("get" in shadowDesc).toBe(true);
      expect(shadowDesc.configurable).toBe(true);
    }

    let root = shadow.rootElement;

    shadowDesc = Reflect.getOwnPropertyDescriptor(shadow, "rootElement");
    expect(shadowDesc).not.toBe(undefined);
    if (shadowDesc) {
      expect("value" in shadowDesc).toBe(true);
      expect("get" in shadowDesc).toBe(false);
      expect(shadowDesc.configurable).toBe(true);
    }

    expect(root).toBe(dryRoot);
  });

  it(
    "and then invoking the lazy getter stores the first available property value on the shadow",
    function() {
      parts.handlers.dry.defineLazyGetter(wetDocument, shadow, "nodeType");
      expect(shadow.nodeType).toBe(9);
      wetDocument.nodeType = 15;
      expect(dryDocument.nodeType).toBe(15);
      expect(shadow.nodeType).toBe(9);
    }
  );

  it(
    "and then setting the named value overrides the lazy getter but does not propagate the property to the underlying target",
    function() {
      parts.handlers.dry.defineLazyGetter(wetDocument, shadow, "nodeType");
      shadow.nodeType = 15;
      expect(wetDocument.nodeType).toBe(9);

      let shadowDesc = Reflect.getOwnPropertyDescriptor(shadow, "nodeType");
      expect(shadowDesc).not.toBe(undefined);
      if (shadowDesc) {
        expect("value" in shadowDesc).toBe(true);
        expect("get" in shadowDesc).toBe(false);
        expect(shadowDesc.configurable).toBe(true);
      }
    }
  );

  it(
    "and then sealing the dry value locks in the properties of the shadow target",
    function() {
      parts.handlers.dry.defineLazyGetter(wetDocument, shadow, "nodeType");
      Object.seal(dryDocument);

      let shadowDesc = Reflect.getOwnPropertyDescriptor(shadow, "nodeType");
      expect(shadowDesc).not.toBe(undefined);
      if (shadowDesc) {
        expect("value" in shadowDesc).toBe(true);
        expect("get" in shadowDesc).toBe(false);
        expect(shadowDesc.configurable).toBe(false);
      }
    }
  );

  it(
    "and then freezing the dry value locks in the properties of the shadow target",
    function() {
      parts.handlers.dry.defineLazyGetter(wetDocument, shadow, "nodeType");
      Object.freeze(dryDocument);

      let shadowDesc = Reflect.getOwnPropertyDescriptor(shadow, "nodeType");
      expect(shadowDesc).not.toBe(undefined);
      if (shadowDesc) {
        expect("value" in shadowDesc).toBe(true);
        expect("get" in shadowDesc).toBe(false);
        expect(shadowDesc.configurable).toBe(false);
      }
    }
  );

  it("and then sealing the shadow target has bad side effects", function() {
    function checkShadowDesc() {
      let shadowDesc = Reflect.getOwnPropertyDescriptor(shadow, "nodeType");
      expect(shadowDesc).not.toBe(undefined);
      if (shadowDesc) {
        expect("value" in shadowDesc).toBe(false);
        expect("get" in shadowDesc).toBe(true);
        expect(shadowDesc.configurable).toBe(false);
      }
    }

    parts.handlers.dry.defineLazyGetter(wetDocument, shadow, "nodeType");
    Object.seal(shadow);

    checkShadowDesc();

    expect(function() {
      void(shadow.nodeType);
    }).toThrow();
    checkShadowDesc();

    expect(function() {
      shadow.nodeType = 15;
    }).toThrow();
    checkShadowDesc();
  });

  it("and then freezing the shadow target has bad side effects", function() {
    function checkShadowDesc() {
      let shadowDesc = Reflect.getOwnPropertyDescriptor(shadow, "nodeType");
      expect(shadowDesc).not.toBe(undefined);
      if (shadowDesc) {
        expect("value" in shadowDesc).toBe(false);
        expect("get" in shadowDesc).toBe(true);
        expect(shadowDesc.configurable).toBe(false);
      }
    }

    parts.handlers.dry.defineLazyGetter(wetDocument, shadow, "nodeType");
    Object.freeze(shadow);

    checkShadowDesc();

    expect(function() {
      void(shadow.nodeType);
    }).toThrow();
    checkShadowDesc();

    expect(function() {
      shadow.nodeType = 15;
    }).toThrow();
    checkShadowDesc();
  });

  it("ensures the object graph is alive", function() {
    parts.handlers.dry.defineLazyGetter(wetDocument, shadow, "nodeType");
    parts.handlers.dry.revokeEverything();

    let wetDesc = Reflect.getOwnPropertyDescriptor(wetDocument, "nodeType");
    expect("value" in wetDesc).toBe(true);

    expect(function() {
      void(shadow.nodeType);
    }).toThrow();
  });
});
})();
