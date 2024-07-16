import ObjectGraphHead from "#objectgraph_handlers/source/ObjectGraphHead.js";
import { MembraneIfc } from "#objectgraph_handlers/source/types/MembraneIfc.js";
import { RequiredProxyHandler } from "#objectgraph_handlers/source/types/RequiredProxyHandler.js";

import ObjectGraphTailHandler from "#objectgraph_handlers/source/generated/ObjectGraphTailHandler.js";
import { ObjectGraphHandlerIfc } from "#objectgraph_handlers/source/generated/types/ObjectGraphHandlerIfc.js";

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

  const head = new ObjectGraphHead(mockMembrane, graphHandler, "red");
  expect(head.objectGraphKey).toBe("red");

  const {
    shadowTarget: shadowObject,
    proxy: proxyObject
  } = head.createNewProxy({}, "blue");

  const {
    shadowTarget: shadowArray,
    proxy: proxyArray
  } = head.createNewProxy([], "blue");

  const {
    shadowTarget: shadowFunction,
    proxy: proxyFunction
  } = head.createNewProxy((): void => {}, "blue");

  expect(typeof shadowObject).toBe("object");
  expect(typeof proxyObject).toBe("object");
  expect(Array.isArray(shadowObject)).toBe(false);
  expect(Array.isArray(proxyObject)).toBe(false);

  expect(Array.isArray(shadowArray)).toBe(true);
  expect(Array.isArray(proxyArray)).toBe(true);

  expect(typeof shadowFunction).toBe("function");
  expect(typeof proxyFunction).toBe("function");

  const unknownKey = Symbol("unknown key");
  expect(Reflect.getOwnPropertyDescriptor(shadowObject, unknownKey)).toBeUndefined();
  expect(Reflect.getOwnPropertyDescriptor(proxyObject, unknownKey)).toBeUndefined();
  expect(Reflect.getOwnPropertyDescriptor(shadowArray, unknownKey)).toBeUndefined();
  expect(Reflect.getOwnPropertyDescriptor(proxyArray, unknownKey)).toBeUndefined();
  expect(Reflect.getOwnPropertyDescriptor(shadowFunction, unknownKey)).toBeUndefined();
  expect(Reflect.getOwnPropertyDescriptor(proxyFunction, unknownKey)).toBeUndefined();

  expect(head.isRevoked).toBe(false);

  head.revokeAllProxies();
  expect(head.isRevoked).toBe(true);

  expect(() => Reflect.getOwnPropertyDescriptor(proxyObject, unknownKey)).toThrowError();
  expect(() => Reflect.getOwnPropertyDescriptor(proxyArray, unknownKey)).toThrowError();
  expect(() => Reflect.getOwnPropertyDescriptor(proxyFunction, unknownKey)).toThrowError();

  expect(
    () => head.createNewProxy({}, "blue")
  ).toThrowError("This object graph has been revoked");

  expect(
    () => head.revokeAllProxies()
  ).toThrowError("This object graph has been revoked");
});
