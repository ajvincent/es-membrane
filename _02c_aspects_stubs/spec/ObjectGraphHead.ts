import ObjectGraphHead from "../source/ObjectGraphHead.js";

it("ObjectGraphHead creates revocable proxies", () => {
  const head = new ObjectGraphHead("red");
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
