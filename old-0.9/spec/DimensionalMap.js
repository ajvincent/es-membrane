if (typeof DimensionalMap !== "function") {
  if (typeof require == "function") {
    var { DimensionalMap } = require("../docs/dist/node/DimensionalMap.js");
  }
}

if (typeof DimensionalMap !== "function") {
  throw new Error("Unable to run tests");
}

describe("DimensionalMap: ", function() {
"use strict";

function buildDimensionalMap(obj) {
  const rv = new Map();
  Reflect.ownKeys(obj).forEach((key) => rv.set(key, obj[key]));
  return rv;
}

function buildDimensionalMapTests(keyBase, objectKeys, strongKeys = []) {
  const summary = 
    `DimensionalMap(${JSON.stringify(objectKeys)}, ` +
                   `${JSON.stringify(strongKeys)}) works with string subkey names:`;
  describe(summary, function() {
    let map, key, key2;
    beforeEach(function() {
      map = new DimensionalMap(objectKeys, strongKeys);
      if ((keyBase instanceof Map) || (keyBase instanceof WeakMap)) {
        key = new Map(keyBase);
        key2 = new Map(keyBase);
      }
      else {
        key = JSON.parse(JSON.stringify(keyBase));
        key2 = {};
        Reflect.ownKeys(key).forEach(function(keyName) {
          key2[keyName] = key[keyName];
        });
      }
    });

    it("map.has({part1: {}}) returns false", function() {
      expect(map.has(key)).toBe(false);
    });
    it("map.delete({part1: {}}) returns false", function() {
      expect(map.delete(key)).toBe(false);
    });
    it("map.get({part1: {}}) returns undefined", function() {
      expect(map.get(key)).toBe(undefined);
    });

    it("map.set({part1: {}}) returns the map and sets the key", function() {
      ["foo", {}].forEach(function(value) {
        expect(map.set(key, value)).toBe(map);
        expect(map.has(key)).toBe(true);
        expect(map.get(key)).toBe(value);
        expect(map.has(key2)).toBe(true);
        expect(map.get(key2)).toBe(value);
      });
    });

    if (objectKeys.length !== 0) {
      it("map.has({}) throws for missing key part", function() {
        expect(function() {
          map.has({});
        }).toThrow();
      });

      it("map.get({}) throws for missing key part", function() {
        expect(function() {
          map.get({});
        }).toThrow();
      });

      it("map.delete({}) throws for missing key part", function() {
        expect(function() {
          map.delete({});
        }).toThrow();
      });

      it("map.set({part1: ''}) throws for missing key part", function() {
        expect(function() {
          map.set({part1: ''}, "foo");
        }).toThrow();
      });

      it("map.has({part1: ''}) throws for missing key part", function() {
        expect(function() {
          map.has({part1: ''});
        }).toThrow();
      });

      it("map.get({part1: ''}) throws for missing key part", function() {
        expect(function() {
          map.get({part1: ''});
        }).toThrow();
      });

      it("map.delete({part1: ''}) throws for missing key part", function() {
        expect(function() {
          map.delete({part1: ''});
        }).toThrow();
      });

      it("map.set({part1: ''}) throws for missing key part", function() {
        expect(function() {
          map.set({part1: ''}, "foo");
        }).toThrow();
      });
    }
    else {
      it("map.has({}) does not throw for missing key part", function() {
        expect(function() {
          map.has({});
        }).not.toThrow();
      });

      it("map.get({}) does not throw for missing key part", function() {
        expect(function() {
          map.get({});
        }).not.toThrow();
      });

      it("map.delete({}) does not throw for missing key part", function() {
        expect(function() {
          map.delete({});
        }).not.toThrow();
      });

      it("map.set({}) does not throw for missing key part", function() {
        expect(function() {
          map.set({}, "foo");
        }).not.toThrow();
      });
    }

    ["foo", {}].forEach(function(value) {
      describe("for " + value + ", map.set accepts multiple keys", function() {
        const alt = {
          part1: {},
          part2: {},
          part3: {},
          part4: {},
        };
        const altValue = {};
        it("in a straight test", function() {
          expect(map.set(alt, altValue)).toBe(map);
          expect(map.set(key, value)).toBe(map);
          expect(map.get(alt)).toBe(altValue);
          expect(map.has(key)).toBe(true);
          expect(map.get(alt)).toBe(altValue);
          expect(map.get(key)).toBe(value);
          expect(map.get(alt)).toBe(altValue);
          expect(map.has(key2)).toBe(true);
          expect(map.get(alt)).toBe(altValue);
          expect(map.get(key2)).toBe(value);
          expect(map.get(alt)).toBe(altValue);
  
          expect(map.delete(alt)).toBe(true);
          expect(map.has(alt)).toBe(false);
          expect(map.get(alt)).toBe(undefined);
  
          expect(map.has(key)).toBe(true);
          expect(map.get(key)).toBe(value);
          expect(map.has(key2)).toBe(true);
          expect(map.get(key2)).toBe(value);
        });

        if (!(keyBase instanceof Map) && !(keyBase instanceof WeakMap)) {
          Reflect.ownKeys(alt).forEach(function(subkey, index) {
            it("with matching subkey at index " + index, function() {
              let oldPart = alt[subkey];
              alt[subkey] = key[subkey];
              expect(map.has(alt)).toBe(false);
              expect(map.get(alt)).toBe(undefined);
              expect(map.delete(alt)).toBe(false);
              expect(map.set(alt, altValue)).toBe(map);
              expect(map.has(alt)).toBe(true);
              expect(map.get(alt)).toBe(altValue);
              expect(map.delete(alt)).toBe(true);
              expect(map.has(alt)).toBe(false);
              expect(map.get(alt)).toBe(undefined);
              expect(map.delete(alt)).toBe(false);
              alt[subkey] = oldPart;
            });
          });
        }
      });
    });
  });
}

describe("Using vanilla objects for the keys, ", function() {
  buildDimensionalMapTests({part1: {}}, ["part1"]);
  buildDimensionalMapTests({part1: {}, part2: {}}, ["part1", "part2"]);
  buildDimensionalMapTests({part1: {}}, [], ["part1"]);
  buildDimensionalMapTests({part1: "red"}, [], ["part1"]);
  buildDimensionalMapTests({part1: {}, part2: {}}, [], ["part1", "part2"]);
  buildDimensionalMapTests({part1: "green", part2: "blue"}, [], ["part1", "part2"]);
  buildDimensionalMapTests({part1: {}, part2: {}}, ["part1"], ["part2"]);
  buildDimensionalMapTests({part1: {}, part2: "purple"}, ["part1"], ["part2"]);
  buildDimensionalMapTests(
    {part1: {}, part2: {}, part3: {}, part4: {}},
    ["part1", "part2"],
    ["part3", "part4"]
  );
  buildDimensionalMapTests(
    {part1: {}, part2: {}, part3: "orange", part4: {}},
    ["part1", "part2"],
    ["part3", "part4"]
  );
  buildDimensionalMapTests(
    {part1: {}, part2: {}, part3: "yellow", part4: "cyan"},
    ["part1", "part2"],
    ["part3", "part4"]
  );

  it("with symbol subkeys", function() {
    const s1 = Symbol(), s2 = Symbol(), s3 = Symbol(), s4 = Symbol();
    const key0 = {};
    key0[s1] = {};
    key0[s2] = {};
    key0[s3] = {};
    key0[s4] = {};

    const value = {value: true};
    const map = new DimensionalMap([s1, s2], [s3, s4]);
    map.set(key0, value);
    expect(map.has(key0)).toBe(true);
    expect(map.get(key0)).toBe(value);

    const key1 = {}, key2 = new Map();
    Reflect.ownKeys(key0).forEach((symbol) => {
      key1[symbol] = key0[symbol];
      key2.set(symbol, key0[symbol]);
    });

    expect(map.has(key1)).toBe(true);
    expect(map.get(key1)).toBe(value);

    expect(map.has(key2)).toBe(true);
    expect(map.get(key2)).toBe(value);
  });
});

describe("Using Map objects for the keys, ", function() {
  buildDimensionalMapTests(
    buildDimensionalMap({part1: {}}), ["part1"]
  );
  buildDimensionalMapTests(
    buildDimensionalMap({part1: {}, part2: {}}), ["part1", "part2"]
  );
  buildDimensionalMapTests(
    buildDimensionalMap({part1: {}}), [], ["part1"]
  );
  buildDimensionalMapTests(
    buildDimensionalMap({part1: "red"}), [], ["part1"]
  );
  buildDimensionalMapTests(
    buildDimensionalMap({part1: {}, part2: {}}), [], ["part1", "part2"]
  );
  buildDimensionalMapTests(
    buildDimensionalMap({part1: "green", part2: "blue"}), [], ["part1", "part2"]
  );
  buildDimensionalMapTests(
    buildDimensionalMap({part1: {}, part2: {}}), ["part1"], ["part2"]
  );
  buildDimensionalMapTests(
    buildDimensionalMap({part1: {}, part2: "purple"}), ["part1"], ["part2"]
  );
  buildDimensionalMapTests(
    buildDimensionalMap({part1: {}, part2: {}, part3: {}, part4: {}}),
    ["part1", "part2"],
    ["part3", "part4"]
  );
  buildDimensionalMapTests(
    buildDimensionalMap({part1: {}, part2: {}, part3: "orange", part4: {}}),
    ["part1", "part2"],
    ["part3", "part4"]
  );
  buildDimensionalMapTests(
    buildDimensionalMap({part1: {}, part2: {}, part3: "yellow", part4: "cyan"}),
    ["part1", "part2"],
    ["part3", "part4"]
  );

  it("with symbol subkeys", function() {
    const s1 = Symbol(), s2 = Symbol(), s3 = Symbol(), s4 = Symbol();
    const key0 = {};
    key0[s1] = {};
    key0[s2] = {};
    key0[s3] = {};
    key0[s4] = {};

    const value = {value: true};
    const map = new DimensionalMap([s1, s2], [s3, s4]);
    map.set(key0, value);
    expect(map.has(key0)).toBe(true);
    expect(map.get(key0)).toBe(value);

    const keyAsObject = {}, keyAsMap = new Map();
    Reflect.ownKeys(key0).forEach((symbol) => {
      keyAsObject[symbol] = key0[symbol];
      keyAsMap.set(symbol, key0[symbol]);
    });

    expect(map.has(keyAsObject)).toBe(true);
    expect(map.get(keyAsObject)).toBe(value);

    expect(map.has(keyAsMap)).toBe(true);
    expect(map.get(keyAsMap)).toBe(value);
  });


  it("with object subkeys", function() {
    const s1 = {}, s2 = {}, s3 = {}, s4 = {};
    const key0 = new Map();
    key0.set(s1, {});
    key0.set(s2, {});
    key0.set(s3, {});
    key0.set(s4, {});

    const value = {value: true};
    const map = new DimensionalMap([s1, s2], [s3, s4]);
    map.set(key0, value);
    expect(map.has(key0)).toBe(true);
    expect(map.get(key0)).toBe(value);

    const keyAsMap = new Map(), keyAsWeak = new Map();
    key0.forEach((keyPart, subkey) => {
      keyAsMap.set(subkey, keyPart);
      keyAsWeak.set(subkey, keyPart);
    });

    expect(map.has(keyAsMap)).toBe(true);
    expect(map.get(keyAsMap)).toBe(value);

    expect(map.has(keyAsWeak)).toBe(true);
    expect(map.get(keyAsWeak)).toBe(value);
  });
});

describe("Using WeakMap objects for the keys, ", function() {
  it("with object subkeys", function() {
    const s1 = {}, s2 = {}, s3 = {}, s4 = {};
    const key0 = new WeakMap();
    key0.set(s1, {});
    key0.set(s2, {});
    key0.set(s3, {});
    key0.set(s4, {});

    const value = {value: true};
    const map = new DimensionalMap([s1, s2], [s3, s4]);
    map.set(key0, value);
    expect(map.has(key0)).toBe(true);
    expect(map.get(key0)).toBe(value);

    const keyAsMap = new Map(), keyAsWeak = new Map();
    [s1, s2, s3, s4].forEach((subkey) => {
      keyAsMap.set(subkey, key0.get(subkey));
      keyAsWeak.set(subkey, key0.get(subkey));
    });

    expect(map.has(keyAsMap)).toBe(true);
    expect(map.get(keyAsMap)).toBe(value);

    expect(map.has(keyAsWeak)).toBe(true);
    expect(map.get(keyAsWeak)).toBe(value);
  });
});

});
