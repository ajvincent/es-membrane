import ReadonlyArrayProxyHandler from "#stage_one/prototype-snapshot/array-utilities/ReadonlyArrayProxyHandler.js";
import type {
  stringOrWriterFunction
} from "#stage_one/prototype-snapshot/types/ts-morph-native.js";

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

  expect(() => {
    array[2] = "foo";
  }).toThrowError("readonly");

  expect(array.slice()).toEqual(["boolean", "string"]);
});
