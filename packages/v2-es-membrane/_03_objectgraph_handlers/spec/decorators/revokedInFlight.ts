import RevokedInFlight from "#objectgraph_handlers/source/generated/decorators/revokedInFlight.js";

import ObjectGraphTailHandler from "#objectgraph_handlers/source/generated/ObjectGraphTailHandler.js";

import type {
  ObjectGraphValuesIfc
} from "#objectgraph_handlers/source/types/ObjectGraphHeadIfc.js";

it("Revoked in-flight proxies throw the revocation error", () => {
  let spyObjectGraphHandler: ObjectGraphTailHandler;
  let shadowTarget: object, nextTarget: object;
  const nextGraphKey = Symbol("next graph");

  @RevokedInFlight
  class MockProxyHandler extends ObjectGraphTailHandler {
    // empty on purpose
  }

  spyObjectGraphHandler = new MockProxyHandler(
    jasmine.createSpyObj("membrane", ["convertArray", "convertDescriptors"], ["isRevoked"]),
    "this graph"
  );

  const mockGraphValues: ObjectGraphValuesIfc = {
    objectGraphKey: Symbol("this graph"),

    getArrayInGraph: function <Elements extends unknown[] = unknown[]>(valuesInSourceGraph: Elements, sourceGraphKey: string | symbol): Elements {
      throw fooError;
    },
    getDescriptorInGraph: function (descriptorInSourceGraph: PropertyDescriptor | undefined, sourceGraphKey: string | symbol): PropertyDescriptor | undefined {
      return undefined;
    },
    getValueInGraph: function (valueInSourceGraph: unknown, sourceGraphKey: string | symbol): unknown {
      return undefined;
    },
    get isRevoked() {
      return true;
    },
    isKnownProxy: function(value) {
      return false;
    }
  }
  spyObjectGraphHandler.setThisGraphValues(mockGraphValues);

  shadowTarget = () => {};

  const fooError = new Error("foo");
  nextTarget = () => {
    throw fooError;
  };

  expect(
    () => spyObjectGraphHandler.ownKeys(shadowTarget, nextGraphKey, nextTarget)
  ).toThrowError(`Cannot perform 'ownKeys' on a proxy that has been revoked`);

  expect(
    () => spyObjectGraphHandler.apply(shadowTarget, {}, [], nextGraphKey, nextTarget, {}, [])
  ).toThrowError(`Cannot perform 'apply' on a proxy that has been revoked`);
});
