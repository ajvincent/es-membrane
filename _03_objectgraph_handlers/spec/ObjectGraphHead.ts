import ObjectGraphHead from "#objectgraph_handlers/source/ObjectGraphHead.js";

import type {
  MembraneIfc
} from "#objectgraph_handlers/source/types/MembraneIfc.js";

import type {
  RequiredProxyHandler
} from "#objectgraph_handlers/source/types/RequiredProxyHandler.js";

import ObjectGraphTailHandler from "#objectgraph_handlers/source/generated/ObjectGraphTailHandler.js";

import type {
  ObjectGraphHandlerIfc
} from "#objectgraph_handlers/source/generated/types/ObjectGraphHandlerIfc.js";

import OneToOneStrongMap from "#objectgraph_handlers/source/maps/OneToOneStrongMap.js";

it("ObjectGraphHead creates revocable proxies", () => {
  const mockMembrane: MembraneIfc = {
    convertArray: function <ValueTypes extends unknown[]>(targetGraphKey: string | symbol, values: ValueTypes): ValueTypes {
      return values.slice() as ValueTypes;
    },
    convertDescriptor: function (targetGraphKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor {
      throw new Error("Function not implemented.");
    },
    getHandlerForTarget: function (targetGraphKey: string | symbol, target: object): RequiredProxyHandler {
      return Reflect;
    }
  };

  const graphHandler: ObjectGraphHandlerIfc = new ObjectGraphTailHandler;

  const map = new OneToOneStrongMap<string | symbol, object>;

  const head = new ObjectGraphHead(mockMembrane, graphHandler, map, "red");
  expect(head.objectGraphKey).toBe("red");

  const proxyObject = head.getValueInGraph<object>({}, "blue") as object;
  const proxyArray = head.getValueInGraph<unknown[]>([], "blue");
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

  head.revokeAllProxies();
  expect(head.isRevoked).toBe(true);

  expect(() => Reflect.getOwnPropertyDescriptor(proxyObject, unknownKey)).toThrowError();
  expect(() => Reflect.getOwnPropertyDescriptor(proxyArray, unknownKey)).toThrowError();
  expect(() => Reflect.getOwnPropertyDescriptor(proxyFunction, unknownKey)).toThrowError();

  expect(
    () => head.getValueInGraph({}, "blue")
  ).toThrowError("This object graph has been revoked");

  expect(
    () => head.revokeAllProxies()
  ).toThrowError("This object graph has been revoked");
});
