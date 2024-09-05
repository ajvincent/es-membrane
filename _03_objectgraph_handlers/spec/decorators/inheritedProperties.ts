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
import { DataDescriptor } from "#objectgraph_handlers/source/sharedUtilities.js";

describe("Inherited property traps", () => {
  //#region setup
  let spyObjectGraphHandler: ObjectGraphHandlerIfc;
  let shadowTarget: object, nextTarget: object, shadowProto: object, nextProto: object;
  let shadowReceiver: object, nextReceiver: object;
  let shadowFoo: PropertyDescriptor, nextFoo: PropertyDescriptor;
  const nextGraphKey = Symbol("next graph");

  const nextToShadowMap = new Map<object, object>;

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
        return nextToShadowMap.get(valueInSourceGraph);
      return valueInSourceGraph;
    },

    isRevoked: false,

    isKnownProxy: function (value: object): boolean {
      return value === shadowReceiver;
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
    spyObjectGraphHandler = new MockProxyHandler(
      jasmine.createSpyObj("membrane", ["convertArray", "convertDescriptors"]),
      "this graph"
    );

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

    nextToShadowMap.set(nextTarget, shadowTarget);
    nextToShadowMap.set(nextProto, shadowProto);
    nextToShadowMap.set(Object.prototype, {});
  });

  afterEach(() => nextToShadowMap.clear());

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

      nextToShadowMap.set(nextFoo, shadowFoo);
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

    describe(`"set" works`, () => {
      beforeEach(() => {
        shadowReceiver = shadowTarget;
        nextReceiver = nextTarget;
        nextToShadowMap.set(nextReceiver, shadowReceiver);
      });

      it("for a non-existent property", () => {
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

      it("for a local writable, configurable property", () => {
        Reflect.defineProperty(
          nextTarget, "foo", new DataDescriptor("incorrect", true, false, true)
        );

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

      xit("for a local non-writable, configurable property", () => {
        expect(false).toBeTrue();
      });

      xit("for a local writable, non-configurable property", () => {
        expect(false).toBeTrue();
      });

      xit("for a local non-writable, non-configurable property", () => {
        expect(false).toBeTrue();
      });

      // don't really know what this is going to do
      xit("for an inherited writable, configurable property", () => {
        const inheritedDesc: PropertyDescriptor = {
          value: "inherited",
          writable: true,
          enumerable: true,
          configurable: true,
        }
        Reflect.defineProperty(shadowProto, "foo", inheritedDesc);

        const result: boolean = spyObjectGraphHandler.set(
          shadowProto, "foo", shadowFoo, shadowTarget, nextGraphKey,
          nextProto, "foo", nextFoo, shadowTarget
        );

        expect(result).toBeTrue();

        expect(Reflect.getOwnPropertyDescriptor(shadowTarget, "foo")).toEqual(shadowFoo);
        expect(Reflect.getOwnPropertyDescriptor(shadowProto, "foo")).toEqual(inheritedDesc);

        expect(Reflect.getOwnPropertyDescriptor(nextTarget, "foo")).toEqual(nextFoo);
        expect(Reflect.getOwnPropertyDescriptor(nextProto, "foo")).toEqual(inheritedDesc);
      });

      /* We probably don't need the same tests for non-writable and/or non-configurable inherited properties.
         The ECMAScript specification's behavior after we get to the right target is the same.

         If you really want to write these tests, go ahead.
      */
    });
  });

  xdescribe("with an accessor descriptor", () => {
    it("not ready", () => {
      expect(true).toBeFalse();
    });
  });
});
