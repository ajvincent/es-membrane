import RevokedInFlight from "#objectgraph_handlers/source/generated/decorators/revokedInFlight.js";

import ObjectGraphTailHandler from "#objectgraph_handlers/source/generated/ObjectGraphTailHandler.js";

import type {
  MembraneInternalIfc
} from "#objectgraph_handlers/source/types/MembraneInternalIfc.js";

import type {
  ObjectGraphValuesIfc
} from "#objectgraph_handlers/source/types/ObjectGraphHeadIfc.js";

it("Revoked in-flight proxies throw the revocation error", () => {
  const nextGraphKey = Symbol("next graph");

  @RevokedInFlight
  class MockProxyHandler extends ObjectGraphTailHandler {
    // empty on purpose
  }

  const spyObjectGraphHandler: ObjectGraphTailHandler = new MockProxyHandler(
    jasmine.createSpyObj<MembraneInternalIfc>("membrane", ["convertArray", "convertDescriptor"], []),
    "this graph"
  );

  // The crux of this test is the `isRevoked()` method returning true.

  const mockGraphValues: ObjectGraphValuesIfc = {
    objectGraphKey: Symbol("this graph"),

    getArrayInGraph: function <Elements extends unknown[] = unknown[]>(
      valuesInSourceGraph: Elements,
      sourceGraphKey: string | symbol
    ): Elements
    {
      void valuesInSourceGraph;
      void sourceGraphKey;
      throw fooError;
    },
    getDescriptorInGraph: function<T> (
      descriptorInSourceGraph: TypedPropertyDescriptor<T> | undefined,
      sourceGraphKey: string | symbol
    ): TypedPropertyDescriptor<T> | undefined
    {
      void descriptorInSourceGraph;
      void sourceGraphKey;
      return undefined;
    },
    getValueInGraph: function (
      valueInSourceGraph: unknown, sourceGraphKey: string | symbol
    ): unknown
    {
      void valueInSourceGraph;
      void sourceGraphKey;
      return undefined;
    },
    get isRevoked() {
      return true;
    },
    isKnownProxy: function(value) {
      void value;
      return false;
    }
  };
  spyObjectGraphHandler.setThisGraphValues(mockGraphValues);

  const shadowTarget: object = () => {};

  const fooError = new Error("foo");
  const nextTarget: object = () => {
    throw fooError;
  };

  expect(
    () => spyObjectGraphHandler.ownKeys(shadowTarget, nextGraphKey, nextTarget)
  ).toThrowError(`Cannot perform 'ownKeys' on a proxy that has been revoked`);

  expect(
    () => spyObjectGraphHandler.apply(shadowTarget, {}, [], nextGraphKey, nextTarget, {}, [])
  ).toThrowError(`Cannot perform 'apply' on a proxy that has been revoked`);
});
