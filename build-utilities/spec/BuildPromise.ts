import {
  BuildPromise,
  BuildPromiseSet
} from "../source/BuildPromise.js";

describe("BuildPromise.mts: ", () => {
  let bpSet: BuildPromiseSet;
  beforeEach(() => bpSet = new BuildPromiseSet);

  function createSpyPromise(willResolve: boolean, value: unknown) : jasmine.Spy
  {
    const spy = jasmine.createSpy();
    if (willResolve)
      spy.and.returnValue(Promise.resolve(value));
    else
      spy.and.returnValue(Promise.reject(value));
    return spy;
  }

  describe("Without running, BuildPromiseSet", () => {
    it(`starts with a status of "not started"`, () => {
      expect(bpSet.status).toBe("not started");
    });
  
    it("returns the same promise for two calls to .get() with the same name", () => {
      const bp1 = bpSet.get("foo");
      const bp2 = bpSet.get("foo");
      expect(bp2).toBe(bp1);
    });

    it(".main is a previously defined BuildPromise", () => {
      expect(bpSet.main).toBe(bpSet.get("main"));
    });

    it(`.markClosed() marks itself with status "closed" under normal circumstances`, () => {
      bpSet.markClosed();
      expect(bpSet.status).toBe("closed");

      bpSet.markClosed();
      expect(bpSet.status).toBe("closed");
    });

    it(`.markReady() marks itself as ready if in a "not started" state`, () => {
      bpSet.markReady();
      expect(bpSet.status).toBe("ready");

      bpSet.markReady();
      expect(bpSet.status).toBe("ready");

      bpSet.markClosed();
      expect(bpSet.status).toBe("closed");

      bpSet.markReady();
      expect(bpSet.status).toBe("closed");
    });
  });

  describe(`Without starting from main, BuildPromiseSet.get("foo")`, () => {
    let foo: BuildPromise;
    beforeEach(() => foo = bpSet.get("foo"));

    it(`starts out with a readonly target property of "foo"`, () => {
      expect(foo.target).toBe("foo");
    });

    it("starts with an empty list of deepTargets", () => {
      expect(foo.deepTargets).toEqual([]);
    });

    it(".description can be set once", () => {
      foo.description = "bar";
      expect(foo.description).toBe("bar");

      expect(
        () => foo.description = "wop"
      ).toThrowError(`Description already set for target "foo"`);
      expect(foo.description).toBe("bar");
    });

    describe(`.addSubtarget()`, () => {
      it(`called with "bar" once adds a subtarget`, () => {
        expect(
          () => foo.addSubtarget("bar")
        ).not.toThrow();

        expect(foo.deepTargets).toEqual(["bar"]);
      });

      it(`called with "bar" before calling bpSet.get("bar").addSubtarget("wop") shows two deep targets`, () => {
        foo.addSubtarget("bar");

        const bar = bpSet.get("bar");
        bar.addSubtarget("wop");

        expect(foo.deepTargets).toEqual(["bar", "wop"]);
      });

      it(`called with "bar" after calling bpSet.get("bar").addSubtarget("wop") shows two deep targets`, () => {
        const bar = bpSet.get("bar");
        bar.addSubtarget("wop");

        foo.addSubtarget("bar");
        expect(foo.deepTargets).toEqual(["bar", "wop"]);
      });

      it("called with two subtargets pointing to a shared third target lists the third target once", () => {
        const bar = bpSet.get("bar");
        bar.addSubtarget("shared");

        const wop = bpSet.get("wop");
        wop.addSubtarget("shared");

        foo.addSubtarget("bar");
        foo.addSubtarget("wop");

        expect(foo.deepTargets).toEqual(["bar", "wop", "shared"]);
      });

      it(`called with "bar" twice throws`, () => {
        foo.addSubtarget("bar");

        expect(
          () => foo.addSubtarget("bar")
        ).toThrowError("bar is already a subtarget of foo");

        expect(foo.deepTargets).toEqual(["bar"]);
      });

      it(`called with "bar" after having "bar" as a post-subtarget throws`, () => {
        foo.addPostSubtarget("bar");

        expect(
          () => foo.addSubtarget("bar")
        ).toThrowError("bar is already a post-subtarget of foo");

        expect(foo.deepTargets).toEqual(["bar"]);
      });

      it(`called with "main" throws`, () => {
        expect(
          () => foo.addSubtarget("main")
        ).toThrowError("Cannot include main target");
      });

      it(`called with "foo" throws`, () => {
        expect(
          () => foo.addSubtarget("foo")
        ).toThrowError("Cannot include this as its own subtarget");
      });

      it(`called with "bar" after the set's "bar" promise has "foo" as a dependency throws`, () => {
        const bar = bpSet.get("bar");
        bar.addSubtarget("foo");

        expect(
          () => foo.addSubtarget("bar")
        ).toThrowError(`"bar" already has a dependency on "foo"`);
      });

      it("called with a three-deep cycle throws", () => {
        const bar = bpSet.get("bar");
        const wop = bpSet.get("wop");

        bar.addSubtarget("wop");
        wop.addSubtarget("foo");

        expect(
          () => foo.addSubtarget("bar")
        ).toThrowError(`"bar" already has a dependency on "foo"`);
      });
    });

    describe(`.addPostSubtarget()`, () => {
      it(`called with "bar" once adds a subtarget`, () => {
        expect(
          () => foo.addPostSubtarget("bar")
        ).not.toThrow();

        expect(foo.deepTargets).toEqual(["bar"]);
      });

      it(`called with "bar" before calling bpSet.get("bar").addSubtarget("wop") shows two deep targets`, () => {
        foo.addPostSubtarget("bar");

        const bar = bpSet.get("bar");
        bar.addSubtarget("wop");

        expect(foo.deepTargets).toEqual(["bar", "wop"]);
      });

      it(`called with "bar" after calling bpSet.get("bar").addSubtarget("wop") shows two deep targets`, () => {
        const bar = bpSet.get("bar");
        bar.addSubtarget("wop");

        foo.addPostSubtarget("bar");
        expect(foo.deepTargets).toEqual(["bar", "wop"]);
      });

      it("called with two subtargets pointing to a shared third target lists the third target once", () => {
        const bar = bpSet.get("bar");
        bar.addPostSubtarget("shared");

        const wop = bpSet.get("wop");
        wop.addPostSubtarget("shared");

        foo.addSubtarget("bar");
        foo.addSubtarget("wop");

        expect(foo.deepTargets).toEqual(["bar", "wop", "shared"]);
      });

      it(`called with "bar" twice throws`, () => {
        foo.addPostSubtarget("bar");

        expect(
          () => foo.addPostSubtarget("bar")
        ).toThrowError("bar is already a post-subtarget of foo");

        expect(foo.deepTargets).toEqual(["bar"]);
      });

      it(`called with "bar" after having "bar" as a subtarget throws`, () => {
        foo.addSubtarget("bar");

        expect(
          () => foo.addPostSubtarget("bar")
        ).toThrowError("bar is already a subtarget of foo");

        expect(foo.deepTargets).toEqual(["bar"]);
      });

      it(`called with "main" throws`, () => {
        expect(
          () => foo.addPostSubtarget("main")
        ).toThrowError("Cannot include main target");
      });

      it(`called with "foo" throws`, () => {
        expect(
          () => foo.addPostSubtarget("foo")
        ).toThrowError("Cannot include this as its own subtarget");
      });

      it(`called with "bar" after the set's "bar" promise has "foo" as a dependency throws`, () => {
        const bar = bpSet.get("bar");
        bar.addPostSubtarget("foo");

        expect(
          () => foo.addPostSubtarget("bar")
        ).toThrowError(`"bar" already has a dependency on "foo"`);
      });

      it("called with a three-deep cycle throws", () => {
        const bar = bpSet.get("bar");
        const wop = bpSet.get("wop");

        bar.addPostSubtarget("wop");
        wop.addPostSubtarget("foo");

        expect(
          () => foo.addPostSubtarget("bar")
        ).toThrowError(`"bar" already has a dependency on "foo"`);
      });
    });

    describe(".addTask()", () => {
      it("will add a task without invoking it", () => {
        const spy = jasmine.createSpy();
        foo.addTask(spy);
        expect(spy).toHaveBeenCalledTimes(0);

        expect(foo.deepTargets).toEqual([]);
      });

      it("can add multiple tasks", () => {
        const spy1 = jasmine.createSpy();
        foo.addTask(spy1);

        const spy2 = jasmine.createSpy();
        foo.addTask(spy2);

        expect(spy1).toHaveBeenCalledTimes(0);
        expect(spy2).toHaveBeenCalledTimes(0);

        expect(foo.deepTargets).toEqual([]);
      });

      it("will throw if bpSet.markReady() has been called", () => {
        const spy = jasmine.createSpy();
        bpSet.markReady();
        expect(
          () => foo.addTask(spy)
        ).toThrowError("Build step has started");
      });

      it("will throw if bpSet.markClosed() has been called", () => {
        const spy = jasmine.createSpy();
        bpSet.markClosed();
        expect(
          () => foo.addTask(spy)
        ).toThrowError("Build step has started");
      });
    });

    it(".run() throws", async () => {
      await expectAsync(
        foo.run()
      ).toBeRejectedWithError("Build promises are not running!");

      expect(bpSet.status).toBe("errored");
    });
  });

  describe("Without starting, BuildPromiseSet.main", () => {
    let main: Readonly<BuildPromise>;
    beforeEach(() => main = bpSet.main);

    it("starts with an empty list of deepTargets", () => {
      expect(main.deepTargets).toEqual([]);
    });

    describe(".addSubtarget()", () => {
      it("cannot be called until we call bpSet.markReady()", () => {
        expect(
          () => main.addSubtarget("foo")
        ).toThrowError("Cannot attach targets to main target until we are ready (call BuildPromiseSet.markReady())");

        bpSet.get("foo");
        bpSet.markReady();

        expect(
          () => main.addSubtarget("foo")
        ).not.toThrow();

        expect(main.deepTargets).toEqual(["foo"]);
      });

      it("throws with an unknown target", () => {
        expect(
          () => main.addSubtarget("foo")
        ).toThrowError("Cannot attach targets to main target until we are ready (call BuildPromiseSet.markReady())");

        bpSet.markReady();

        expect(
          () => main.addSubtarget("foo")
        ).toThrowError(`Cannot add an undefined target "foo" to main!`);

        expect(main.deepTargets).toEqual([]);
      });
    });

    describe(".addPostSubtarget()", () => {
      it("cannot be called until we call bpSet.markReady()", () => {
        expect(
          () => main.addPostSubtarget("foo")
        ).toThrowError("Cannot attach targets to main target until we are ready (call BuildPromiseSet.markReady())");

        bpSet.get("foo");
        bpSet.markReady();

        expect(
          () => main.addPostSubtarget("foo")
        ).not.toThrow();

        expect(main.deepTargets).toEqual(["foo"]);
      });

      it("throws with an unknown target", () => {
        expect(
          () => main.addPostSubtarget("foo")
        ).toThrowError("Cannot attach targets to main target until we are ready (call BuildPromiseSet.markReady())");

        bpSet.markReady();

        expect(
          () => main.addPostSubtarget("foo")
        ).toThrowError(`Cannot add an undefined target "foo" to main!`);

        expect(main.deepTargets).toEqual([]);
      });
    });
  });

  describe("Without starting, BuildPromiseSet.main.addTask()", () => {
    let main: Readonly<BuildPromise>;
    beforeEach(() => main = bpSet.main);

    it("will add a task without invoking it", () => {
      const spy = jasmine.createSpy();
      main.addTask(spy);
      expect(spy).toHaveBeenCalledTimes(0);

      expect(main.deepTargets).toEqual([]);
    });

    it("can add multiple tasks", () => {
      const spy1 = jasmine.createSpy();
      main.addTask(spy1);

      const spy2 = jasmine.createSpy();
      main.addTask(spy2);

      expect(spy1).toHaveBeenCalledTimes(0);
      expect(spy2).toHaveBeenCalledTimes(0);

      expect(main.deepTargets).toEqual([]);
    });

    it("will throw if bpSet.markReady() has been called", () => {
      const spy = jasmine.createSpy();
      bpSet.markReady();
      expect(
        () => main.addTask(spy)
      ).toThrowError("Build step has started");
    });

    it("will throw if bpSet.markClosed() has been called", () => {
      const spy = jasmine.createSpy();
      bpSet.markClosed();
      expect(
        () => main.addTask(spy)
      ).toThrowError("Build step has started");
    });
  });

  describe("BuildPromiseSet.main.run()", () => {
    let main: Readonly<BuildPromise>;
    beforeEach(() => main = bpSet.main);

    it("throws before bpSet.markReady() is called", async () => {
      await expectAsync(
        main.run()
      ).toBeRejectedWithError("Build promises are not running!")
    });

    it("throws after bpSet.markClosed() is called", async () => {
      bpSet.markClosed();
      await expectAsync(
        main.run()
      ).toBeRejectedWithError("Build promises are not running!")
    });

    it("does not throw after bpSet.markReady() is called", async () => {
      bpSet.markReady();
      await expectAsync(
        main.run()
      ).toBeResolved();
    });

    it("runs a full tree of successful tasks, once", async () => {
      const task1 = createSpyPromise(true, {}),
            task2 = createSpyPromise(true, {}),
            task3 = createSpyPromise(true, {}),
            task4 = createSpyPromise(true, {}),
            task5 = createSpyPromise(true, {}),
            task6 = createSpyPromise(true, {}),
            task7 = createSpyPromise(true, {});

      const alpha   = bpSet.get("alpha");
      const beta    = bpSet.get("beta");
      const gamma   = bpSet.get("gamma");
      const delta   = bpSet.get("delta");
      const epsilon = bpSet.get("epsilon");

      gamma.addTask(task1);
      alpha.addSubtarget("gamma");

      alpha.addTask(task2);
      alpha.addTask(task3);

      epsilon.addTask(task4);
      alpha.addPostSubtarget("epsilon");

      delta.addTask(task5);
      delta.addTask(task6);

      beta.addSubtarget("delta");
      beta.addTask(task7);

      bpSet.markReady();
      bpSet.main.addSubtarget("alpha");
      bpSet.main.addSubtarget("beta");

      await expectAsync(
        bpSet.main.run()
      ).toBeResolved();

      expect(task1).toHaveBeenCalledOnceWith();
      expect(task2).toHaveBeenCalledOnceWith();
      expect(task3).toHaveBeenCalledOnceWith();
      expect(task4).toHaveBeenCalledOnceWith();
      expect(task5).toHaveBeenCalledOnceWith();
      expect(task6).toHaveBeenCalledOnceWith();
      expect(task7).toHaveBeenCalledOnceWith();

      expect(task1).toHaveBeenCalledBefore(task2);
      expect(task2).toHaveBeenCalledBefore(task3);
      expect(task3).toHaveBeenCalledBefore(task4);
      expect(task4).toHaveBeenCalledBefore(task5);
      expect(task5).toHaveBeenCalledBefore(task6);
      expect(task6).toHaveBeenCalledBefore(task7);

      expect(bpSet.status).toBe("completed");

      await expectAsync(
        bpSet.main.run()
      ).toBeResolved();

      expect(task1).toHaveBeenCalledOnceWith();
      expect(task2).toHaveBeenCalledOnceWith();
      expect(task3).toHaveBeenCalledOnceWith();
      expect(task4).toHaveBeenCalledOnceWith();
      expect(task5).toHaveBeenCalledOnceWith();
      expect(task6).toHaveBeenCalledOnceWith();
      expect(task7).toHaveBeenCalledOnceWith();

      expect(bpSet.status).toBe("completed");
    });

    it("runs a full tree of tasks, until there is a failure", async () => {
      const errObject = {};
      const task1 = createSpyPromise(true, {}),
            task2 = createSpyPromise(true, {}),
            task3 = createSpyPromise(false, errObject),
            task4 = createSpyPromise(true, {}),
            task5 = createSpyPromise(true, {}),
            task6 = createSpyPromise(true, {}),
            task7 = createSpyPromise(true, {});

      const alpha = bpSet.get("alpha");
      const beta  = bpSet.get("beta");
      const gamma = bpSet.get("gamma");
      const delta = bpSet.get("delta");
      const epsilon = bpSet.get("epsilon");

      gamma.addTask(task1);
      alpha.addSubtarget("gamma");

      alpha.addTask(task2);
      alpha.addTask(task3);

      epsilon.addTask(task4);
      alpha.addPostSubtarget("epsilon");

      delta.addTask(task5);
      delta.addTask(task6);

      beta.addSubtarget("delta");
      beta.addTask(task7);

      bpSet.markReady();
      bpSet.main.addSubtarget("alpha");
      bpSet.main.addSubtarget("beta");

      await expectAsync(
        bpSet.main.run()
      ).toBeRejectedWith(errObject);

      expect(task1).toHaveBeenCalledOnceWith();
      expect(task2).toHaveBeenCalledOnceWith();
      expect(task3).toHaveBeenCalledOnceWith();
      expect(task4).toHaveBeenCalledTimes(0);
      expect(task5).toHaveBeenCalledTimes(0);
      expect(task6).toHaveBeenCalledTimes(0);
      expect(task7).toHaveBeenCalledTimes(0);

      expect(task1).toHaveBeenCalledBefore(task2);
      expect(task2).toHaveBeenCalledBefore(task3);

      expect(bpSet.status).toBe("errored");

      await expectAsync(
        bpSet.main.run()
      ).toBeRejectedWith(errObject);

      expect(task1).toHaveBeenCalledOnceWith();
      expect(task2).toHaveBeenCalledOnceWith();
      expect(task3).toHaveBeenCalledOnceWith();
      expect(task4).toHaveBeenCalledTimes(0);
      expect(task5).toHaveBeenCalledTimes(0);
      expect(task6).toHaveBeenCalledTimes(0);
      expect(task7).toHaveBeenCalledTimes(0);

      expect(bpSet.status).toBe("errored");
    });
  });
});
