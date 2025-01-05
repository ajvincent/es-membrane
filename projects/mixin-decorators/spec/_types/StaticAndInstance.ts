import type {
  StaticAndInstance,
  StaticAndInstanceArray,
} from "../../source/types/StaticAndInstance.js";

describe("StaticAndInstance", () => {
  const symbolKey1 = Symbol("symbol key 1");
  const symbolKey2 = Symbol("symbol key 2");
  const symbolKey3 = Symbol("symbol key 3");

  const first: StaticAndInstance<typeof symbolKey1> = {
    staticFields: {},
    instanceFields: {},
    symbolKey: symbolKey1
  };

  const second: StaticAndInstance<typeof symbolKey2> = {
    staticFields: {},
    instanceFields: {},
    symbolKey: symbolKey2
  };

  const third: StaticAndInstance<typeof symbolKey3> = {
    staticFields: {},
    instanceFields: {},
    symbolKey: symbolKey3
  };

  const firstAgain: StaticAndInstance<typeof symbolKey1> = {
    staticFields: {},
    instanceFields: {},
    symbolKey: symbolKey1
  };

  const secondAgain: StaticAndInstance<typeof symbolKey2> = {
    staticFields: {},
    instanceFields: {},
    symbolKey: symbolKey2
  };

  it("StaticAndInstance objects are unique", () => {
    const arrayOne: StaticAndInstanceArray<[typeof first, typeof second]> = [first, second];
    const arrayTwo: StaticAndInstanceArray<[typeof second, typeof first]> = [second, first];

    expect<StaticAndInstance<symbol>>(arrayOne).not.toEqual(arrayTwo);
  });

  it("StaticAndInstanceArray uses symbol keys to enforce the proper order", () => {
    // @ts-expect-error elements in the wrong order result in a failure.
    const arrayTwo: StaticAndInstanceArray<[typeof second, typeof first]> = [first, second];

    expect<StaticAndInstance<symbol>>(arrayTwo).toBeTruthy();
  });

  it("StaticAndInstanceArray types only allow unique symbol keys", () => {
    {
      // @ts-expect-error you can't have the same symbol key twice
      const invalidArray: StaticAndInstanceArray<[
        typeof first, typeof firstAgain
      ]> = [first, firstAgain];
      void(invalidArray);
    }
  
    {
      // @ts-expect-error you can't have the same symbol key twice
      const invalidArray: StaticAndInstanceArray<[
        typeof first, typeof second, typeof firstAgain
      ]> = [first, second, firstAgain];
      void(invalidArray);
    }
  
    {
      // @ts-expect-error you can't have the same symbol key twice
      const invalidArray: StaticAndInstanceArray<[
        typeof first, typeof second, typeof secondAgain
      ]> = [first, second, secondAgain];
      void(invalidArray);
    }
  
    {
      const validArray: StaticAndInstanceArray<[
        typeof first, typeof second, typeof third
      ]> = [first, second, third];
      expect(validArray.length).toBe(3);
    }
  });
});
