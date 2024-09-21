import UpdateShadowTarget from "#objectgraph_handlers/source/decorators/updateShadowTarget.js";

import type {
  ObjectGraphHandlerIfc
} from "#objectgraph_handlers/source/generated/types/ObjectGraphHandlerIfc.js";

import ObjectGraphTailHandler from "#objectgraph_handlers/source/generated/ObjectGraphTailHandler.js";
import {
  DataDescriptor
} from "#objectgraph_handlers/source/sharedUtilities.js";

describe("UpdateShadowTarget works as a direct class decorator: the trap", () => {
  let spyObjectGraphHandler: ObjectGraphHandlerIfc;
  let shadowTarget: object, nextTarget: object;
  const nextGraphKey = Symbol("next graph");

  @UpdateShadowTarget
  class MockProxyHandler extends ObjectGraphTailHandler {
    // empty on purpose
  }

  beforeEach(() => {
    spyObjectGraphHandler = new MockProxyHandler(
      jasmine.createSpyObj("membrane", ["convertArray", "convertDescriptors"]),
      "this graph"
    );
    shadowTarget = {};
    nextTarget = {};
  });

  // apply trap not implemented
  // construct trap not implemented

  describe(`"defineProperty"`, () => {
    it("forwards a successful definition to the next target", () => {
      const shadowFoo: PropertyDescriptor = {
        value: "bar",
        writable: true,
        enumerable: true,
        configurable: true
      };

      const nextFoo = {...shadowFoo};

      const result = spyObjectGraphHandler.defineProperty(
        shadowTarget, "foo", shadowFoo, nextGraphKey, nextTarget, "foo", nextFoo
      );

      expect(result).toBe(true);
      expect(Reflect.get(nextTarget, "foo")).toBe("bar");
    });

    it("returns false for a non-extensible next target", () => {
      const shadowFoo: PropertyDescriptor = {
        value: "bar",
        writable: true,
        enumerable: true,
        configurable: true
      };

      const nextFoo = {...shadowFoo};
      Reflect.preventExtensions(nextTarget);

      const result = spyObjectGraphHandler.defineProperty(
        shadowTarget, "foo", shadowFoo, nextGraphKey, nextTarget, "foo", nextFoo
      );

      expect(result).toBe(false);
      expect(Reflect.get(nextTarget, "foo")).toBe(undefined);
    });

    it("returns false for a non-configurable property on the next target", () => {
      const shadowFoo: PropertyDescriptor = {
        value: "bar",
        writable: true,
        enumerable: true,
        configurable: true
      };

      const nextFoo = { ...shadowFoo, };
      Reflect.defineProperty(nextTarget, "foo", {
        ...shadowFoo,
        value: "wop",
        configurable: false
      });

      const result = spyObjectGraphHandler.defineProperty(
        shadowTarget, "foo", shadowFoo, nextGraphKey, nextTarget, "foo", nextFoo
      );

      expect(result).toBe(false);
      expect(Reflect.get(nextTarget, "foo")).toBe("wop");
    });

    // not testing a non-configurable property on the shadow target: UpdateShadowTarget trusts the super class.
  });

  describe(`"deleteProperty"`, () => {
    it("returns true for a non-existent property", () => {
      expect(spyObjectGraphHandler.deleteProperty(
        shadowTarget, "foo", nextGraphKey, nextTarget, "foo"
      )).toBe(true);
    });

    it("returns true for an ordinary property deletion via the next target", () => {
      const shadowFoo: PropertyDescriptor = {
        value: "bar",
        writable: true,
        enumerable: true,
        configurable: true
      };
      Reflect.defineProperty(shadowTarget, "foo", shadowFoo);
      Reflect.defineProperty(nextTarget, "foo", shadowFoo);

      expect(
        spyObjectGraphHandler.deleteProperty(shadowTarget, "foo", nextGraphKey, nextTarget, "foo")
      ).toBe(true);
      expect(Reflect.getOwnPropertyDescriptor(shadowTarget, "foo")).toBeUndefined();
      expect(Reflect.getOwnPropertyDescriptor(nextTarget, "foo")).toBeUndefined();
    });

    it("returns false for a non-configurable property deletion via the next target", () => {
      const shadowFoo: PropertyDescriptor = {
        value: "bar",
        writable: true,
        enumerable: true,
        configurable: false
      };
      Reflect.defineProperty(shadowTarget, "foo", shadowFoo);
      Reflect.defineProperty(nextTarget, "foo", shadowFoo);

      expect(
        spyObjectGraphHandler.deleteProperty(shadowTarget, "foo", nextGraphKey, nextTarget, "foo")
      ).toBe(false);
      expect(Reflect.getOwnPropertyDescriptor(shadowTarget, "foo")?.value).toBe("bar")
      expect(Reflect.getOwnPropertyDescriptor(nextTarget, "foo")?.value).toBe("bar");
    });
  });

  // get trap not implemented

  describe(`"getOwnPropertyDescriptor"`, () => {
    it("with no defined key on the target", () => {
      const result = spyObjectGraphHandler.getOwnPropertyDescriptor(shadowTarget, "foo", nextGraphKey, nextTarget, "foo");
      expect(result).toBe(undefined);
    });

    it("with a defined property on the next target", () => {
      const nextFoo: PropertyDescriptor = {
        value: "foo",
        writable: true,
        enumerable: true,
        configurable: true
      };
      Reflect.defineProperty(nextTarget, "foo", nextFoo);

      const result = spyObjectGraphHandler.getOwnPropertyDescriptor(
        shadowTarget, "foo", nextGraphKey, nextTarget, "foo"
      );
      expect(result).toBeDefined();
      if (result) {
        // Recall this is an unit test.  The WrapReturnValues decorator should ensure wrapping of the super call's return.
        expect(result).toEqual(nextFoo);
        expect(result).not.toBe(nextFoo);
      }
    });

    it("with the removal of a property on the next target", () => {
      const shadowFoo: PropertyDescriptor = {
        value: "foo",
        writable: true,
        enumerable: true,
        configurable: true
      };
      Reflect.defineProperty(shadowTarget, "foo", shadowFoo);

      const result = spyObjectGraphHandler.getOwnPropertyDescriptor(shadowTarget, "foo", nextGraphKey, nextTarget, "foo");
      expect(result).toBe(undefined);
    });

    it("respects non-configurable properties", () => {
      const shadowFoo: PropertyDescriptor = {
        value: "foo",
        writable: true,
        enumerable: true,
        configurable: false
      };
      Reflect.defineProperty(shadowTarget, "foo", shadowFoo);

      const result = spyObjectGraphHandler.getOwnPropertyDescriptor(shadowTarget, "foo", nextGraphKey, nextTarget, "foo");
      expect(result).toEqual(shadowFoo);
    });
  });

  describe(`"getPrototypeOf"`, () => {
    it("updates the shadow target's prototype with a real value from the next target", () => {
      // this test is not realistic: the prototype is unwrapped.  WrapReturnValues is separate.
      const nextProto = {
        "hello": true
      };
      Reflect.setPrototypeOf(nextTarget, nextProto);

      expect(
        spyObjectGraphHandler.getPrototypeOf(shadowTarget, nextGraphKey, nextTarget)
      ).toBe(nextProto);

      expect(Reflect.getPrototypeOf(shadowTarget)).toBe(nextProto);
    });

    it("updates the shadow target's prototype with null from the next target", () => {
      // this test is not realistic: the prototype is unwrapped.  WrapReturnValues is separate.
      Reflect.setPrototypeOf(nextTarget, null);

      expect(
        spyObjectGraphHandler.getPrototypeOf(shadowTarget, nextGraphKey, nextTarget)
      ).toBeNull();

      expect(Reflect.getPrototypeOf(shadowTarget)).toBeNull();
    });
  });

  // has trap not implemented

  describe(`"isExtensible"`, () => {
    const nextProto = {
      "hello": true
    };
    const shadowProto = {
      "hello": true
    };

    const nextFoo: PropertyDescriptor = {
      value: "wop",
      writable: true,
      enumerable: true,
      configurable: true
    };

    beforeEach(() => {
      Reflect.setPrototypeOf(nextTarget, nextProto);
      Reflect.setPrototypeOf(shadowTarget, shadowProto);
      Reflect.defineProperty(nextTarget, "foo", nextFoo);
    });

    it("does nothing when the super class returns true", () => {
      expect(
        spyObjectGraphHandler.isExtensible(shadowTarget, nextGraphKey, nextTarget)
      ).toBe(true);

      expect(Reflect.isExtensible(nextTarget)).toBeTrue();
      expect(Reflect.getPrototypeOf(nextTarget)).toBe(nextProto);
      expect(Reflect.get(nextTarget, "foo")).toBe("wop");

      expect(Reflect.isExtensible(shadowTarget)).toBeTrue();
      expect(Reflect.getPrototypeOf(shadowTarget)).toBe(shadowProto);
      expect(Reflect.get(shadowTarget, "foo")).toBeUndefined();
    });

    it("forces the shadow target into a locked state when the super class returns false", () => {
      Reflect.preventExtensions(nextTarget);
      expect(
        spyObjectGraphHandler.isExtensible(shadowTarget, nextGraphKey, nextTarget)
      ).toBe(false);

      expect(Reflect.isExtensible(nextTarget)).toBeFalse();
      expect(Reflect.getPrototypeOf(nextTarget)).toBe(nextProto);
      expect(Reflect.get(nextTarget, "foo")).toBe("wop");

      expect(Reflect.isExtensible(shadowTarget)).toBeFalse();
      expect(Reflect.getPrototypeOf(shadowTarget)).toBe(nextProto);
      expect(Reflect.get(shadowTarget, "foo")).toBe("wop");
    });
  });

  describe(`"ownKeys"`, () => {
    it("with no keys on the next target", () => {
      const result = spyObjectGraphHandler.ownKeys(shadowTarget, nextGraphKey, nextTarget);
      expect(result).toEqual([]);
    });

    it("with discovered keys on the next target", () => {
      Reflect.defineProperty(nextTarget, "foo", new DataDescriptor("foo", true, true, true));
      Reflect.defineProperty(nextTarget, "bar", new DataDescriptor("bar", true, true, true));

      const result = spyObjectGraphHandler.ownKeys(shadowTarget, nextGraphKey, nextTarget);
      expect(result).toEqual(["foo", "bar"]);

      expect(Reflect.ownKeys(shadowTarget)).toEqual(["foo", "bar"]);
      expect(Reflect.getOwnPropertyDescriptor(shadowTarget, "foo")!.value).toBe(undefined);
      expect(Reflect.getOwnPropertyDescriptor(shadowTarget, "bar")!.value).toBe(undefined);
    });

    it("with keys to remove on the next target", () => {
      Reflect.defineProperty(shadowTarget, "foo", new DataDescriptor("foo", true, true, true));
      Reflect.defineProperty(shadowTarget, "bar", new DataDescriptor("bar", true, true, true));
      Reflect.defineProperty(nextTarget, "bar", new DataDescriptor("bar", true, true, true));
      Reflect.defineProperty(nextTarget, "wop", new DataDescriptor("wop", true, true, true));

      const result = spyObjectGraphHandler.ownKeys(shadowTarget, nextGraphKey, nextTarget);
      expect(result).toEqual(["bar", "wop"]);

      expect(Reflect.ownKeys(shadowTarget)).toEqual(["bar", "wop"]);
      expect(Reflect.getOwnPropertyDescriptor(shadowTarget, "bar")!.value).toBe("bar");
      expect(Reflect.getOwnPropertyDescriptor(shadowTarget, "wop")!.value).toBe(undefined);
    });

    /* This is an unfair test for UpdateShadowTarget - when would the shadow ever be frozen when nextTarget wasn't -
    but it is in line with the invariants for the ownKeys trap.
    */
    it("with isExtensible returning false", () => {
      Reflect.defineProperty(shadowTarget, "foo", new DataDescriptor("foo", true, true, true));
      Reflect.defineProperty(nextTarget, "bar", new DataDescriptor("bar", true, true, true));
      Reflect.defineProperty(nextTarget, "wop", new DataDescriptor("wop", true, true, true));

      Reflect.preventExtensions(shadowTarget);

      const result = spyObjectGraphHandler.ownKeys(shadowTarget, nextGraphKey, nextTarget);
      expect(result).toEqual(["foo"]);

      expect(Reflect.ownKeys(shadowTarget)).toEqual(["foo"]);
      expect(Reflect.getOwnPropertyDescriptor(shadowTarget, "foo")!.value).toBe("foo");
    });
  });

  describe(`"preventExtensions"`, () => {
    it("forces the shadow target into a locked state when the super class returns true", () => {
      const nextProto = {
        "hello": true
      };
      Reflect.setPrototypeOf(nextTarget, nextProto);

      const shadowProto = {
        "hello": true
      };
      Reflect.setPrototypeOf(shadowTarget, shadowProto);

      const nextFoo: PropertyDescriptor = {
        value: "wop",
        writable: true,
        enumerable: true,
        configurable: true
      };
      Reflect.defineProperty(nextTarget, "foo", nextFoo);

      expect(
        spyObjectGraphHandler.preventExtensions(shadowTarget, nextGraphKey, nextTarget)
      ).toBe(true);

      expect(Reflect.isExtensible(nextTarget)).toBeFalse();
      expect(Reflect.getPrototypeOf(nextTarget)).toBe(nextProto);
      expect(Reflect.get(nextTarget, "foo")).toBe("wop");

      expect(Reflect.isExtensible(shadowTarget)).toBeFalse();
      expect(Reflect.getPrototypeOf(shadowTarget)).toBe(nextProto);
      expect(Reflect.get(shadowTarget, "foo")).toBe("wop");
    });

    // it's unusual for preventExtensions to ever return false.
  });

  // set trap not implemented

  describe(`"setPrototypeOf"`, () => {
    it("applies the prototypes for the shadow target and the next target when both are non-null", () => {
      const nextProto = {
        "hello": true
      };
      const shadowProto = {
        "hello": true
      };

      expect(
        spyObjectGraphHandler.setPrototypeOf(shadowTarget, shadowProto, nextGraphKey, nextTarget, nextProto)
      ).toBe(true);
      expect(Reflect.getPrototypeOf(shadowTarget)).toBe(shadowProto);
      expect(Reflect.getPrototypeOf(nextTarget)).toBe(nextProto);
    });

    it("applies the prototypes for the shadow target and the next target when both are null", () => {
      expect(
        spyObjectGraphHandler.setPrototypeOf(shadowTarget, null, nextGraphKey, nextTarget, null)
      ).toBe(true);
      expect(Reflect.getPrototypeOf(shadowTarget)).toBeNull()
      expect(Reflect.getPrototypeOf(nextTarget)).toBeNull();
    });

    it("does not apply the prototype for the shadow target when the next target is not extensible", () => {
      const nextProto = {
        "hello": true
      };
      const shadowProto = {
        "hello": true
      };

      const existingNextProto = Reflect.getPrototypeOf(nextTarget);
      const existingShadowProto = Reflect.getPrototypeOf(shadowTarget);
      Reflect.preventExtensions(nextTarget);

      expect(
        spyObjectGraphHandler.setPrototypeOf(shadowTarget, shadowProto, nextGraphKey, nextTarget, nextProto)
      ).toBe(false);
      expect(Reflect.getPrototypeOf(shadowTarget)).toBe(existingShadowProto);
      expect(Reflect.getPrototypeOf(nextTarget)).toBe(existingNextProto);

      // extra check: setPrototypeOf didn't have other side effects
      expect(Reflect.isExtensible(shadowTarget)).toBeTrue();
    });
  });
});
