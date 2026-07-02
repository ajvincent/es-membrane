// This test means we can tighten what Reflect returns to us.
it("Reflect.getOwnPropertyDescriptor() returns a full descriptor", () => {
  const car = {
    _color: "green",
    get color(): string {
      return this._color;
    },
    set color(value: string) {
      this._color = value;
    },

    wheelCount: 4,
  };

  const fuelDesc = Reflect.getOwnPropertyDescriptor(car, "fuelType");
  expect(fuelDesc).toBeUndefined();

  const wheelDesc = Reflect.getOwnPropertyDescriptor(car, "wheelCount");
  expect(wheelDesc).toBeDefined();
  if (wheelDesc) {
    expect(wheelDesc.configurable).toBeTrue();
    expect(wheelDesc.enumerable).toBeTrue();
    expect(wheelDesc.writable).toBeTrue();
    expect(wheelDesc.value).toBe(4);

    expect(wheelDesc.get).toBeUndefined();
    expect(wheelDesc.set).toBeUndefined();
  }

  const colorDesc = Reflect.getOwnPropertyDescriptor(car, "color");
  expect(colorDesc).toBeDefined();
  if (colorDesc) {
    expect(colorDesc.configurable).toBe(true);
    expect(colorDesc.enumerable).toBe(true);
    expect(typeof colorDesc.get).toBe("function");
    expect(typeof colorDesc.set).toBe("function");

    expect(colorDesc.value).toBeUndefined();
    expect(colorDesc.writable).toBeUndefined();
  }

  // User-defined fields
  Reflect.defineProperty(car, "driverCount", { value: 1 });

  const driverDesc = Reflect.getOwnPropertyDescriptor(car, "driverCount");
  expect(driverDesc).toBeDefined();
  if (driverDesc) {
    expect(driverDesc.configurable).toBe(false);
    expect(driverDesc.enumerable).toBe(false);
    expect(driverDesc.writable).toBe(false);
    expect(driverDesc.value).toBe(1);
  }

  const _windowCount = 2;
  Reflect.defineProperty(car, "windows", {
    get(): number {
      return _windowCount;
    },
  });

  const windowDesc = Reflect.getOwnPropertyDescriptor(car, "windows");
  expect(windowDesc).toBeDefined();
  if (windowDesc) {
    expect(windowDesc.configurable).toBe(false);
    expect(windowDesc.enumerable).toBe(false);
    expect(typeof windowDesc.get).toBe("function");
    expect(windowDesc.set).toBeUndefined();
  }

  // illegal descriptor
  expect(
    () => {
      Reflect.defineProperty(car, "licensePlate", {
        configurable: true,
        enumerable: true,
        value: "all your base",
        get: function() {
          return "all your base";
        }
      });
    }
  ).toThrow();
});

it("Reflect.getOwnPropertyDescriptor() returns unique objects each time", () => {
  const x = {};
  Reflect.defineProperty(x, "foo", { value: "foo" });

  function getFoo(): PropertyDescriptor | undefined {
    return Reflect.getOwnPropertyDescriptor(x, "foo");
  }

  expect(getFoo()).toEqual(getFoo());
  expect(getFoo()).not.toBe(getFoo());
});

describe("Reflect.defineProperty() has specific rules", () => {
  interface Person {
    name: string;
  }

  interface Car {
    owner?: Person;
  }

  const Fred: Person = { name: "Fred" };
  const Wilma: Person = { name: "Wilma" };

  let car: Car;
  let cachedOwner: Person;
  beforeEach(() => {
    car = {};
    cachedOwner = Fred;
  });
  function ownerGetter() {
    return cachedOwner;
  }
  function ownerSetter(value: Person): void {
    cachedOwner = value;
  }

  it("with configurable, enumerable and writable not defined", () => {
    expect(Reflect.defineProperty(car, "owner", {
      value: Fred,
    })).toBeTrue();

    expect(Reflect.getOwnPropertyDescriptor(car, "owner")).toEqual({
      value: Fred,
      configurable: false,
      enumerable: false,
      writable: false
    });
  });

  it("with configurable set to false and enumerable, writable not defined", () => {
    expect(Reflect.defineProperty(car, "owner", {
      value: Fred,
      configurable: false
    })).toBeTrue();

    expect(Reflect.getOwnPropertyDescriptor(car, "owner")).toEqual({
      value: Fred,
      configurable: false,
      enumerable: false,
      writable: false
    });

    expect(Reflect.defineProperty(car, "owner", {
      value: Wilma,
      configurable: false
    })).toBeFalse();

    expect(Reflect.getOwnPropertyDescriptor(car, "owner")).toEqual({
      value: Fred,
      configurable: false,
      enumerable: false,
      writable: false
    });

    expect(Reflect.deleteProperty(car, "owner")).toBeFalse();
    expect(Reflect.getOwnPropertyDescriptor(car, "owner")).toEqual({
      value: Fred,
      configurable: false,
      enumerable: false,
      writable: false
    });
  });

  it("with configurable set to true and enumerable, writable not defined", () => {
    expect(Reflect.defineProperty(car, "owner", {
      value: Fred,
      configurable: true
    })).toBeTrue();

    expect(Reflect.getOwnPropertyDescriptor(car, "owner")).toEqual({
      value: Fred,
      configurable: true,
      enumerable: false,
      writable: false
    });

    expect(Reflect.defineProperty(car, "owner", {
      value: Wilma,
      configurable: true
    })).toBeTrue();

    expect(Reflect.getOwnPropertyDescriptor(car, "owner")).toEqual({
      value: Wilma,
      configurable: true,
      enumerable: false,
      writable: false
    });

    expect(Reflect.deleteProperty(car, "owner")).toBeTrue();
    expect(Reflect.getOwnPropertyDescriptor(car, "owner")).toBeUndefined();
  });

  it("with a pre-existing property and configurable: false", () => {
    car.owner = Fred;
    // we already tested getOwnPropertyDescriptor for direct definitions above

    expect(Reflect.defineProperty(car, "owner", {
      configurable: false
    })).toBeTrue();

    expect(Reflect.getOwnPropertyDescriptor(car, "owner")).toEqual({
      value: Fred,
      configurable: false,
      enumerable: true,
      writable: true
    });

    // writable: true
    car.owner = Wilma;

    expect(Reflect.getOwnPropertyDescriptor(car, "owner")).toEqual({
      value: Wilma,
      configurable: false,
      enumerable: true,
      writable: true
    });

    // writable: true, so this still works
    expect(Reflect.defineProperty(car, "owner", { value: Fred })).toBeTrue();

    expect(Reflect.getOwnPropertyDescriptor(car, "owner")).toEqual({
      value: Fred,
      configurable: false,
      enumerable: true,
      writable: true
    });

    // configurable: false means we can't redefine the property
    expect(Reflect.defineProperty(car, "owner", {
      get: () => Wilma,
    })).toBeFalse();

    expect(Reflect.getOwnPropertyDescriptor(car, "owner")).toEqual({
      value: Fred,
      configurable: false,
      enumerable: true,
      writable: true
    });
  });

  it("with getters and setters", () => {
    expect(Reflect.defineProperty(car, "owner", {
      get: ownerGetter,
      set: ownerSetter,
      configurable: true
    })).toBeTrue();

    expect(car.owner).toBe(Fred);
    expect(Reflect.getOwnPropertyDescriptor(car, "owner")).toEqual({
      get: ownerGetter,
      set: ownerSetter,
      configurable: true,
      enumerable: false,
    });
  });

  it(", when enumerable == false, hide a key from Object.keys", () => {
    expect(Reflect.ownKeys(car)).toEqual([]);
    car.owner = Fred;
    expect(Reflect.ownKeys(car)).toContain("owner");

    delete car.owner;
    expect(Reflect.ownKeys(car)).toEqual([]);

    Reflect.defineProperty(car, "owner", {
      value: Fred
    });
    expect(Reflect.ownKeys(car)).toContain("owner");
    expect(Object.keys(car)).toEqual([]);
  });
});
