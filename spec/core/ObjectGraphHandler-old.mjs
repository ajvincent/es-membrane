import ObjectGraphHandler from "../../source/core/ObjectGraphHandler-old.mjs";
import {
  allTraps,
} from "../../source/core/utilities/shared.mjs";

/* Writing a full set of unit tests for ObjectGraphHandler is impossible.
   There are so many things ObjectGraphHandler does that in its ProxyHandler traps alone
   with so many side effects that those are more suited to the integration tests
   we already have.

   This is yet another reason why ObjectGraph.mjs and source/ProxyHandlers/*.mjs are so
   important.  Those are small enough to be unit-testable.

   But there are some small public functions that we can unit-test.  This file is for those
   tests.
*/

describe("ObjectGraphHandler()", () => {
  let handler, membrane;

  beforeEach(() => {
    membrane = {};
    handler = new ObjectGraphHandler(membrane, "wet");
  });

  it("class is frozen", () => {
    expect(Object.isFrozen(ObjectGraphHandler)).toBe(true);
    expect(Object.isFrozen(ObjectGraphHandler.prototype)).toBe(true);
  });

  it("implements all ProxyHandler traps", () => {
    allTraps.forEach(
      trap => expect(typeof handler[trap]).toBe("function")
    );
  });

  it("has the membrane and the graphName", () => {
    const mDesc = Reflect.getOwnPropertyDescriptor(handler, "membrane");
    expect(mDesc).toEqual({
      value: membrane,
      writable: false,
      enumerable: true,
      configurable: false
    });

    const gDesc = Reflect.getOwnPropertyDescriptor(handler, "graphName");
    expect(gDesc).toEqual({
      value: "wet",
      writable: false,
      enumerable: true,
      configurable: false
    });
  });

  it("is not extensible", () => {
    expect(Reflect.isExtensible(handler)).toBe(false);
  });

  it("is not initially dead", () => {
    expect(handler.dead).toBe(false);
  });

  describe("proxy listeners", () => {
    it("start out as an empty array", () => {
      expect(handler.getProxyListeners()).toEqual([]);
    });

    it("gets a different array every time", () => {
      const a = handler.getProxyListeners();
      const b = handler.getProxyListeners();
      expect(a).toEqual(b);
      expect(a).not.toBe(b);
    });

    /* Under the hood, ObjectGraphHandler's proxyListeners is a FunctionSet("deferred"),
       with an .observe() call in notifyProxyListeners().  So when we call it, it will
       notify the current set correctly.
    */

    it("tracks a listener accurately", () => {
      const callback1 = jasmine.createSpy("callback1");
      handler.addProxyListener(callback1);
      expect(handler.getProxyListeners()).toEqual([callback1]);

      const callback2 = jasmine.createSpy("callback2");
      handler.addProxyListener(callback2);
      expect(handler.getProxyListeners()).toEqual([callback1, callback2]);

      handler.addProxyListener(callback2);
      expect(handler.getProxyListeners()).toEqual([callback1, callback2]);

      handler.removeProxyListener(callback1);
      expect(handler.getProxyListeners()).toEqual([callback2]);

      expect(callback1).toHaveBeenCalledTimes(0);
      expect(callback2).toHaveBeenCalledTimes(0);
    });

    it("notifies listeners in order", () => {
      const callback1 = jasmine.createSpy("callback1");
      handler.addProxyListener(callback1);
      callback1.and.returnValue(1);

      const callback2 = jasmine.createSpy("callback2");
      handler.addProxyListener(callback2);
      callback2.and.returnValue(2);

      const message = {};
      expect(handler.notifyProxyListeners(message)).toEqual([1, 2]);

      expect(callback1).toHaveBeenCalledOnceWith(message);
      expect(callback2).toHaveBeenCalledOnceWith(message);
      expect(callback1).toHaveBeenCalledBefore(callback2);
    });
  });

  describe("revoker functions", () => {
    /* In the real implementation, membrane.revokerMultiMap is a RevocableMultiMap,
       so this is guaranteed to work via the unit tests for RevocableMultiMap.
    */
    it(".addRevocable() stores the revoker function", () => {
      membrane.revokerMultiMap = jasmine.createSpyObj(
        "revokerMultiMap",
        [
          "set",
        ]
      );

      const revoker = jasmine.createSpy("revoker");
      handler.addRevocable(revoker);

      expect(membrane.revokerMultiMap.set).toHaveBeenCalledOnceWith(handler, revoker);
      expect(revoker).toHaveBeenCalledTimes(0);
    });

    it(".revokeEverything() marks the object graph dead and calls revoker functions", () => {
      membrane.revokerMultiMap = jasmine.createSpyObj(
        "revokerMultiMap",
        [
          "set",
          "revoke",
        ]
      );

      const revoker = jasmine.createSpy("revoker");
      handler.addRevocable(revoker);
      membrane.revokerMultiMap.set.calls.reset();

      handler.revokeEverything();

      expect(membrane.revokerMultiMap.set).toHaveBeenCalledTimes(0);
      expect(membrane.revokerMultiMap.revoke).toHaveBeenCalledOnceWith(handler);
      expect(revoker).toHaveBeenCalledTimes(0); // this is because the revokerMultiMap is a spy object

      expect(handler.dead).toBe(true);

      // throwIfDead() tests
      const DEAD = "This membrane handler is dead!";
      const publicMethods = allTraps.concat([
        "addProxyListener",
        "removeProxyListener",
        "getProxyListeners",
        "notifyProxyListeners",
        "addRevocable",
        "revokeEverything",
      ]);
      publicMethods.forEach(method => {
        expect(() => handler[method]()).toThrowError(DEAD);
      });
    });
  });
});
