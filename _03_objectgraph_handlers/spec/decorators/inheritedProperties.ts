import OneToOneStrongMap from "#stage_utilities/source/collections/OneToOneStrongMap.js";

import InheritedPropertyTraps from "#objectgraph_handlers/source/decorators/inheritedProperties.js";

import type {
  ObjectGraphHandlerIfc
} from "#objectgraph_handlers/source/generated/types/ObjectGraphHandlerIfc.js";

import ObjectGraphTailHandler from "#objectgraph_handlers/source/generated/ObjectGraphTailHandler.js";
import UpdateShadowTarget from "#objectgraph_handlers/source/decorators/updateShadowTarget.js";
import WrapReturnValues from "#objectgraph_handlers/source/generated/decorators/wrapReturnValues.js";

import type {
  MembraneInternalIfc
} from "#objectgraph_handlers/source/types/MembraneInternalIfc.js";

import type {
  ObjectGraphValuesIfc
} from "#objectgraph_handlers/source/types/ObjectGraphHeadIfc.js";

describe("Inherited property traps: ", () => {
  //#region setup
  let spyObjectGraphHandler: ObjectGraphHandlerIfc;
  let shadowTarget: object, nextTarget: object, shadowProto: object, nextProto: object;
  let shadowReceiver: object, nextReceiver: object;
  let shadowFoo: PropertyDescriptor, nextFoo: PropertyDescriptor;
  const shadowGraphKey = Symbol("shadow graph");
  const nextGraphKey = Symbol("next graph");

  const nextShadowOneToOne = new OneToOneStrongMap<string | symbol, object>;
  function bindNextAndShadow(nextObject: object, shadowObject: object): void {
    nextShadowOneToOne.bindOneToOne(nextGraphKey, nextObject, shadowGraphKey, shadowObject);
  }

  const graphValues: ObjectGraphValuesIfc = {
    getArrayInGraph: function<
      Elements extends unknown[] = unknown[]
    >
    (
      valuesInSourceGraph: Elements,
      sourceGraphKey: string | symbol
    ): Elements
    {
      throw new Error("Function not implemented.");
    },

    getDescriptorInGraph: function (
      descriptorInSourceGraph: PropertyDescriptor | undefined,
      sourceGraphKey: string | symbol
    ): PropertyDescriptor | undefined
    {
      if (!descriptorInSourceGraph)
        return descriptorInSourceGraph;

      const result = {
        ...descriptorInSourceGraph
      };
      if ("value" in result)
        result.value = this.getValueInGraph(result.value, sourceGraphKey);
      if ("get" in result)
        result.get = this.getValueInGraph(result.get, sourceGraphKey) as (() => unknown);
      if ("set" in result)
        result.set = this.getValueInGraph(result.set, sourceGraphKey) as ((value: unknown) => void);

      return result;
    },

    getValueInGraph: function (
      valueInSourceGraph: unknown,
      sourceGraphKey: string | symbol
    ): unknown
    {
      if (!valueInSourceGraph)
        return valueInSourceGraph;
      if ((typeof valueInSourceGraph === "object") || (typeof valueInSourceGraph === "function"))
        return nextShadowOneToOne.get(valueInSourceGraph, sourceGraphKey);
      return valueInSourceGraph;
    },

    isRevoked: false,

    isKnownProxy: function (value: object): boolean {
      return value === shadowReceiver;
    }
  }

  const membraneMock: MembraneInternalIfc = {
    convertArray: function <ValueTypes extends unknown[]>(
      targetGraphKey: string | symbol,
      values: ValueTypes
    ): ValueTypes
    {
      throw new Error("Function not implemented.");
    },

    convertDescriptor: function (
      targetGraphKey: string | symbol,
      descriptor: PropertyDescriptor | undefined
    ): PropertyDescriptor | undefined
    {
      if (descriptor === undefined)
        return undefined;
      const wrappedDesc: PropertyDescriptor = {
        configurable: descriptor.configurable,
        enumerable: descriptor.enumerable,
      };
      if (descriptor.value)
        wrappedDesc.value = nextShadowOneToOne.get(descriptor.value, nextGraphKey);
      if (descriptor.get)
        wrappedDesc.get = nextShadowOneToOne.get(descriptor.get, nextGraphKey) as () => unknown;
      if (descriptor.set)
        wrappedDesc.set = nextShadowOneToOne.get(descriptor.set, nextGraphKey) as (value: unknown) => void;

      return wrappedDesc;
    },

    notifyAssertionFailed: function (targetGraphKey: string | symbol): void {
      throw new Error("Function not implemented.");
    }
  }

  /* This is really hard to do as an unit test, because correct use of InheritedPropertyTraps depends on
  getting the right values set on shaedow and next targets.
  */
  @InheritedPropertyTraps
  @UpdateShadowTarget
  @WrapReturnValues
  class MockProxyHandler extends ObjectGraphTailHandler {
    constructor(membrane: MembraneInternalIfc, thisGraphKey: string | symbol) {
      super(membrane, thisGraphKey);
      this.setThisGraphValues(graphValues);
    }
  }
  //#endregion setup

  beforeEach(() => {
    spyObjectGraphHandler = new MockProxyHandler(membraneMock, shadowGraphKey);

    // don't remove these id properties.  They will be useful in debugging to know which object is which.
    shadowTarget = {
      id: "shadowTarget"
    };
    nextTarget = {
      id: "nextTarget"
    };

    shadowProto = {
      id: "shadowProto"
    };
    nextProto = {
      id: "nextProto"
    };
    Reflect.setPrototypeOf(shadowTarget, shadowProto);
    Reflect.setPrototypeOf(nextTarget, nextProto);

    bindNextAndShadow(nextTarget, shadowTarget);
    bindNextAndShadow(nextProto, shadowProto);
    bindNextAndShadow(Object.prototype, {});
  });

  afterEach(() => nextShadowOneToOne.clear());

  describe(`when no matching property exists,`, () => {
    it(`"get" works`, () => {
      const fooValue: unknown = spyObjectGraphHandler.get(
        shadowTarget, "foo", shadowTarget, nextGraphKey, nextTarget, "foo", nextTarget
      );
      expect(fooValue).toBeUndefined();
    });

    it(`"has" works`, () => {
      const fooValue: boolean = spyObjectGraphHandler.has(
        shadowTarget, "foo", nextGraphKey, nextTarget, "foo"
      );
      expect(fooValue).toBeFalse();
    });

    it(`"set" works`, () => {
      shadowReceiver = shadowTarget;
      nextReceiver = nextTarget;
      bindNextAndShadow(nextReceiver, shadowReceiver);

      shadowFoo = {
        value: "bar",
        writable: true,
        enumerable: true,
        configurable: true,
      };
      nextFoo = {
        ...shadowFoo
      };

      const result: boolean = spyObjectGraphHandler.set(
        shadowTarget, "foo", shadowFoo.value, shadowReceiver, nextGraphKey,
        nextTarget, "foo", nextFoo.value, nextReceiver
      );

      expect(result).toBeTrue();

      expect(
        Reflect.getOwnPropertyDescriptor(shadowReceiver, "foo")
      ).withContext("shadowReceiver:foo").toEqual(shadowFoo);
      expect(
        Reflect.getOwnPropertyDescriptor(shadowProto, "foo")
      ).withContext("shadowProto:foo").toBeUndefined();

      expect(
        Reflect.getOwnPropertyDescriptor(nextReceiver, "foo")
      ).withContext("nextReceiver:foo").toEqual(nextFoo);
      expect(
        Reflect.getOwnPropertyDescriptor(nextProto, "foo")
      ).withContext("nextProto:foo").toBeUndefined();
    });
  });

  describe(`with a data descriptor:`, () => {
    beforeEach(() => {
      shadowFoo = {
        value: "bar",
        writable: true,
        enumerable: true,
        configurable: true
      };
      nextFoo = {
        ...shadowFoo,
      };

      bindNextAndShadow(nextFoo, shadowFoo);
    });

    describe(`"get" works`, () => {
      it(`for a local property`, () => {
        Reflect.defineProperty(nextTarget, "foo", nextFoo);

        const fooValue: unknown = spyObjectGraphHandler.get(
          shadowTarget, "foo", shadowTarget, nextGraphKey, nextTarget, "foo", nextTarget
        );
        expect(fooValue).toBe("bar");

        expect(
          Reflect.getOwnPropertyDescriptor(nextTarget, "foo")
        ).withContext("nextTarget:foo").toEqual(nextFoo);
        expect(
          Reflect.getOwnPropertyDescriptor(nextProto, "foo")
        ).withContext("nextProto:foo").toBeUndefined();

        expect(
          Reflect.getOwnPropertyDescriptor(shadowTarget, "foo")
        ).withContext("shadowTarget:foo").toEqual(shadowFoo);
        expect(
          Reflect.getOwnPropertyDescriptor(shadowProto, "foo")
        ).withContext("shadowProto:foo").toBeUndefined();
      });

      it(`for an inherited property`, () => {
        Reflect.defineProperty(nextProto, "foo", nextFoo);

        const fooValue: unknown = spyObjectGraphHandler.get(
          shadowTarget, "foo", shadowTarget, nextGraphKey, nextTarget, "foo", nextTarget
        );
        expect(fooValue).toBe("bar");

        expect(
          Reflect.getOwnPropertyDescriptor(nextTarget, "foo")
        ).withContext("nextTarget:foo").toBeUndefined();
        expect(
          Reflect.getOwnPropertyDescriptor(nextProto, "foo")
        ).withContext("nextProto:foo").toEqual(nextFoo);

        expect(
          Reflect.getOwnPropertyDescriptor(shadowTarget, "foo")
        ).withContext("shadowTarget:foo").toBeUndefined();
        expect(
          Reflect.getOwnPropertyDescriptor(shadowProto, "foo")
        ).withContext("shadowProto:foo").toEqual(shadowFoo);
      });

      it(`for a property with a subclass receiver`, () => {
        Reflect.defineProperty(nextProto, "foo", nextFoo);

        const fooValue: unknown = spyObjectGraphHandler.get(
          shadowProto, "foo", shadowTarget, nextGraphKey, nextProto, "foo", nextTarget
        );
        expect(fooValue).toBe("bar");

        expect(
          Reflect.getOwnPropertyDescriptor(nextTarget, "foo")
        ).withContext("nextTarget:foo").toBeUndefined();
        expect(
          Reflect.getOwnPropertyDescriptor(nextProto, "foo")
        ).withContext("nextProto:foo").toEqual(nextFoo);

        expect(
          Reflect.getOwnPropertyDescriptor(shadowTarget, "foo")
        ).withContext("shadowTarget:foo").toBeUndefined();
        expect(
          Reflect.getOwnPropertyDescriptor(shadowProto, "foo")
        ).withContext("shadowProto:foo").toEqual(shadowFoo);
      });
    });

    describe(`"has" works`, () => {
      it(`for a local property`, () => {
        Reflect.defineProperty(nextTarget, "foo", nextFoo);

        const fooValue: boolean = spyObjectGraphHandler.has(
          shadowTarget, "foo", nextGraphKey, nextTarget, "foo"
        );
        expect(fooValue).toBeTrue();

        expect(
          Reflect.getOwnPropertyDescriptor(nextTarget, "foo")
        ).withContext("nextTarget:foo").toEqual(nextFoo);
        expect(
          Reflect.getOwnPropertyDescriptor(nextProto, "foo")
        ).withContext("nextProto:foo").toBeUndefined();

        // descriptors don't come back the same from Reflect.
        expect(
          Reflect.getOwnPropertyDescriptor(shadowTarget, "foo")
        ).withContext("shadowTarget:foo").toEqual(shadowFoo);
        expect(
          Reflect.getOwnPropertyDescriptor(shadowProto, "foo")
        ).withContext("shadowProto:foo").toBeUndefined();
      });

      it(`for an inherited property`, () => {
        Reflect.defineProperty(nextProto, "foo", nextFoo);

        const fooValue: boolean = spyObjectGraphHandler.has(
          shadowTarget, "foo", nextGraphKey, nextTarget, "foo"
        );
        expect(fooValue).toBe(true);

        expect(
          Reflect.getOwnPropertyDescriptor(nextTarget, "foo")
        ).withContext("nextTarget:foo").toBeUndefined();
        expect(
          Reflect.getOwnPropertyDescriptor(nextProto, "foo")
        ).withContext("nextProto:foo").toEqual(nextFoo);

        expect(
          Reflect.getOwnPropertyDescriptor(shadowTarget, "foo")
        ).withContext("shadowTarget:foo").toBeUndefined();

        expect(
          Reflect.getOwnPropertyDescriptor(shadowProto, "foo")
        ).withContext("shadowProto:foo").toEqual(shadowFoo);
      });
    });

    describe(`"set" works`, () => {
      beforeEach(() => {
        shadowReceiver = shadowTarget;
        nextReceiver = nextTarget;
        bindNextAndShadow(nextReceiver, shadowReceiver);
      });

      it("for a local writable, configurable property", () => {
        const originalDesc = {
          value: "original",
          writable: true,
          enumerable: false,
          configurable: true
        };
        Reflect.defineProperty(nextTarget, "foo", originalDesc);

        const result: boolean = spyObjectGraphHandler.set(
          shadowTarget, "foo", shadowFoo.value, shadowReceiver, nextGraphKey,
          nextTarget, "foo", nextFoo.value, nextReceiver
        );

        expect(result).toBeTrue();

        expect(
          Reflect.getOwnPropertyDescriptor(shadowTarget, "foo")
        ).withContext("shadowTarget:foo").toEqual({
          value: shadowFoo.value,
          writable: true,
          enumerable: false,
          configurable: true,
        });
        expect(
          Reflect.getOwnPropertyDescriptor(shadowProto, "foo")
        ).withContext("shadowProto:foo").toBeUndefined();

        // https://262.ecma-international.org/#sec-ordinarysetwithowndescriptor step 2.d.iii
        expect(
          Reflect.getOwnPropertyDescriptor(nextTarget, "foo")
        ).withContext("nextTarget:foo").toEqual({
          value: nextFoo.value,
          writable: true,
          enumerable: false,
          configurable: true,
        });
        expect(
          Reflect.getOwnPropertyDescriptor(nextProto, "foo")
        ).withContext("nextProto:foo").toBeUndefined();
      });

      it("for a local non-writable, configurable property", () => {
        const originalDesc = {
          value: "original",
          writable: false,
          enumerable: true,
          configurable: true
        };
        Reflect.defineProperty(
          nextTarget, "foo", originalDesc
        );

        const result: boolean = spyObjectGraphHandler.set(
          shadowTarget, "foo", shadowFoo.value, shadowReceiver, nextGraphKey,
          nextTarget, "foo", nextFoo.value, nextReceiver
        );

        expect(result).toBeFalse();

        expect(
          Reflect.getOwnPropertyDescriptor(shadowTarget, "foo")
        ).withContext("shadowTarget:foo").toEqual(originalDesc);
        expect(
          Reflect.getOwnPropertyDescriptor(shadowProto, "foo")
        ).withContext("shadowProto:foo").toBeUndefined();

        expect(
          Reflect.getOwnPropertyDescriptor(nextTarget, "foo")
        ).withContext("nextTarget:foo").toEqual(originalDesc);
        expect(
          Reflect.getOwnPropertyDescriptor(nextProto, "foo")
        ).withContext("nextProto:foo").toBeUndefined();
      });

      it("for a local writable, non-configurable property", () => {
        const originalDesc = {
          value: "original",
          writable: true,
          enumerable: true,
          configurable: false
        };
        Reflect.defineProperty(nextTarget, "foo", originalDesc);

        const result: boolean = spyObjectGraphHandler.set(
          shadowTarget, "foo", shadowFoo.value, shadowReceiver, nextGraphKey,
          nextTarget, "foo", nextFoo.value, nextReceiver
        );

        expect(result).toBeTrue();

        expect(
          Reflect.getOwnPropertyDescriptor(shadowTarget, "foo")
        ).withContext("shadowTarget:foo").toEqual({
          value: shadowFoo.value,
          writable: true,
          enumerable: true,
          configurable: false,
        });
        expect(
          Reflect.getOwnPropertyDescriptor(shadowProto, "foo")
        ).withContext("shadowProto:foo").toBeUndefined();

        // https://262.ecma-international.org/#sec-ordinarysetwithowndescriptor step 2.d.iii
        expect(
          Reflect.getOwnPropertyDescriptor(nextTarget, "foo")
        ).withContext("nextTarget:foo").toEqual({
          value: nextFoo.value,
          writable: true,
          enumerable: true,
          configurable: false,
        });
        expect(
          Reflect.getOwnPropertyDescriptor(nextProto, "foo")
        ).withContext("nextProto:foo").toBeUndefined();
      });

      it("for a local non-writable, non-configurable property", () => {
        const originalDesc = {
          value: "original",
          writable: false,
          enumerable: true,
          configurable: false
        };
        Reflect.defineProperty(
          nextTarget, "foo", originalDesc
        );

        const result: boolean = spyObjectGraphHandler.set(
          shadowTarget, "foo", shadowFoo.value, shadowReceiver, nextGraphKey,
          nextTarget, "foo", nextFoo.value, nextReceiver
        );

        expect(result).toBeFalse();

        expect(
          Reflect.getOwnPropertyDescriptor(shadowTarget, "foo")
        ).withContext("shadowTarget:foo").toEqual(originalDesc);
        expect(
          Reflect.getOwnPropertyDescriptor(shadowProto, "foo")
        ).withContext("shadowProto:foo").toBeUndefined();

        expect(
          Reflect.getOwnPropertyDescriptor(nextTarget, "foo")
        ).withContext("nextTarget:foo").toEqual(originalDesc);
        expect(
          Reflect.getOwnPropertyDescriptor(nextProto, "foo")
        ).withContext("nextProto:foo").toBeUndefined();
      });

      it("for an inherited writable, configurable property", () => {
        const inheritedDesc: PropertyDescriptor = {
          value: "inherited",
          writable: true,
          enumerable: false,
          configurable: true,
        }
        Reflect.defineProperty(nextProto, "foo", inheritedDesc);

        const result: boolean = spyObjectGraphHandler.set(
          shadowProto, "foo", shadowFoo.value, shadowReceiver, nextGraphKey,
          nextProto, "foo", nextFoo.value, nextReceiver
        );

        expect(result).toBeTrue();

        expect(
          Reflect.getOwnPropertyDescriptor(shadowTarget, "foo")
        ).withContext("shadowTarget:foo").toEqual(shadowFoo);
        expect(
          Reflect.getOwnPropertyDescriptor(shadowProto, "foo")
        ).withContext("shadowProto:foo").toEqual(inheritedDesc);

        expect(
          Reflect.getOwnPropertyDescriptor(nextTarget, "foo")
        ).withContext("nextTarget:foo").toEqual(nextFoo);
        expect(
          Reflect.getOwnPropertyDescriptor(nextProto, "foo")
        ).withContext("nextProto:foo").toEqual(inheritedDesc);
      });

      /* We probably don't need the same tests for non-writable and/or non-configurable inherited properties.
         The ECMAScript specification's behavior after we get to the right target is the same.

         If you really want to write these tests, go ahead.  But this file is pretty big already.
      */
    });
  });

  describe("with an accessor descriptor", () => {
    let shadowValue: unknown = "bar";
    let nextValue: unknown = "bar";
    beforeEach(() => {
      shadowFoo = {
        get: function(): unknown {
          return shadowValue;
        },
        set: function(value: unknown): void {
          shadowValue = value;
        },
        enumerable: true,
        configurable: true,
      };

      nextFoo = {
        get: function(): unknown {
          return nextValue;
        },
        set: function(value: unknown) {
          nextValue = value;
        },
        enumerable: true,
        configurable: true,
      };

      bindNextAndShadow(nextFoo, shadowFoo);
      bindNextAndShadow(nextFoo.get!, shadowFoo.get!);
      bindNextAndShadow(nextFoo.set!, shadowFoo.set!);
    });

    describe(`"get" works`, () => {
      it("for a non-existent property", () => {
        const fooValue: unknown = spyObjectGraphHandler.get(
          shadowTarget, "foo", shadowTarget, nextGraphKey, nextTarget, "foo", nextTarget
        );
        expect(fooValue).toBeUndefined();
      });

      it(`for a local property`, () => {
        Reflect.defineProperty(nextTarget, "foo", nextFoo);

        const fooValue: unknown = spyObjectGraphHandler.get(
          shadowTarget, "foo", shadowTarget, nextGraphKey, nextTarget, "foo", nextTarget
        );
        expect(fooValue).toBe("bar");

        expect(
          Reflect.getOwnPropertyDescriptor(nextTarget, "foo")
        ).withContext("nextTarget:foo").toEqual(nextFoo);
        expect(
          Reflect.getOwnPropertyDescriptor(nextProto, "foo")
        ).withContext("nextProto:foo").toBeUndefined();

        expect(
          Reflect.getOwnPropertyDescriptor(shadowTarget, "foo")
        ).withContext("shadowTarget:foo").toEqual(shadowFoo);
        expect(
          Reflect.getOwnPropertyDescriptor(shadowProto, "foo")
        ).withContext("shadowProto:foo").toBeUndefined();
      });

      it(`for an inherited property`, () => {
        Reflect.defineProperty(nextProto, "foo", nextFoo);

        const fooValue: unknown = spyObjectGraphHandler.get(
          shadowTarget, "foo", shadowTarget, nextGraphKey, nextTarget, "foo", nextTarget
        );
        expect(fooValue).toBe("bar");

        expect(
          Reflect.getOwnPropertyDescriptor(nextTarget, "foo")
        ).withContext("nextTarget:foo").toBeUndefined();
        expect(
          Reflect.getOwnPropertyDescriptor(nextProto, "foo")
        ).withContext("nextProto:foo").toEqual(nextFoo);

        expect(
          Reflect.getOwnPropertyDescriptor(shadowTarget, "foo")
        ).withContext("shadowTarget:foo").toBeUndefined();
        expect(
          Reflect.getOwnPropertyDescriptor(shadowProto, "foo")
        ).withContext("shadowProto:foo").toEqual(shadowFoo);
      });

      it(`for a property with a subclass receiver`, () => {
        Reflect.defineProperty(nextProto, "foo", nextFoo);

        const fooValue: unknown = spyObjectGraphHandler.get(
          shadowProto, "foo", shadowTarget, nextGraphKey, nextProto, "foo", nextTarget
        );
        expect(fooValue).toBe("bar");

        expect(
          Reflect.getOwnPropertyDescriptor(nextTarget, "foo")
        ).withContext("nextTarget:foo").toBeUndefined();
        expect(
          Reflect.getOwnPropertyDescriptor(nextProto, "foo")
        ).withContext("nextProto:foo").toEqual(nextFoo);

        expect(
          Reflect.getOwnPropertyDescriptor(shadowTarget, "foo")
        ).withContext("shadowTarget:foo").toBeUndefined();
        expect(
          Reflect.getOwnPropertyDescriptor(shadowProto, "foo")
        ).withContext("shadowProto:foo").toEqual(shadowFoo);
      });
    });

    describe(`"has" works`, () => {
      it("for a non-existent property", () => {
        const fooValue: boolean = spyObjectGraphHandler.has(
          shadowTarget, "foo", nextGraphKey, nextTarget, "foo"
        );
        expect(fooValue).toBeFalse();
      });

      it(`for a local property`, () => {
        Reflect.defineProperty(nextTarget, "foo", nextFoo);

        const fooValue: boolean = spyObjectGraphHandler.has(
          shadowTarget, "foo", nextGraphKey, nextTarget, "foo"
        );
        expect(fooValue).toBeTrue();

        expect(
          Reflect.getOwnPropertyDescriptor(nextTarget, "foo")
        ).withContext("nextTarget:foo").toEqual(nextFoo);
        expect(
          Reflect.getOwnPropertyDescriptor(nextProto, "foo")
        ).withContext("nextProto:foo").toBeUndefined();

        // descriptors don't come back the same from Reflect.
        expect(
          Reflect.getOwnPropertyDescriptor(shadowTarget, "foo")
        ).withContext("shadowTarget:foo").toEqual(shadowFoo);
        expect(
          Reflect.getOwnPropertyDescriptor(shadowProto, "foo")
        ).withContext("shadowProto:foo").toBeUndefined();
      });

      it(`for an inherited property`, () => {
        Reflect.defineProperty(nextProto, "foo", nextFoo);

        const fooValue: boolean = spyObjectGraphHandler.has(
          shadowTarget, "foo", nextGraphKey, nextTarget, "foo"
        );
        expect(fooValue).toBe(true);

        expect(
          Reflect.getOwnPropertyDescriptor(nextTarget, "foo")
        ).withContext("nextTarget:foo").toBeUndefined();
        expect(
          Reflect.getOwnPropertyDescriptor(nextProto, "foo")
        ).withContext("nextProto:foo").toEqual(nextFoo);

        expect(
          Reflect.getOwnPropertyDescriptor(shadowTarget, "foo")
        ).withContext("shadowTarget:foo").toBeUndefined();

        expect(
          Reflect.getOwnPropertyDescriptor(shadowProto, "foo")
        ).withContext("shadowProto:foo").toEqual(shadowFoo);
      });
    });

    xdescribe(`"set" works when the accessor is`, () => {
      describe("configurable with a local", () => {
        beforeEach(() => {
          Reflect.defineProperty(nextTarget, "foo", nextFoo);
        })
        it("getter", () => {
          expect(false).toBeTrue();
        });

        it("setter", () => {
          expect(false).toBeTrue();
        });

        it("getter & setter", () => {
          expect(false).toBeTrue();
        });
      });

      describe("non-configurable with a local", () => {
        beforeEach(() => {
          nextFoo.configurable = false;
          shadowFoo.configurable = false;

          Reflect.defineProperty(nextTarget, "foo", nextFoo);
        });

        it("getter", () => {
          expect(false).toBeTrue();
        });

        it("setter", () => {
          expect(false).toBeTrue();
        });

        it("getter & setter", () => {
          expect(false).toBeTrue();
        });
      });
    });
  });
});
