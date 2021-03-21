import FunctionSet from "../../source/core/FunctionSet.mjs"

describe("FunctionSet", () => {
  let s;
  beforeEach(() => {
    s = new FunctionSet();
  });
  afterEach(() => {
    s = null;
  });

  it("class is frozen", () => {
    expect(Object.isFrozen(FunctionSet)).toBe(true);
    expect(Object.isFrozen(FunctionSet.prototype)).toBe(true);
  });

  it("is an instance of Set", () => {
    expect(s instanceof Set).toBe(true);
  });

  it("defaults to throwMode = 'immediately'", () => {
    const desc = Reflect.getOwnPropertyDescriptor(s, "throwMode");
    expect(desc).toEqual({
      value: "immediately",
      writable: false,
      enumerable: true,
      configurable: false
    });
  });

  it(".add() accepts functions", () => {
    const spy = jasmine.createSpy("spy");
    expect(s.add(spy)).toBe(true);
    expect(s.has(spy)).toBe(true);

    expect(spy).toHaveBeenCalledTimes(0);
  });

  it(".add() rejects non-functions", () => {
    const obj = {};
    expect(s.add(obj)).toBe(false);
    expect(s.has(obj)).toBe(false);
  });

  describe(".observe()", () => {
    const arg0 = {}, arg1 = {}, arg2 = {};
    const spy1 = jasmine.createSpy("spy1"),
          spy2 = jasmine.createSpy("spy2"),
          spy3 = jasmine.createSpy("spy3"),
          spy4 = jasmine.createSpy("spy4");
    const rv1 = {},
          rv2 = {},
          rv3 = {},
          rv4 = {};

    const exception2 = {};
    const exception3 = {};

    beforeEach(() => {
      spy1.calls.reset();
      spy2.calls.reset();
      spy3.calls.reset();
      spy4.calls.reset();

      spy1.and.returnValue(rv1);
      spy2.and.throwError(exception2);
      spy3.and.throwError(exception3);
      spy4.and.returnValue(rv4);
    });

    function addSpies() {
      s.add(spy1);
      s.add(spy2);
      s.add(spy3);
      s.add(spy4);
    }

    it("calls all functions in the set when none throw", () => {
      spy2.and.returnValue(rv2);
      spy3.and.returnValue(rv3);
      addSpies();
      expect(s.observe(arg0, arg1, arg2)).toEqual([rv1, rv2, rv3, rv4]);

      expect(spy1).toHaveBeenCalledOnceWith(arg0, arg1, arg2);
      expect(spy2).toHaveBeenCalledOnceWith(arg0, arg1, arg2);
      expect(spy3).toHaveBeenCalledOnceWith(arg0, arg1, arg2);
      expect(spy4).toHaveBeenCalledOnceWith(arg0, arg1, arg2);
      expect(spy1).toHaveBeenCalledBefore(spy2);
      expect(spy2).toHaveBeenCalledBefore(spy3);
      expect(spy3).toHaveBeenCalledBefore(spy4);
    });

    it("in throwMode = 'immediately' calls all functions up to one that throws", () => {
      addSpies();

      expect(() => s.observe(arg0, arg1, arg2)).toThrow(exception2);
      expect(spy1).toHaveBeenCalledOnceWith(arg0, arg1, arg2);
      expect(spy2).toHaveBeenCalledOnceWith(arg0, arg1, arg2);
      expect(spy3).toHaveBeenCalledTimes(0);
      expect(spy4).toHaveBeenCalledTimes(0);
      expect(spy1).toHaveBeenCalledBefore(spy2);
    });

    it("in throwMode = 'deferred' calls all functions and rethrows the first exception", () => {
      s = new FunctionSet("deferred");
      addSpies();

      expect(() => s.observe(arg0, arg1, arg2)).toThrow(exception2);
      expect(spy1).toHaveBeenCalledOnceWith(arg0, arg1, arg2);
      expect(spy2).toHaveBeenCalledOnceWith(arg0, arg1, arg2);
      expect(spy3).toHaveBeenCalledOnceWith(arg0, arg1, arg2);
      expect(spy4).toHaveBeenCalledOnceWith(arg0, arg1, arg2);
      expect(spy1).toHaveBeenCalledBefore(spy2);
    });

    it("in throwMode = 'return' calls all functions and returns aggregated results before the first exception", () => {
      s = new FunctionSet("return");
      addSpies();

      expect(s.observe(arg0, arg1, arg2)).toEqual([rv1]);
      expect(spy1).toHaveBeenCalledOnceWith(arg0, arg1, arg2);
      expect(spy2).toHaveBeenCalledOnceWith(arg0, arg1, arg2);
      expect(spy3).toHaveBeenCalledTimes(0);
      expect(spy4).toHaveBeenCalledTimes(0);
      expect(spy1).toHaveBeenCalledBefore(spy2);
    });

    it("in throwMode = 'none' calls all functions and returns aggregated results from all successful calls", () => {
      s = new FunctionSet("none");
      addSpies();

      expect(s.observe(arg0, arg1, arg2)).toEqual([rv1, rv4]);
      expect(spy1).toHaveBeenCalledOnceWith(arg0, arg1, arg2);
      expect(spy2).toHaveBeenCalledOnceWith(arg0, arg1, arg2);
      expect(spy3).toHaveBeenCalledOnceWith(arg0, arg1, arg2);
      expect(spy4).toHaveBeenCalledOnceWith(arg0, arg1, arg2);
      expect(spy1).toHaveBeenCalledBefore(spy2);
      expect(spy2).toHaveBeenCalledBefore(spy3);
      expect(spy3).toHaveBeenCalledBefore(spy4);
    });

    if (typeof AggregateError === "function")
    it("in throwMode = 'aggregate' calls all functions and throws an AggregateError", () => {
      s = new FunctionSet("aggregate");
      addSpies();

      let aggregate = null;
      try {
        s.observe(arg0, arg1, arg2);
      }
      catch (exn) {
        aggregate = exn;
      }

      //eslint-disable-next-line no-undef
      expect(aggregate instanceof AggregateError).toBe(true);
      expect(Array.from(aggregate.errors)).toEqual([exception2, exception3]);

      expect(spy1).toHaveBeenCalledOnceWith(arg0, arg1, arg2);
      expect(spy2).toHaveBeenCalledOnceWith(arg0, arg1, arg2);
      expect(spy3).toHaveBeenCalledOnceWith(arg0, arg1, arg2);
      expect(spy4).toHaveBeenCalledOnceWith(arg0, arg1, arg2);
      expect(spy1).toHaveBeenCalledBefore(spy2);
    });
  });
});
