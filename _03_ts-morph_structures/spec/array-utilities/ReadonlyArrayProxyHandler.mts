import ReadonlyArrayProxyHandler from "#ts-morph_structures/source/array-utilities/ReadonlyArrayProxyHandler.mjs";
import { stringOrWriterFunction } from "#ts-morph_structures/source/types/ts-morph-native.mjs";

it("ReadonlyArrayProxyHandler builds proxies which appear read-only", () => {
  let array: stringOrWriterFunction[] = ["boolean", "string"];
  const handler = new ReadonlyArrayProxyHandler<string>("readonly");
  array = new Proxy(array, handler);

  expect(array[0]).toBe("boolean");
  expect(array[1]).toBe("string");
  expect(array.length).toBe(2);
  expect(Array.from(array.values())).toEqual(["boolean", "string"]);

  expect(() => {
    void(array.push)
  }).toThrowError("readonly");

  expect(array.slice()).toEqual(["boolean", "string"]);
});
