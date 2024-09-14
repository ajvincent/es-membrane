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

describe("Inherited property traps:", () => {
  //#region setup
  let spyObjectGraphHandler: ObjectGraphHandlerIfc;
  let shadowTarget: {
    id: unknown,
    accessorValue?: unknown
  }, nextTarget: {
    id: unknown,
    accessorValue?: unknown
  }, shadowProto: object, nextProto: object;
  let shadowReceiver: { accessorValue?: unknown }, nextReceiver: { accessorValue?: unknown };
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
      return values.map(value => {
        if (value === null)
          return null;
        if ((typeof value === "object") || (typeof value === "function"))
          return nextShadowOneToOne.get(value, targetGraphKey)
        return value;
      }) as ValueTypes;
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
  getting the right values set on shadow and next targets.
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
      id: "shadowTarget",
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
    beforeEach(() => {
      nextTarget.accessorValue = "not yet set";
      shadowTarget.accessorValue = undefined;
      shadowFoo = {
        get: function(): unknown {
          // @ts-expect-error
          return this.accessorValue;
        },
        set: function(value: unknown): void {
          // @ts-expect-error
          this.accessorValue = value;
        },
        enumerable: true,
        configurable: true,
      };

      nextFoo = {
        get: function(): unknown {
          // @ts-expect-error
          return this.accessorValue;
        },
        set: function(value: unknown) {
          // @ts-expect-error
          this.accessorValue = value;
        },
        enumerable: true,
        configurable: true,
      };

      bindNextAndShadow(nextFoo, shadowFoo);
      bindNextAndShadow(nextFoo.get!, shadowFoo.get!);
      bindNextAndShadow(nextFoo.set!, shadowFoo.set!);
    });

    describe(`"get" works`, () => {
      it(`for a local property`, () => {
        Reflect.defineProperty(nextTarget, "foo", nextFoo);

        const fooValue: unknown = spyObjectGraphHandler.get(
          shadowTarget, "foo", shadowTarget, nextGraphKey, nextTarget, "foo", nextTarget
        );
        expect(fooValue).toBe("not yet set");

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
        expect(fooValue).toBe("not yet set");

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
        expect(fooValue).toBe("not yet set");

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

    describe(`"set" works when the accessor is`, () => {
      beforeEach(() => {
        shadowReceiver = shadowTarget;
        nextReceiver = nextTarget;
        bindNextAndShadow(nextReceiver, shadowReceiver);
      });

      describe("configurable with a local", () => {
        it("getter", () => {
          nextFoo.set = undefined;
          shadowFoo.set = undefined;
          Reflect.defineProperty(nextTarget, "foo", nextFoo);

          const result: boolean = spyObjectGraphHandler.set(
            shadowTarget, "foo", "bar", shadowReceiver, nextGraphKey,
            nextTarget, "foo", "bar", nextReceiver
          );
          expect(result).toBe(false);
          expect(
            Reflect.getOwnPropertyDescriptor(shadowTarget, "foo")
          ).withContext("shadowTarget:foo").toEqual(shadowFoo);
          expect(
            Reflect.getOwnPropertyDescriptor(nextTarget, "foo")
          ).withContext("nextTarget:foo").toEqual(nextFoo);
        });

        it("setter", () => {
          nextFoo.get = undefined;
          shadowFoo.get = undefined;
          Reflect.defineProperty(nextTarget, "foo", nextFoo);

          const result: boolean = spyObjectGraphHandler.set(
            shadowTarget, "foo", "bar", shadowReceiver, nextGraphKey,
            nextTarget, "foo", "bar", nextReceiver
          );
          expect(result).toBe(true);
          /* The shadow receiver's accessorValue shouldn't be touched in this operation.  The proxy handler's
          operations on all shadow targets are _lazy_, meaning we only affect what we have to.  We trust the
          proxy handler's get() operation to update the accessorValue property.
          */
          expect(shadowReceiver.accessorValue).withContext("shadowReceiver:accessorValue").toBeUndefined();
          expect(nextReceiver.accessorValue).withContext("nextReceiver:accessorValue").toBe("bar");

          expect(
            Reflect.getOwnPropertyDescriptor(shadowTarget, "foo")
          ).withContext("shadowTarget:foo").toEqual(shadowFoo);
          expect(
            Reflect.getOwnPropertyDescriptor(nextTarget, "foo")
          ).withContext("nextTarget:foo").toEqual(nextFoo);

          // Then to prove the point above,
          expect(spyObjectGraphHandler.get(
            shadowReceiver, "accessorValue", shadowReceiver, nextGraphKey,
            nextReceiver, "accessorValue", nextReceiver
          )).toBe("bar");
          expect(
            Reflect.getOwnPropertyDescriptor(shadowReceiver, "accessorValue")
          ).withContext("shadowReceiver:accessorValue (2)").toEqual({
            value: "bar",
            enumerable: true,
            writable: true,
            configurable: true
          })
        });

        it("getter & setter", () => {
          // THis should behave just as it did without the getter.
          Reflect.defineProperty(nextTarget, "foo", nextFoo);

          const result: boolean = spyObjectGraphHandler.set(
            shadowTarget, "foo", "bar", shadowReceiver, nextGraphKey,
            nextTarget, "foo", "bar", nextReceiver
          );
          expect(result).toBe(true);
          expect(shadowReceiver.accessorValue).withContext("shadowReceiver:accessorValue").toBeUndefined();
          expect(nextReceiver.accessorValue).withContext("nextReceiver:accessorValue").toBe("bar");

          expect(
            Reflect.getOwnPropertyDescriptor(shadowTarget, "foo")
          ).withContext("shadowTarget:foo").toEqual(shadowFoo);
          expect(
            Reflect.getOwnPropertyDescriptor(nextTarget, "foo")
          ).withContext("nextTarget:foo").toEqual(nextFoo);

          expect(spyObjectGraphHandler.get(
            shadowReceiver, "accessorValue", shadowReceiver, nextGraphKey,
            nextReceiver, "accessorValue", nextReceiver
          )).toBe("bar");
          expect(
            Reflect.getOwnPropertyDescriptor(shadowReceiver, "accessorValue")
          ).withContext("shadowReceiver:accessorValue (2)").toEqual({
            value: "bar",
            enumerable: true,
            writable: true,
            configurable: true
          });
        });
      });

      describe("non-configurable with a local", () => {
        beforeEach(() => {
          nextFoo.configurable = false;
          shadowFoo.configurable = false;

          Reflect.defineProperty(nextTarget, "foo", nextFoo);
        });

        // The configurable: false setting shouldn't affect anything.
        xit("getter", () => {
          nextFoo.set = undefined;
          shadowFoo.set = undefined;
          Reflect.defineProperty(nextTarget, "foo", nextFoo);

          const result: boolean = spyObjectGraphHandler.set(
            shadowTarget, "foo", "bar", shadowReceiver, nextGraphKey,
            nextTarget, "foo", "bar", nextReceiver
          );
          expect(result).toBe(false);
          expect(
            Reflect.getOwnPropertyDescriptor(shadowTarget, "foo")
          ).withContext("shadowTarget:foo").toEqual(shadowFoo);
          expect(
            Reflect.getOwnPropertyDescriptor(nextTarget, "foo")
          ).withContext("nextTarget:foo").toEqual(nextFoo);
        });

        xit("setter", () => {
          nextFoo.get = undefined;
          shadowFoo.get = undefined;
          Reflect.defineProperty(nextTarget, "foo", nextFoo);

          const result: boolean = spyObjectGraphHandler.set(
            shadowTarget, "foo", "bar", shadowReceiver, nextGraphKey,
            nextTarget, "foo", "bar", nextReceiver
          );
          expect(result).toBe(true);
          // See the configurable: true test above.
          expect(shadowReceiver.accessorValue).withContext("shadowReceiver:accessorValue").toBeUndefined();
          expect(nextReceiver.accessorValue).withContext("nextReceiver:accessorValue").toBe("bar");

          expect(
            Reflect.getOwnPropertyDescriptor(shadowTarget, "foo")
          ).withContext("shadowTarget:foo").toEqual(shadowFoo);
          expect(
            Reflect.getOwnPropertyDescriptor(nextTarget, "foo")
          ).withContext("nextTarget:foo").toEqual(nextFoo);

          expect(spyObjectGraphHandler.get(
            shadowReceiver, "accessorValue", shadowReceiver, nextGraphKey,
            nextReceiver, "accessorValue", nextReceiver
          )).toBe("bar");
          expect(
            Reflect.getOwnPropertyDescriptor(shadowReceiver, "accessorValue")
          ).withContext("shadowReceiver:accessorValue (2)").toEqual({
            value: "bar",
            enumerable: true,
            writable: true,
            configurable: true
          })
        });

        it("getter & setter", () => {
          Reflect.defineProperty(nextTarget, "foo", nextFoo);

          const result: boolean = spyObjectGraphHandler.set(
            shadowTarget, "foo", "bar", shadowReceiver, nextGraphKey,
            nextTarget, "foo", "bar", nextReceiver
          );
          expect(result).toBe(true);
          expect(shadowReceiver.accessorValue).withContext("shadowReceiver:accessorValue").toBeUndefined();
          expect(nextReceiver.accessorValue).withContext("nextReceiver:accessorValue").toBe("bar");

          expect(
            Reflect.getOwnPropertyDescriptor(shadowTarget, "foo")
          ).withContext("shadowTarget:foo").toEqual(shadowFoo);
          expect(
            Reflect.getOwnPropertyDescriptor(nextTarget, "foo")
          ).withContext("nextTarget:foo").toEqual(nextFoo);

          expect(spyObjectGraphHandler.get(
            shadowReceiver, "accessorValue", shadowReceiver, nextGraphKey,
            nextReceiver, "accessorValue", nextReceiver
          )).toBe("bar");
          expect(
            Reflect.getOwnPropertyDescriptor(shadowReceiver, "accessorValue")
          ).withContext("shadowReceiver:accessorValue (2)").toEqual({
            value: "bar",
            enumerable: true,
            writable: true,
            configurable: true
          });
        });
      });
    });
  });
});
