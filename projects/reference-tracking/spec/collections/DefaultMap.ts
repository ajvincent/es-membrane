import {
  DefaultMap,
  DefaultWeakMap,
} from "../../source/collections/DefaultMap.js";

it("DefaultMap::getDefault() fills in values if they don't exist", () => {
  const map = new DefaultMap<object, unknown>;
  const key1 = {}, key2 = {}, builtValue = Symbol("builtValue");
  map.set(key1, "value1");

  const spy = jasmine.createSpy();
  spy.and.returnValue(builtValue);

  expect(map.getDefault(key1, spy)).toBe("value1");
  expect(spy).not.toHaveBeenCalled();

  expect(map.getDefault(key2, spy)).toBe(builtValue);
  expect(spy).toHaveBeenCalledOnceWith();
});

it("DefaultWeakMap::getDefault() fills in values if they don't exist", () => {
  const map = new DefaultWeakMap<object, unknown>;
  const key1 = {}, key2 = {}, builtValue = Symbol("builtValue");
  map.set(key1, "value1");

  const spy = jasmine.createSpy();
  spy.and.returnValue(builtValue);

  expect(map.getDefault(key1, spy)).toBe("value1");
  expect(spy).not.toHaveBeenCalled();

  expect(map.getDefault(key2, spy)).toBe(builtValue);
  expect(spy).toHaveBeenCalledOnceWith();
});
