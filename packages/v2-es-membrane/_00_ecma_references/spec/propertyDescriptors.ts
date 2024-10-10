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

  let _windowCount = 2;
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
          return "all your base"
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
