import {
  AccessorDescriptor,
  NWNCDataDescriptor,
  DataDescriptor,
  DeadProxyKey,
  Primordials,
  allTraps,
  assert,
  defineNWNCProperties,
  isAccessorDescriptor,
  isDataDescriptor,
  makeShadowTarget,
  getRealTarget,
  returnFalse,
  valueType,
} from "../../../source/core/utilities/shared.mjs";

describe("Shadow targets map to real targets", () => {
  it("for a vanilla object", () => {
    const realTarget = {};
    const shadowTarget = makeShadowTarget(realTarget);
    expect(shadowTarget).not.toBe(realTarget);
    expect(getRealTarget(shadowTarget)).toBe(realTarget);
    expect(typeof shadowTarget).toBe("object");
    expect(Array.isArray(shadowTarget)).toBe(false);
  });

  it("for an array", () => {
    const realTarget = [true];
    const shadowTarget = makeShadowTarget(realTarget);
    expect(shadowTarget).not.toBe(realTarget);
    expect(getRealTarget(shadowTarget)).toBe(realTarget);
    expect(Array.isArray(shadowTarget)).toBe(true);
    expect(shadowTarget.length).toBe(0);
  });

  it("for a function", () => {
    const realTarget = () => {
      return true;
    };
    const shadowTarget = makeShadowTarget(realTarget);
    expect(shadowTarget).not.toBe(realTarget);
    expect(getRealTarget(shadowTarget)).toBe(realTarget);
    expect(typeof shadowTarget).toBe("function");
    expect(shadowTarget()).toBe(undefined);
  });
});

it("getRealTarget returns the real target for a value that isn't a shadow", () => {
  const realTarget = {};
  expect(getRealTarget(realTarget)).toBe(realTarget);
});

it("returnFalse does exactly what it says", () => {
  expect(returnFalse()).toBe(false);
});

describe("DataDescriptor", () => {
  const realValue = {};
  it("sets all parameters correctly", async () => {
    const desc = new DataDescriptor(realValue, true, false, false);
    expect(desc.value).toBe(realValue);
    expect(desc.writable).toBe(true);
    expect(desc.enumerable).toBe(false);
    expect(desc.configurable).toBe(false);

    expect(Reflect.ownKeys(desc)).toEqual([
      "value",
      "writable",
      "enumerable",
      "configurable"
    ]);
  });

  it("sets default parameters correctly", async () => {
    const desc = new DataDescriptor(realValue);
    expect(desc.value).toBe(realValue);
    expect(desc.writable).toBe(false);
    expect(desc.enumerable).toBe(true);
    expect(desc.configurable).toBe(true);

    expect(Reflect.ownKeys(desc)).toEqual([
      "value",
      "writable",
      "enumerable",
      "configurable"
    ]);
  });
});

describe("AccessorDescriptor", () => {
  function realGetter() {}
  function realSetter() {}
  it("sets all parameters correctly", async () => {
    const desc = new AccessorDescriptor(realGetter, realSetter, false, false);
    expect(desc.get).toBe(realGetter);
    expect(desc.set).toBe(realSetter);
    expect(desc.enumerable).toBe(false);
    expect(desc.configurable).toBe(false);

    expect(Reflect.ownKeys(desc)).toEqual([
      "get",
      "set",
      "enumerable",
      "configurable"
    ]);
  });

  it("sets default parameters correctly for a getter and setter", async () => {
    const desc = new AccessorDescriptor(realGetter, realSetter);
    expect(desc.get).toBe(realGetter);
    expect(desc.set).toBe(realSetter);
    expect(desc.enumerable).toBe(true);
    expect(desc.configurable).toBe(true);

    expect(Reflect.ownKeys(desc)).toEqual([
      "get",
      "set",
      "enumerable",
      "configurable"
    ]);
  });

  it("sets default parameters correctly for a getter only", async () => {
    const desc = new AccessorDescriptor(realGetter);
    expect(desc.get).toBe(realGetter);
    expect(desc.set).toBe(undefined);
    expect(desc.enumerable).toBe(true);
    expect(desc.configurable).toBe(true);

    expect(Reflect.ownKeys(desc)).toEqual([
      "get",
      "set",
      "enumerable",
      "configurable"
    ]);
  });
});

describe("NWNCDataDescriptor", () => {
  const realValue = {};
  it("sets all parameters correctly", async () => {
    const desc = new NWNCDataDescriptor(realValue, false);
    expect(desc.value).toBe(realValue);
    expect(desc.writable).toBe(false);
    expect(desc.enumerable).toBe(false);
    expect(desc.configurable).toBe(false);

    expect(Reflect.ownKeys(desc)).toEqual([
      "value",
      "enumerable",
    ]);
  });

  it("sets default parameters correctly", async () => {
    const desc = new NWNCDataDescriptor(realValue);
    expect(desc.value).toBe(realValue);
    expect(desc.enumerable).toBe(true);

    expect(Reflect.ownKeys(desc)).toEqual([
      "value",
      "enumerable",
    ]);
  });

  it("has a frozen prototype", () => {
    expect(Object.isFrozen(NWNCDataDescriptor.prototype)).toBe(true);
    expect(NWNCDataDescriptor.prototype.writable).toBe(false);
    expect(NWNCDataDescriptor.prototype.configurable).toBe(false);
    expect(Reflect.ownKeys(NWNCDataDescriptor.prototype)).toEqual([
      "constructor",
      "writable",
      "configurable",
    ]);
  });
});

describe("isDataDescriptor", () => {
  it("returns true for a valid data descriptor", () => {
    expect(isDataDescriptor({
      value: 1,
      writable: true
    })).toBe(true);
  });

  it("returns true for a data descriptor with just a value property", () => {
    expect(isDataDescriptor({
      value: 1
    })).toBe(true);
  });

  it("returns true for a data descriptor with just a writable property", () => {
    expect(isDataDescriptor({
      writable: 1 // it doesn't have to be boolean, strictly speaking
    })).toBe(true);
  });

  it("returns false for an invalid data descriptor", () => {
    expect(isDataDescriptor({
      configurable: 1,
      enumerable: true
    })).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isDataDescriptor(undefined)).toBe(false);
  });
});

describe("isAccessorDescriptor", () => {
  it("returns true for a valid data descriptor", () => {
    expect(isAccessorDescriptor({
      get: 1, // should be a function, but...
      set: true // should be a function, but...
    })).toBe(true);
  });

  it("returns true for a data descriptor with just a get property", () => {
    expect(isAccessorDescriptor({
      get: 1
    })).toBe(true);
  });

  it("returns true for a data descriptor with just a set property", () => {
    expect(isAccessorDescriptor({
      set: 1
    })).toBe(true);
  });

  it("returns false for an invalid data descriptor", () => {
    expect(isAccessorDescriptor({
      configurable: 1,
      enumerable: true
    })).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isAccessorDescriptor(undefined)).toBe(false);
  });
});

it("defineNWNCProperties defines properties on an object as non-writable, non-configurable", () => {
  const enumerableBag = {
    foo: {},
    bar: 1,
    baz: true
  };

  const nonEnumerableBag = {
    color: "red",
    speed: 55,
    wheels: [{}, {}, {}, {}]
  };

  const obj = {};

  defineNWNCProperties(obj, enumerableBag, true);
  defineNWNCProperties(obj, nonEnumerableBag, false);

  Reflect.ownKeys(enumerableBag).forEach(key => {
    const desc = Reflect.getOwnPropertyDescriptor(obj, key);
    expect(isDataDescriptor(desc)).toBe(true);
    expect(desc.writable).toBe(false);
    expect(desc.configurable).toBe(false);
    expect(desc.enumerable).toBe(true);
    expect(desc.value).toBe(enumerableBag[key]);
  });

  Reflect.ownKeys(nonEnumerableBag).forEach(key => {
    const desc = Reflect.getOwnPropertyDescriptor(obj, key);
    expect(isDataDescriptor(desc)).toBe(true);
    expect(desc.writable).toBe(false);
    expect(desc.configurable).toBe(false);
    expect(desc.enumerable).toBe(false);
    expect(desc.value).toBe(nonEnumerableBag[key]);
  });
});

it("allTraps is a frozen array describing all traps", () => {
  expect(Object.isFrozen(allTraps)).toBe(true);
  expect(Array.isArray(allTraps)).toBe(true);
  expect(allTraps).toEqual([
    "getPrototypeOf",
    "setPrototypeOf",
    "isExtensible",
    "preventExtensions",
    "getOwnPropertyDescriptor",
    "defineProperty",
    "has",
    "get",
    "set",
    "deleteProperty",
    "ownKeys",
    "apply",
    "construct",
  ]);
});

it("Primordials is a frozen array", () => {
  expect(Object.isFrozen(Primordials)).toBe(true);
  expect(Array.isArray(Primordials)).toBe(true);
});

it("DeadProxyKey is a symbol", () => {
  expect(typeof DeadProxyKey).toBe("symbol");
});

describe("valueType", () => {
  it("returns 'primitive' for null", () => {
    expect(valueType(null)).toBe("primitive");
  });

  it("returns 'primitive' for a string", () => {
    expect(valueType("hello")).toBe("primitive");
  });

  it("returns 'object' for an object", () => {
    expect(valueType({})).toBe("object");
  });

  it("returns 'object' for an array", () => {
    expect(valueType([])).toBe("object");
  });

  it("returns 'function' for a function", () => {
    expect(valueType(() => null)).toBe("function");
  })
});

describe("assert", () => {
  it("does nothing on a passing condition", () => {
    expect(() => assert(true, "do nothing")).not.toThrow();
  });

  it("throws an exception on a failed condition", () => {
    expect(() => assert(false, "foo")).toThrowError("Assertion failure: foo");
  });
});
