describe("Object.freeze() on ordinary objects", function() {
  it("works as expected with primitive properties", function() {
    var frozen = Object.freeze({x: 3});
    expect(Reflect.isExtensible(frozen)).toBe(false);

    expect(function() {
      frozen.y = 5;
    }).toThrow();

    {
      let desc = Reflect.getOwnPropertyDescriptor(frozen, "x");
      expect(desc.configurable).toBe(false);
      expect(desc.writable).toBe(false);
    }

    expect(function() {
      frozen.x = 4;
    }).toThrow();

    expect(Reflect.deleteProperty(frozen, "x")).toBe(false);
    expect(Reflect.deleteProperty(frozen, "doesNotExist")).toBe(true);

    expect(frozen.x).toBe(3);
    expect(Object.isFrozen(frozen)).toBe(true);
    expect(Object.isSealed(frozen)).toBe(true);
  });

  it("disallows calling setPrototypeOf() unless it's the existing prototype", function() {
    function A() {}
    A.prototype.name = "letterA";

    function B() {}
    B.prototype = new A();
    B.prototype.name = "letterB";

    function C() {}

    let b = new B();
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);
    Object.freeze(b);

    expect(Reflect.setPrototypeOf(b, A.prototype)).toBe(false);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    expect(Reflect.setPrototypeOf(b, C.prototype)).toBe(false);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    expect(Reflect.setPrototypeOf(b, B.prototype)).toBe(true);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    expect(Reflect.setPrototypeOf(b, {})).toBe(false);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);    
  });
});

describe("Object.freeze() on objects with proxies directly reflecting them", function() {
  it("works as expected with primitive properties", function() {
    var frozen = Object.freeze({x: 3});
    var {proxy, revoke} = Proxy.revocable(frozen, {});
    frozen = proxy;
    expect(Reflect.isExtensible(frozen)).toBe(false);

    expect(function() {
      frozen.y = 5;
    }).toThrow();

    {
      let desc = Reflect.getOwnPropertyDescriptor(frozen, "x");
      expect(desc.configurable).toBe(false);
      expect(desc.writable).toBe(false);
    }

    expect(function() {
      frozen.x = 4;
    }).toThrow();

    expect(Reflect.deleteProperty(frozen, "x")).toBe(false);
    expect(Reflect.deleteProperty(frozen, "doesNotExist")).toBe(true);

    expect(frozen.x).toBe(3);
    expect(Object.isFrozen(frozen)).toBe(true);
    expect(Object.isSealed(frozen)).toBe(true);

    revoke();
  });

  it("disallows calling setPrototypeOf() unless it's the existing prototype", function() {
    function A() {}
    A.prototype.name = "letterA";

    function B() {}
    B.prototype = new A();
    B.prototype.name = "letterB";

    function C() {}

    let b = new B();

    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);
    Object.freeze(b);

    var {proxy, revoke} = Proxy.revocable(b, {});
    b = proxy;

    expect(Reflect.setPrototypeOf(b, A.prototype)).toBe(false);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    expect(Reflect.setPrototypeOf(b, C.prototype)).toBe(false);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    expect(Reflect.setPrototypeOf(b, B.prototype)).toBe(true);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    expect(Reflect.setPrototypeOf(b, {})).toBe(false);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    revoke();
  });
});

describe("Object.freeze() on proxies to objects", function() {
  it("works as expected with primitive properties", function() {
    var {proxy, revoke} = Proxy.revocable({x: 3}, {});
    var frozen = Object.freeze(proxy);
    expect(Reflect.isExtensible(frozen)).toBe(false);

    expect(function() {
      frozen.y = 5;
    }).toThrow();

    {
      let desc = Reflect.getOwnPropertyDescriptor(frozen, "x");
      expect(desc.configurable).toBe(false);
      expect(desc.writable).toBe(false);
    }

    expect(function() {
      frozen.x = 4;
    }).toThrow();

    expect(Reflect.deleteProperty(frozen, "x")).toBe(false);
    expect(Reflect.deleteProperty(frozen, "doesNotExist")).toBe(true);

    expect(frozen.x).toBe(3);
    expect(Object.isFrozen(frozen)).toBe(true);
    expect(Object.isSealed(frozen)).toBe(true);

    revoke();
  });

  it("disallows calling setPrototypeOf() unless it's the existing prototype", function() {
    function A() {}
    A.prototype.name = "letterA";

    function B() {}
    B.prototype = new A();
    B.prototype.name = "letterB";

    function C() {}

    let b = new B();

    var {proxy, revoke} = Proxy.revocable(b, {});
    b = proxy;

    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);
    Object.freeze(b);

    expect(Reflect.setPrototypeOf(b, A.prototype)).toBe(false);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    expect(Reflect.setPrototypeOf(b, C.prototype)).toBe(false);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    expect(Reflect.setPrototypeOf(b, B.prototype)).toBe(true);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    expect(Reflect.setPrototypeOf(b, {})).toBe(false);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    revoke();
  });
});

describe("Object.seal() on ordinary objects", function() {
  it("works as expected with primitive properties", function() {
    var sealed = Object.seal({x: 3});
    expect(Reflect.isExtensible(sealed)).toBe(false);
    expect(function() {
      sealed.y = 5;
    }).toThrow();

    expect(Reflect.defineProperty(sealed, "y", {
      value: 5,
      writable: true,
      enumerable: true,
      configurable: true
    })).toBe(false);
    expect(sealed.y).toBe(undefined);

    {
      let desc = Reflect.getOwnPropertyDescriptor(sealed, "x");
      expect(desc.configurable).toBe(false);
      expect(desc.writable).toBe(true);
    }
    sealed.x = 4;
    expect(sealed.x).toBe(4);
    expect(Object.isFrozen(sealed)).toBe(false);
    expect(Object.isSealed(sealed)).toBe(true);

    expect(Reflect.deleteProperty(sealed, "x")).toBe(false);
    expect(Reflect.deleteProperty(sealed, "doesNotExist")).toBe(true);

    expect(sealed.x).toBe(4);
  });

  it("disallows calling setPrototypeOf() unless it's the existing prototype", function() {
    function A() {}
    A.prototype.name = "letterA";

    function B() {}
    B.prototype = new A();
    B.prototype.name = "letterB";

    function C() {}

    let b = new B();
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);
    Object.seal(b);

    expect(Reflect.setPrototypeOf(b, A.prototype)).toBe(false);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    expect(Reflect.setPrototypeOf(b, C.prototype)).toBe(false);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    expect(Reflect.setPrototypeOf(b, B.prototype)).toBe(true);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    expect(Reflect.setPrototypeOf(b, {})).toBe(false);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);    
  });
});

describe("Object.seal() on objects with proxies directly reflecting them", function() {
  it("works as expected with primitive properties", function() {
    var sealed = Object.seal({x: 3});
    var {proxy, revoke} = Proxy.revocable(sealed, {});
    sealed = proxy;

    expect(Reflect.isExtensible(sealed)).toBe(false);
    expect(function() {
      sealed.y = 5;
    }).toThrow();
    expect(Reflect.defineProperty(sealed, "y", {
      value: 5,
      writable: true,
      enumerable: true,
      configurable: true
    })).toBe(false);
    expect(sealed.y).toBe(undefined);

    {
      let desc = Reflect.getOwnPropertyDescriptor(sealed, "x");
      expect(desc.configurable).toBe(false);
      expect(desc.writable).toBe(true);
    }
    sealed.x = 4;
    expect(sealed.x).toBe(4);
    expect(Object.isFrozen(sealed)).toBe(false);
    expect(Object.isSealed(sealed)).toBe(true);

    expect(Reflect.deleteProperty(sealed, "x")).toBe(false);
    expect(Reflect.deleteProperty(sealed, "doesNotExist")).toBe(true);

    expect(sealed.x).toBe(4);

    revoke();
  });

  it("disallows calling setPrototypeOf() unless it's the existing prototype", function() {
    function A() {}
    A.prototype.name = "letterA";

    function B() {}
    B.prototype = new A();
    B.prototype.name = "letterB";

    function C() {}

    let b = new B();

    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);
    Object.seal(b);

    var {proxy, revoke} = Proxy.revocable(b, {});
    b = proxy;

    expect(Reflect.setPrototypeOf(b, A.prototype)).toBe(false);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    expect(Reflect.setPrototypeOf(b, C.prototype)).toBe(false);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    expect(Reflect.setPrototypeOf(b, B.prototype)).toBe(true);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    expect(Reflect.setPrototypeOf(b, {})).toBe(false);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    revoke();
  });
});

describe("Object.seal() on proxies of objects", function() {
  it("works as expected with primitive properties", function() {
    var {proxy, revoke} = Proxy.revocable({x: 3}, {});
    var sealed = Object.seal(proxy);
    sealed = proxy;

    expect(Reflect.isExtensible(sealed)).toBe(false);
    expect(function() {
      sealed.y = 5;
    }).toThrow();
    expect(Reflect.defineProperty(sealed, "y", {
      value: 5,
      writable: true,
      enumerable: true,
      configurable: true
    })).toBe(false);
    expect(sealed.y).toBe(undefined);

    {
      let desc = Reflect.getOwnPropertyDescriptor(sealed, "x");
      expect(desc.configurable).toBe(false);
      expect(desc.writable).toBe(true);
    }
    sealed.x = 4;
    expect(sealed.x).toBe(4);
    expect(Object.isFrozen(sealed)).toBe(false);
    expect(Object.isSealed(sealed)).toBe(true);

    expect(Reflect.deleteProperty(sealed, "x")).toBe(false);
    expect(Reflect.deleteProperty(sealed, "doesNotExist")).toBe(true);

    expect(sealed.x).toBe(4);

    revoke();
  });

  it("disallows calling setPrototypeOf() unless it's the existing prototype", function() {
    function A() {}
    A.prototype.name = "letterA";

    function B() {}
    B.prototype = new A();
    B.prototype.name = "letterB";

    function C() {}

    let b = new B();

    var {proxy, revoke} = Proxy.revocable(b, {});
    b = proxy;

    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);
    Object.seal(b);

    expect(Reflect.setPrototypeOf(b, A.prototype)).toBe(false);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    expect(Reflect.setPrototypeOf(b, C.prototype)).toBe(false);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    expect(Reflect.setPrototypeOf(b, B.prototype)).toBe(true);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    expect(Reflect.setPrototypeOf(b, {})).toBe(false);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    revoke();
  });
});
