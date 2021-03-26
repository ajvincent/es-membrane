import PassThroughManager from "../../source/core/PassThroughManager.mjs";

describe("PassThroughManager", () => {
  let manager;
  const membraneSpy = jasmine.createSpy("membraneSpy"),
        wetSpy = jasmine.createSpy("wet"),
        drySpy = jasmine.createSpy("dry"),
        wetGraph = {},
        dryGraph = {},
        key = {};

  beforeEach(() => {
    manager = new PassThroughManager(membraneSpy);
    membraneSpy.calls.reset();
    wetSpy.calls.reset();
    drySpy.calls.reset();
  });

  afterEach(() => {
    manager = null;
  });

  describe("class", () => {
    it("is frozen", () => {
      expect(Object.isFrozen(PassThroughManager)).toBe(true);
      expect(Object.isFrozen(PassThroughManager.prototype)).toBe(true);
    });

    it("cannot be constructed with a non-function first argument", () => {
      expect(() => {
        new PassThroughManager(null)
      }).toThrowError("filter must be a function!");
    });

    it("does not invoke the membrane's filter on the first construction", () => {
      expect(membraneSpy).toHaveBeenCalledTimes(0);
    });

    it("instances are frozen", () => {
      expect(Object.isFrozen(manager)).toBe(true);
    });
  });

  describe(".addGraph()", () => {
    it("accepts a graph and a filter it has never seen before", () => {
      expect(() => {
        manager.addGraph(wetGraph, wetSpy);
      }).not.toThrow();

      expect(membraneSpy).toHaveBeenCalledTimes(0);
      expect(wetSpy).toHaveBeenCalledTimes(0);
    });

    it("accepts two graphs and two filters it has never seen before", () => {
      manager.addGraph(wetGraph, wetSpy);
      expect(() => {
        manager.addGraph(dryGraph, drySpy);
      }).not.toThrow();

      expect(membraneSpy).toHaveBeenCalledTimes(0);
      expect(drySpy).toHaveBeenCalledTimes(0);
    });

    it("accepts two graphs and one filters it has never seen before", () => {
      manager.addGraph(wetGraph, wetSpy);
      expect(() => {
        manager.addGraph(dryGraph, wetSpy);
      }).not.toThrow();

      expect(membraneSpy).toHaveBeenCalledTimes(0);
      expect(wetSpy).toHaveBeenCalledTimes(0);
    });

    it("throws for a non-function filter", () => {
      manager.addGraph(wetGraph, wetSpy);
      expect(() => {
        manager.addGraph(dryGraph, {});
      }).toThrowError("filter must be a function!");
    });

    it("throws for adding a graph twice", () => {
      manager.addGraph(wetGraph, wetSpy);
      expect(() => {
        manager.addGraph(wetGraph, wetSpy);
      }).toThrowError("This graph has already been registered!");
    });
  });

  describe(".mayPass()", () => {
    beforeEach(() => {
      manager.addGraph(wetGraph, wetSpy);
      manager.addGraph(dryGraph, drySpy);
    });

    it("accepts primitives without calling filters", () => {
      expect(manager.mayPass(Symbol("foo"), wetGraph, dryGraph)).toBe(true);

      expect(membraneSpy).toHaveBeenCalledTimes(0);
      expect(wetSpy).toHaveBeenCalledTimes(0);
      expect(drySpy).toHaveBeenCalledTimes(0);
    });

    it("accepts must-pass values without calling filters", () => {
      manager.mustPass(key);
      expect(manager.mayPass(key, wetGraph, dryGraph)).toBe(true);

      expect(membraneSpy).toHaveBeenCalledTimes(0);
      expect(wetSpy).toHaveBeenCalledTimes(0);
      expect(drySpy).toHaveBeenCalledTimes(0);
    });

    it("rejects must-block values without calling filters", () => {
      manager.mustBlock(key);
      expect(manager.mayPass(key, wetGraph, dryGraph)).toBe(false);

      expect(membraneSpy).toHaveBeenCalledTimes(0);
      expect(wetSpy).toHaveBeenCalledTimes(0);
      expect(drySpy).toHaveBeenCalledTimes(0);
    });

    it("accepts values which the membrane filter accepts once", () => {
      membraneSpy.and.returnValue(true);

      expect(manager.mayPass(key, wetGraph, dryGraph)).toBe(true);

      expect(membraneSpy).toHaveBeenCalledTimes(1);
      expect(wetSpy).toHaveBeenCalledTimes(0);
      expect(drySpy).toHaveBeenCalledTimes(0);

      // repeating to see if we call the filters again
      expect(manager.mayPass(key, wetGraph, dryGraph)).toBe(true);

      expect(membraneSpy).toHaveBeenCalledTimes(1);
      expect(wetSpy).toHaveBeenCalledTimes(0);
      expect(drySpy).toHaveBeenCalledTimes(0);
    });

    it("accepts values which the membrane filter rejects and both graph filter accepts", () => {
      membraneSpy.and.returnValue(false);
      wetSpy.and.returnValue(true);
      drySpy.and.returnValue(true);

      expect(manager.mayPass(key, wetGraph, dryGraph)).toBe(true);

      expect(membraneSpy).toHaveBeenCalledTimes(1);
      expect(wetSpy).toHaveBeenCalledTimes(1);
      expect(drySpy).toHaveBeenCalledTimes(1);

      // repeating to see if we call the filters again
      expect(manager.mayPass(key, wetGraph, dryGraph)).toBe(true);

      expect(membraneSpy).toHaveBeenCalledTimes(1);
      expect(wetSpy).toHaveBeenCalledTimes(1);
      expect(drySpy).toHaveBeenCalledTimes(1);
    });

    it("rejects values which the membrane filter rejects and the origin graph rejects", () => {
      membraneSpy.and.returnValue(false);
      wetSpy.and.returnValue(false);
      drySpy.and.returnValue(true);

      expect(manager.mayPass(key, wetGraph, dryGraph)).toBe(false);

      expect(membraneSpy).toHaveBeenCalledTimes(1);
      expect(wetSpy).toHaveBeenCalledTimes(1);
      expect(drySpy).toHaveBeenCalledTimes(0);

      // repeating to see if we call the filters again
      expect(manager.mayPass(key, wetGraph, dryGraph)).toBe(false);

      expect(membraneSpy).toHaveBeenCalledTimes(1);
      expect(wetSpy).toHaveBeenCalledTimes(1);
      expect(drySpy).toHaveBeenCalledTimes(0);
    });

    it("rejects values which the membrane filter rejects and the target graph rejects", () => {
      membraneSpy.and.returnValue(false);
      wetSpy.and.returnValue(true);
      drySpy.and.returnValue(false);

      expect(manager.mayPass(key, wetGraph, dryGraph)).toBe(false);

      expect(membraneSpy).toHaveBeenCalledTimes(1);
      expect(wetSpy).toHaveBeenCalledTimes(1);
      expect(drySpy).toHaveBeenCalledTimes(1);

      // repeating to see if we call the filters again
      expect(manager.mayPass(key, wetGraph, dryGraph)).toBe(false);

      expect(membraneSpy).toHaveBeenCalledTimes(1);
      expect(wetSpy).toHaveBeenCalledTimes(1);
      expect(drySpy).toHaveBeenCalledTimes(1);
    });

    it("rejects values which the membrane filter rejects and both graph filters reject", () => {
      membraneSpy.and.returnValue(false);
      wetSpy.and.returnValue(false);
      drySpy.and.returnValue(false);

      expect(manager.mayPass(key, wetGraph, dryGraph)).toBe(false);

      expect(membraneSpy).toHaveBeenCalledTimes(1);
      expect(wetSpy).toHaveBeenCalledTimes(1);
      expect(drySpy).toHaveBeenCalledTimes(0);

      // repeating to see if we call the filters again
      expect(manager.mayPass(key, wetGraph, dryGraph)).toBe(false);

      expect(membraneSpy).toHaveBeenCalledTimes(1);
      expect(wetSpy).toHaveBeenCalledTimes(1);
      expect(drySpy).toHaveBeenCalledTimes(0);
    });
  });

  describe(".mustPass() throws for", () => {
    beforeEach(() => {
      manager.addGraph(wetGraph, wetSpy);
      manager.addGraph(dryGraph, drySpy);
    });

    it("a primitive", () => {
      expect(() => manager.mustPass(Symbol("foo"))).toThrowError("Primitives already pass through!");
    });

    it("a value that must pass once", () => {
      manager.mustPass(key);
      expect(() => manager.mustPass(key)).toThrowError("This value already passes through!");
    });

    it("a value that must block once", () => {
      manager.mustBlock(key);
      expect(() => manager.mustPass(key)).toThrowError("This value already does not pass through!");
    });

    it("a value that a membrane filter has accepted", () => {
      membraneSpy.and.returnValue(true);
      manager.mayPass(key, wetGraph, dryGraph);
      expect(() => manager.mustPass(key)).toThrowError("This value already passes through!");
    });

    it("a value that both graph filters have accepted", () => {
      membraneSpy.and.returnValue(false);
      wetSpy.and.returnValue(true);
      drySpy.and.returnValue(true);
      manager.mayPass(key, wetGraph, dryGraph);
      expect(() => manager.mustPass(key)).toThrowError("This value already passes through!");
    });

    it("a value that a graph filter has rejected", () => {
      membraneSpy.and.returnValue(false);
      wetSpy.and.returnValue(true);
      drySpy.and.returnValue(false);
      manager.mayPass(key, wetGraph, dryGraph);
      expect(() => manager.mustPass(key)).toThrowError("This value already does not pass through!");
    });
  });

  describe(".mustBlock() throws for", () => {
    beforeEach(() => {
      manager.addGraph(wetGraph, wetSpy);
      manager.addGraph(dryGraph, drySpy);
    });

    it("a primitive", () => {
      expect(() => manager.mustBlock(Symbol("foo"))).toThrowError("Primitives already pass through!");
    });

    it("a value that must pass once", () => {
      manager.mustPass(key);
      expect(() => manager.mustBlock(key)).toThrowError("This value already passes through!");
    });

    it("a value that must block once", () => {
      manager.mustBlock(key);
      expect(() => manager.mustBlock(key)).toThrowError("This value already does not pass through!");
    });

    it("a value that a membrane filter has accepted", () => {
      membraneSpy.and.returnValue(true);
      manager.mayPass(key, wetGraph, dryGraph);
      expect(() => manager.mustBlock(key)).toThrowError("This value already passes through!");
    });

    it("a value that both graph filters have accepted", () => {
      membraneSpy.and.returnValue(false);
      wetSpy.and.returnValue(true);
      drySpy.and.returnValue(true);
      manager.mayPass(key, wetGraph, dryGraph);
      expect(() => manager.mustBlock(key)).toThrowError("This value already passes through!");
    });

    it("a value that a graph filter has rejected", () => {
      membraneSpy.and.returnValue(false);
      wetSpy.and.returnValue(true);
      drySpy.and.returnValue(false);
      manager.mayPass(key, wetGraph, dryGraph);
      expect(() => manager.mustBlock(key)).toThrowError("This value already does not pass through!");
    });
  });

  it(".forget() means that the manager doesn't know about an object", () => {
    membraneSpy.and.returnValue(false);
    wetSpy.and.returnValue(true);
    drySpy.and.returnValue(true);
    manager.addGraph(wetGraph, wetSpy);
    manager.addGraph(dryGraph, drySpy);

    expect(manager.mayPass(key, wetGraph, dryGraph)).toBe(true);

    expect(membraneSpy).toHaveBeenCalledTimes(1);
    expect(wetSpy).toHaveBeenCalledTimes(1);
    expect(drySpy).toHaveBeenCalledTimes(1);

    manager.forget(key);

    // repeating to see if we call the filters again
    expect(manager.mayPass(key, wetGraph, dryGraph)).toBe(true);

    expect(membraneSpy).toHaveBeenCalledTimes(2);
    expect(wetSpy).toHaveBeenCalledTimes(2);
    expect(drySpy).toHaveBeenCalledTimes(2);
  });
});
