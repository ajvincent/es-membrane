import {
  CompositeWeakKey,
  CompositeWeakMap,
} from "../../../source/core/utilities/CompositeKeyMaps.mjs";

const value0 = {}, value1 = {}, value2 = {}, value3 = {};

describe("CompositeWeakKey", () => {
  it("class is frozen", () => {
    expect(Object.isFrozen(CompositeWeakKey)).toBe(true);
    expect(Object.isFrozen(CompositeWeakKey.prototype)).toBe(true);
  });

  it("instances are frozen weak sets", () => {
    const hash = "hashvalue1+hashvalue2";
    const key = new CompositeWeakKey([value1, value2], hash);
    expect(Object.isFrozen(key)).toBe(true);
    expect(key instanceof WeakSet).toBe(true);
    expect(key.has(value1)).toBe(true);
    expect(key.has(value2)).toBe(true);

    expect(key.add(value0)).toBe(false);
    expect(key.add(value1)).toBe(false);
    expect(key.add(value2)).toBe(false);
    expect(key.add(value3)).toBe(false);
    expect(key.has(value1)).toBe(true);
    expect(key.has(value2)).toBe(true);

    expect(key.delete(value0)).toBe(false);
    expect(key.delete(value1)).toBe(false);
    expect(key.delete(value2)).toBe(false);
    expect(key.delete(value3)).toBe(false);
    expect(key.has(value1)).toBe(true);
    expect(key.has(value2)).toBe(true);

    expect(key.hash).toBe(hash);
  });
});

describe("CompositeWeakMap", () => {
  let hasher;
  afterEach(() => hasher = null);

  describe("constructor", () => {
    it("accepts any number of string arguments", () => {
      const args = [];
      for (let i = 0; i < 10; i++)
        args.push("part_0" + i);
      for (let i = 10; i < 20; i++)
        args.push("part_" + i);
      expect(() => {
        hasher = new CompositeWeakMap(...args);
      }).not.toThrow();
    });

    it("throws if the number of keys at initialization is too low", () => {
      expect(() => {
        hasher = new CompositeWeakMap();
      }).toThrowError("weakDictionary must have at least two string keys, and no symbol keys!");

      expect(() => {
        hasher = new CompositeWeakMap("part1");
      }).toThrowError("weakDictionary must have at least two string keys, and no symbol keys!");
    });

    it("throws if there is a symbol key in the sequence", () => {
      expect(() => {
        hasher = new CompositeWeakMap(Symbol("part1"), "part2", "part3");
      }).toThrow();
    });

    it("throws if there is a non-primitive key in the sequence", () => {
      expect(() => {
        hasher = new CompositeWeakMap("part2", {}, "part3");
      }).toThrowError("weakDictionary must have at least two string keys, and no symbol keys!");
    });

    it("throws if there is a duplicate key in the sequence", () => {
      expect(() => {
        hasher = new CompositeWeakMap("part2", "part2", "part3");
      }).toThrowError("duplicate keys found!");
    });

    it("is not extensible", () => {
      hasher = new CompositeWeakMap("part1", "part2");
      expect(Reflect.isExtensible(hasher)).toBe(false);
    });
  });

  describe(".buildHash()", () => {
    beforeEach(() => hasher = new CompositeWeakMap("part1", "part2"));
    it("builds a hash for each unique dictionary", () => {
      const key1 = {
        part1: value0,
        part2: value1,
      };

      const hash1 = hasher.buildHash(key1);
      expect(typeof hash1).toBe("string");
      expect(hasher.buildHash(key1)).toBe(hash1);
      expect(hasher.buildHash({
        part1: value0,
        part2: value1,
      })).toBe(hash1);

      expect(hasher.buildHash({
        part2: value1,
        part1: value0,
      })).toBe(hash1);

      const key2 = {
        part1: value0,
        part2: value2,
      };

      const hash2 = hasher.buildHash(key2);
      expect(typeof hash2).toBe("string");
      expect(hash2).not.toBe(hash1);
      expect(hasher.buildHash(key2)).toBe(hash2);
      expect(hasher.buildHash({
        part1: value0,
        part2: value2,
      })).toBe(hash2);

      expect(hasher.buildHash({
        part1: value0,
        part2: value1,
      })).toBe(hash1);

      const key3 = {
        part1: value3,
        part2: value1,
      };

      const hash3 = hasher.buildHash(key3);
      expect(typeof hash3).toBe("string");
      expect(hash3).not.toBe(hash2);
      expect(hash3).not.toBe(hash1);
      expect(hasher.buildHash(key3)).toBe(hash3);
      expect(hasher.buildHash({
        part1: value3,
        part2: value1,
      })).toBe(hash3);

      expect(hasher.buildHash({
        part1: value0,
        part2: value2,
      })).toBe(hash2);

      expect(hasher.buildHash({
        part1: value0,
        part2: value1,
      })).toBe(hash1);
    });

    it("throws if any value in the key is a primitive", () => {
      expect(() => {
        hasher.buildHash({
          part1: value0,
          part2: Symbol("foo"),
        });
      }).toThrow();
    });

    it("throws for an unknown key", () => {
      expect(() => {
        hasher.buildHash({
          part1: value0,
          part3: value1,
        });
      }).toThrowError("Unknown key: part3");
    });

    it("throws for a missing key", () => {
      expect(() => {
        hasher.buildHash({
          part1: value0,
        });
      }).toThrowError("Wrong number of keys!");
    });

    it("throws for an extra key", () => {
      expect(() => {
        hasher.buildHash({
          part1: value0,
          part2: value1,
          part3: value2,
        });
      }).toThrowError("Wrong number of keys!");
    });
  });

  describe(".getKey()", () => {
    beforeEach(() => hasher = new CompositeWeakMap("part1", "part2"));
    it("returns undefined for an unknown key when the second argument is not passed in as true", () => {
      expect(hasher.getKey({
        part1: value0,
        part2: value1,
      })).toBe(undefined);
    });

    it("builds a hash for each unique dictionary", () => {
      hasher = new CompositeWeakMap("part1", "part2");
      const key1 = {
        part1: value0,
        part2: value1,
      };

      const composite1 = hasher.getKey(key1, true);
      expect(composite1 instanceof CompositeWeakKey).toBe(true);
      expect(composite1.hash).toBe(hasher.buildHash(key1));
      expect(hasher.getKey(key1)).toBe(composite1);
      expect(hasher.getKey({
        part1: value0,
        part2: value1,
      })).toBe(composite1);

      const key2 = {
        part1: value0,
        part2: value2,
      };

      const composite2 = hasher.getKey(key2, true);
      expect(composite2 instanceof CompositeWeakKey).toBe(true);
      expect(composite2.hash).toBe(hasher.buildHash(key2));
      expect(composite2 === composite1).toBe(false);

      const key3 = {
        part1: value3,
        part2: value1,
      };

      const hash3 = hasher.buildHash(key3);
      expect(hasher.getKey(key3)).toBe(undefined);

      const composite3 = hasher.getKey(key3, true);
      expect(composite3 instanceof CompositeWeakKey).toBe(true);
      expect(composite3.hash).toBe(hash3);
      expect(hasher.getKey(key3)).toBe(composite3);
    });

    it("throws if any value in the key is a primitive", () => {
      hasher = new CompositeWeakMap("part1", "part2");
      expect(() => {
        hasher.getKey({
          part1: value0,
          part2: Symbol("foo"),
        });
      }).toThrow();

      expect(() => {
        hasher.getKey({
          part1: value0,
          part2: Symbol("foo"),
        }, true);
      }).toThrow();
    });

    it("throws for an unknown key", () => {
      hasher = new CompositeWeakMap("part1", "part2");
      expect(() => {
        hasher.getKey({
          part1: value0,
          part3: value1,
        });
      }).toThrowError("Unknown key: part3");

      expect(() => {
        hasher.getKey({
          part1: value0,
          part3: value1,
        }, true);
      }).toThrowError("Unknown key: part3");
    });

    it("throws for a missing key", () => {
      hasher = new CompositeWeakMap("part1", "part2");
      expect(() => {
        hasher.getKey({
          part1: value0,
        });
      }).toThrowError("Wrong number of keys!");

      expect(() => {
        hasher.getKey({
          part1: value0,
        }, true);
      },).toThrowError("Wrong number of keys!");
    });

    it("throws for an extra key", () => {
      hasher = new CompositeWeakMap("part1", "part2");
      expect(() => {
        hasher.getKey({
          part1: value0,
          part2: value1,
          part3: value2,
        });
      }).toThrowError("Wrong number of keys!");

      expect(() => {
        hasher.getKey({
          part1: value0,
          part2: value1,
          part3: value2,
        }, true);
      }).toThrowError("Wrong number of keys!");
    });
  });
});
