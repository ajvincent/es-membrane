import ObjectGraphHead from "#objectgraph_handlers/source/ObjectGraphHead.js";

import type {
  MembraneInternalIfc
} from "#objectgraph_handlers/source/types/MembraneInternalIfc.js";

import ObjectGraphTailHandler from "#objectgraph_handlers/source/generated/ObjectGraphTailHandler.js";

import type {
  ObjectGraphHandlerIfc
} from "#objectgraph_handlers/source/generated/types/ObjectGraphHandlerIfc.js";

import OneToOneStrongMap from "#stage_utilities/source/collections/OneToOneStrongMap.js";

import {
  AccessorDescriptor,
  DataDescriptor,
} from "#objectgraph_handlers/source/sharedUtilities.js";

import type {
  ObjectGraphValueCallbacksIfc
} from "#objectgraph_handlers/source/types/ObjectGraphHeadIfc.js";

describe("ObjectGraphHead", () => {
  const mockMembrane: MembraneInternalIfc = {
    convertArray: function <ValueTypes extends unknown[]>(targetGraphKey: string | symbol, values: ValueTypes): ValueTypes {
      return values.slice() as ValueTypes;
    },
    convertDescriptor: function (targetGraphKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor {
      throw new Error("Function not implemented.");
    },

    notifyAssertionFailed(targetGraphKey: string | symbol): void {
      throw new Error("Method not implemented.");
    },
  };

  let map: OneToOneStrongMap<string | symbol, object>;
  beforeEach(() => {
    map = new OneToOneStrongMap;
  });

  it("::getValueInGraph() maintains references to proxies or underlying values in the right graph", () => {
    const mockMembrane: MembraneInternalIfc = {
      convertArray: function <ValueTypes extends unknown[]>(targetGraphKey: string | symbol, values: ValueTypes): ValueTypes {
        return values.slice() as ValueTypes;
      },
      convertDescriptor: function (targetGraphKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor {
        throw new Error("Function not implemented.");
      },

      notifyAssertionFailed(targetGraphKey: string | symbol): void {
        throw new Error("Method not implemented.");
      },
    };

    const map = new OneToOneStrongMap<string | symbol, object>;
    const redTailHandler = new ObjectGraphTailHandler(mockMembrane, "red");
    const redHeadHandler = new ObjectGraphHead(mockMembrane, redTailHandler, map, "red");

    const blueTailHandler = new ObjectGraphTailHandler(mockMembrane, "blue");
    const blueHeadHandler = new ObjectGraphHead(mockMembrane, blueTailHandler, map, "blue");

    const redObject = {};
    const blueArray: unknown[] = [];

    expect<number>(redHeadHandler.getValueInGraph(3, "red")).toEqual(3);
    expect<number>(blueHeadHandler.getValueInGraph(4, "blue")).toEqual(4);

    expect<object>(redHeadHandler.getValueInGraph(redObject, "red")).toBe(redObject);
    expect<object>(blueHeadHandler.getValueInGraph(blueArray, "blue")).toBe(blueArray);
    expect(map.get(redObject, "red")).toBeUndefined();
    expect(map.get(blueArray, "blue")).toBeUndefined();
  
    const blueObject = blueHeadHandler.getValueInGraph(redObject, "red");
    expect(typeof blueObject).withContext("typeof blueObject").toBe("object");
    expect(blueObject).withContext("blueObject is not redObject").not.toBe(redObject);
  
    expect(map.get(redObject, "red")).withContext(`(redObject, "red", 1`).toBe(redObject);
    expect(map.get(redObject, "blue")).withContext(`(redObject, "blue", 1)`).toBe(blueObject);
    expect(map.get(blueObject, "red")).withContext(`(blueObject, "red", 1)`).toBe(redObject);
    expect(map.get(blueObject, "blue")).withContext(`(blueObject, "blue", 1)`).toBe(blueObject);
  
    // stability: we don't create objects twice
    expect(redHeadHandler.getValueInGraph(blueObject, "blue")).toBe(redObject);
    expect(blueHeadHandler.getValueInGraph(redObject, "red")).toBe(blueObject);
  
    const redArray = redHeadHandler.getValueInGraph(blueArray, "blue");
    expect(Array.isArray(redArray)).toBe(true);
    expect(redArray.length).toBe(0);
    expect(redArray).not.toBe(blueArray);
  
    expect(map.get(redObject, "red")).withContext(`(redObject, "red", 2)`).toBe(redObject);
    expect(map.get(redObject, "blue")).withContext(`(redObject, "blue", 2)`).toBe(blueObject);
    expect(map.get(blueObject, "red")).withContext(`(blueObject, "red", 2)`).toBe(redObject);
    expect(map.get(blueObject, "blue")).withContext(`(blueObject, "blue", 2)`).toBe(blueObject);
  
    expect(map.get(redArray, "red")).withContext(`(redArray, "red", 2)`).toBe(redArray);
    expect(map.get(redArray, "blue")).withContext(`(redArray, "blue", 2)`).toBe(blueArray);
    expect(map.get(blueArray, "red")).withContext(`(blueArray, "red", 2)`).toBe(redArray);
    expect(map.get(blueArray, "blue")).withContext(`(blueArray, "blue")`).toBe(blueArray);
  
    // Scalablity to multiple object graphs
    const greenTailHandler = new ObjectGraphTailHandler(mockMembrane, "green");
    const greenHeadHandler = new ObjectGraphHead(mockMembrane, greenTailHandler, map, "green");
  
    const greenObject = greenHeadHandler.getValueInGraph(blueObject, "blue");
    expect(map.get(greenObject, "red")).withContext(`(greenObject, "red", 3)`).toBe(redObject);
    expect(map.get(greenObject, "blue")).withContext(`(greenObject, "blue", 3)`).toBe(blueObject);
    expect(map.get(redObject, "green")).withContext(`(redObject, "green", 3)`).toBe(greenObject);
  
    // stability
    expect(redHeadHandler.getValueInGraph(greenObject, "green")).toBe(redObject);
    expect(blueHeadHandler.getValueInGraph(greenObject, "green")).toBe(blueObject);
  
    expect(redHeadHandler.getValueInGraph(blueObject, "blue")).toBe(redObject);
    expect(greenHeadHandler.getValueInGraph(blueObject, "blue")).toBe(greenObject);
  
    expect(blueHeadHandler.getValueInGraph(redObject, "red")).toBe(blueObject);
    expect(greenHeadHandler.getValueInGraph(redObject, "green")).toBe(greenObject);
  
    expect(redHeadHandler.getValueInGraph(redObject, "red")).withContext("red identity").toBe(redObject);
    expect(blueHeadHandler.getValueInGraph(blueObject, "blue")).withContext("blue identity").toBe(blueObject);
    expect(greenHeadHandler.getValueInGraph(greenObject, "green")).withContext("green identity").toBe(greenObject);
  
    // special case: proxy to a proxy
    const greenArray = greenHeadHandler.getValueInGraph(redArray, "red");
  
    expect(redHeadHandler.getValueInGraph(greenArray, "green")).toBe(redArray);
    expect(blueHeadHandler.getValueInGraph(greenArray, "green")).toBe(blueArray);
  
    expect(greenHeadHandler.getValueInGraph(redArray, "red")).toBe(greenArray);
    expect(greenHeadHandler.getValueInGraph(blueArray, "blue")).toBe(greenArray);
  });
  
  it("::revokeAllProxiesForGraph() actually revokes proxies", () => {
    const mockMembrane: MembraneInternalIfc = {
      convertArray: function <ValueTypes extends unknown[]>(targetGraphKey: string | symbol, values: ValueTypes): ValueTypes {
        return values.slice() as ValueTypes;
      },
      convertDescriptor: function (targetGraphKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor {
        throw new Error("Function not implemented.");
      },
      notifyAssertionFailed(targetGraphKey: string | symbol): void {
        throw new Error("Method not implemented.");
      },
    };
  
    const graphHandler: (
      ObjectGraphHandlerIfc & ObjectGraphValueCallbacksIfc
    ) = new ObjectGraphTailHandler(mockMembrane, "mock");
  
    const map = new OneToOneStrongMap<string | symbol, object>;
  
    const head = new ObjectGraphHead(mockMembrane, graphHandler, map, "red");
    expect(head.objectGraphKey).toBe("red");
  
    const proxyObject = head.getValueInGraph<object>({}, "blue") as object;
    const proxyArray = head.getValueInGraph<unknown[]>([], "green");
    const proxyFunction = head.getValueInGraph<() => void>((): void => {}, "blue");
  
    expect(typeof proxyObject).toBe("object");
    expect(Array.isArray(proxyObject)).toBe(false);
    expect(Array.isArray(proxyArray)).toBe(true);
  
    expect(typeof proxyFunction).toBe("function");
  
    const unknownKey = Symbol("unknown key");
    expect(Reflect.getOwnPropertyDescriptor(proxyObject, unknownKey)).toBeUndefined();
    expect(Reflect.getOwnPropertyDescriptor(proxyArray, unknownKey)).toBeUndefined();
    expect(Reflect.getOwnPropertyDescriptor(proxyFunction, unknownKey)).toBeUndefined();
  
    expect(head.isRevoked).toBe(false);
  
    head.revokeAllProxiesForGraph("blue");
    expect(head.isRevoked).toBe(false);
  
    expect(() => Reflect.getOwnPropertyDescriptor(proxyObject, unknownKey)).toThrowError();
    expect(() => Reflect.getOwnPropertyDescriptor(proxyArray, unknownKey)).not.toThrowError(); // "green"
    expect(() => Reflect.getOwnPropertyDescriptor(proxyFunction, unknownKey)).toThrowError();
  
    head.revokeAllProxiesForGraph(head.objectGraphKey);
    expect(head.isRevoked).toBe(true);
  
    expect(() => Reflect.getOwnPropertyDescriptor(proxyObject, unknownKey)).toThrowError();
    expect(() => Reflect.getOwnPropertyDescriptor(proxyArray, unknownKey)).toThrowError();
    expect(() => Reflect.getOwnPropertyDescriptor(proxyFunction, unknownKey)).toThrowError();
  
    expect(
      () => head.getValueInGraph({}, "blue")
    ).toThrowError("This object graph has been revoked");
  
    expect(
      () => head.revokeAllProxiesForGraph(head.objectGraphKey)
    ).toThrowError("This object graph has been revoked");
  });

  it("::getArrayInGraph() converts members of an array", () => {
    const redTailHandler = new ObjectGraphTailHandler(mockMembrane, "red");
    const redHeadHandler = new ObjectGraphHead(mockMembrane, redTailHandler, map, "red");

    const blueObject1 = {}, blueObject2 = {};
    const blueArray = [blueObject1, blueObject2];

    const redArray = redHeadHandler.getArrayInGraph<object[]>(blueArray, "blue");

    // this is testing whether we wrapped the arrays in the one-to-one map.
    expect(map.has(blueArray, "blue")).toBe(false);
    expect(map.has(redArray, "red")).toBe(false);

    const [redObject1, redObject2] = redArray;
    expect(map.get(blueObject1, "red")).toBe(redObject1);
    expect(map.get(blueObject2, "red")).toBe(redObject2);
  });

  it("::getDescriptorInGraph() converts property descriptors", () => {
    const redTailHandler = new ObjectGraphTailHandler(mockMembrane, "red");
    const redHeadHandler = new ObjectGraphHead(mockMembrane, redTailHandler, map, "red");

    const blueValue = { blueValue: true};
    const blueDataDesc = new DataDescriptor<object>(blueValue, true, false, true);

    const redDataDesc = redHeadHandler.getDescriptorInGraph(blueDataDesc, "blue");
    const { value: redValue } = redDataDesc!;
    expect(typeof redValue).toBe("object");
    expect(map.get(blueValue, "red")).toBe(redValue);
    expect(redDataDesc?.writable).toBeTrue();
    expect(redDataDesc?.enumerable).toBeFalse();
    expect(redDataDesc?.configurable).toBeTrue();
    expect(map.get(blueDataDesc, "red")).toBeUndefined();

    const blueGetter = () => blueValue;
    const blueSetter = (value: object) => {
      return;
    }

    const blueAccessorDesc = new AccessorDescriptor<object>(blueGetter, blueSetter, true, false);
    const redAccessorDesc = redHeadHandler.getDescriptorInGraph(blueAccessorDesc, "blue")!;
    const { get: redGetter, set: redSetter } = redAccessorDesc;
    expect(typeof redGetter).toBe("function");
    expect(typeof redSetter).toBe("function");

    expect(map.get(blueGetter, "red")).toBe(redGetter);
    expect(map.get(blueSetter, "red")).toBe(redSetter);
    expect(redAccessorDesc.enumerable).toBeTrue();
    expect(redAccessorDesc.configurable).toBeFalse();
  });

  /*
  ObjectGraphConversionIfc is not fairly testable: only ObjectGraphHead creates the shadow targets
  and the only strong reference to the shadow target is in a private slot of the proxy.

  Sure, we could attach a spy ObjectGraphTailHandler, and call the conversion API with the shadow
  target we get, but this would be _after_ the conversion API's were called internally.
  I'm not a big fan of ouroboros testing.
  */
});
