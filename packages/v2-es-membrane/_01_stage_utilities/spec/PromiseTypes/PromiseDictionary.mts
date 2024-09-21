import { PromiseDictionary } from "#stage_utilities/source/PromiseTypes.mjs";

it("PromiseDictionary resolves", async () => {
  const THREE = Symbol("three");
  expect(await PromiseDictionary({
    "one": Promise.resolve(1),
    "two": Promise.resolve(2),
    [THREE]: Promise.resolve(3),
  })).toEqual({
    "one": 1,
    "two": 2,
    [THREE]: 3,
  });
});
