import UpdateShadowTarget from "#objectgraph_handlers/source/decorators/updateShadowTarget.js";

import type {
  ObjectGraphHandlerIfc
} from "#objectgraph_handlers/source/generated/types/ObjectGraphHandlerIfc.js";

import ObjectGraphTailHandler from "#objectgraph_handlers/source/generated/ObjectGraphTailHandler.js";
import { DataDescriptor } from "#objectgraph_handlers/source/sharedUtilities.js";


describe("UpdateShadowTarget works", () => {
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

  describe("as a direct class decorator on the trap", () => {
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
        expect(Reflect.getOwnPropertyDescriptor(shadowTarget, "foo")?.value).toBe(undefined);
        expect(Reflect.getOwnPropertyDescriptor(shadowTarget, "bar")?.value).toBe(undefined);
      });

      it("with keys to remove on the next target", () => {
        Reflect.defineProperty(shadowTarget, "foo", new DataDescriptor("foo", true, true, true));
        Reflect.defineProperty(nextTarget, "bar", new DataDescriptor("bar", true, true, true));
        Reflect.defineProperty(nextTarget, "wop", new DataDescriptor("wop", true, true, true));

        const result = spyObjectGraphHandler.ownKeys(shadowTarget, nextGraphKey, nextTarget);
        expect(result).toEqual(["bar", "wop"]);

        expect(Reflect.ownKeys(shadowTarget)).toEqual(["bar", "wop"]);
        expect(Reflect.getOwnPropertyDescriptor(shadowTarget, "bar")?.value).toBe(undefined);
        expect(Reflect.getOwnPropertyDescriptor(shadowTarget, "wop")?.value).toBe(undefined);
      });
    });
  });
});
