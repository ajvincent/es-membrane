import Membrane from "../../source/core/Membrane.mjs";
import {
  AccessorDescriptor,
  DataDescriptor,
} from "../../source/core/utilities/shared.mjs";

import {
  expectValueDescriptor,
} from "../helpers/expectDataDescriptor.mjs";

describe("Proxy entry notifiers", () => {
  let membrane, wetGraph, dryGraph, wetFunction, dryFunction, wetReturn;
  const wetObserver = jasmine.createSpy("observer");

  beforeEach(() => {
    membrane = new Membrane();
    wetGraph = membrane.getGraphByName("wet", { mustCreate: true });
    dryGraph = membrane.getGraphByName("dry", { mustCreate: true });

    wetFunction = function() {};
    dryFunction = membrane.convertArgumentToProxy(wetGraph, dryGraph, wetFunction);

    wetObserver.calls.reset();
    wetObserver.and.stub();

    wetReturn = {};
  });

  afterEach(() => {
    wetGraph.revokeEverything();
    dryGraph.revokeEverything();

    membrane = null;
    wetGraph = null;
    dryGraph = null;

    wetFunction = null;
    dryFunction = null;
    wetReturn = null;
  });

  function expectMessage(message, entryTarget, trapName, entryPoint, proxyTarget, getOrSet = null, convertToDry = false) {
    if (!message) {
      fail("We expected a message and didn't get one");
      return;
    }

    expect(Reflect.ownKeys(message)).toEqual([
      "entryTarget",
      "trapName",
      "entryPoint",
      "proxyTarget",
      "getOrSet",
    ]);

    expectValueDescriptor(
      entryTarget, false, true, false, Reflect.getOwnPropertyDescriptor(message, "entryTarget")
    );
    expectValueDescriptor(
      trapName, false, true, false, Reflect.getOwnPropertyDescriptor(message, "trapName")
    );
    expectValueDescriptor(
      entryPoint, false, true, false, Reflect.getOwnPropertyDescriptor(message, "entryPoint")
    );

    if (convertToDry)
      proxyTarget = membrane.convertArgumentToProxy(wetGraph, dryGraph, proxyTarget);
    else
      proxyTarget = membrane.convertArgumentToProxy(dryGraph, wetGraph, proxyTarget);
    expectValueDescriptor(
      proxyTarget, false, true, false, Reflect.getOwnPropertyDescriptor(message, "proxyTarget")
    );

    expectValueDescriptor(
      getOrSet, false, true, false, Reflect.getOwnPropertyDescriptor(message, "getOrSet")
    );

    expect(Object.isFrozen(message)).toBe(true);
  }

  describe("can trigger for", () => {
    describe("defining a property via", () => {
      beforeEach(() => {
        membrane.proxyEntryNotifier.setEntryObserver(
          wetGraph, "defineProperty", wetFunction, wetObserver
        );
      });

      it("assignment", () => {
        const dryProperty = { color: "red" };
        dryFunction.default = dryProperty;

        expect(wetObserver).toHaveBeenCalledTimes(1);
        const args = wetObserver.calls.first().args;
        expect(args.length).toBe(1);

        const message = args[0];
        expectMessage(message, wetFunction, "defineProperty", "default", dryProperty);
      });

      it("Reflect.defineProperty with a data descriptor", () => {
        const dryProperty = { color: "red" };
        const desc = new DataDescriptor(dryProperty, false, true, true);
        Reflect.defineProperty(dryFunction, "default", desc);

        expect(wetObserver).toHaveBeenCalledTimes(1);
        const args = wetObserver.calls.first().args;
        expect(args.length).toBe(1);

        const message = args[0];
        expectMessage(message, wetFunction, "defineProperty", "default", dryProperty);
      });

      it("Reflect.defineProperty with an accessor descriptor", () => {
        let dryProperty = { color: "red" };
        const dryGet = () => dryProperty;
        const drySet = val => dryProperty = val;

        const desc = new AccessorDescriptor(dryGet, drySet, true, true);

        Reflect.defineProperty(dryFunction, "default", desc);

        expect(wetObserver).toHaveBeenCalledTimes(2);
        {
          const args = wetObserver.calls.argsFor(0);
          expect(args.length).toBe(1);

          const message = args[0];
          expectMessage(message, wetFunction, "defineProperty", "default", dryGet, "get");
        }

        {
          const args = wetObserver.calls.argsFor(1);
          expect(args.length).toBe(1);

          const message = args[0];
          expectMessage(message, wetFunction, "defineProperty", "default", drySet, "set");
        }
      });
    });

    describe("replacing a property via", () => {
      beforeEach(() => {
        membrane.proxyEntryNotifier.setEntryObserver(
          wetGraph, "defineProperty", wetFunction, wetObserver
        );

        const desc = new DataDescriptor({ color: "blue" }, true, true, true);
        Reflect.defineProperty(dryFunction, "default", desc);

        wetObserver.calls.reset();
      });

      it("assignment", () => {
        const dryProperty = { color: "red" };
        dryFunction.default = dryProperty;

        expect(wetObserver).toHaveBeenCalledTimes(1);
        const args = wetObserver.calls.first().args;
        expect(args.length).toBe(1);

        const message = args[0];
        expectMessage(message, wetFunction, "defineProperty", "default", dryProperty);
      });

      it("Reflect.defineProperty with a data descriptor", () => {
        const dryProperty = { color: "red" };
        const desc = new DataDescriptor(dryProperty, false, true, true);
        Reflect.defineProperty(dryFunction, "default", desc);

        expect(wetObserver).toHaveBeenCalledTimes(1);
        const args = wetObserver.calls.first().args;
        expect(args.length).toBe(1);

        const message = args[0];
        expectMessage(message, wetFunction, "defineProperty", "default", dryProperty);
      });

      it("Reflect.defineProperty with an accessor descriptor", () => {
        let dryProperty = { color: "red" };
        const dryGet = () => dryProperty;
        const drySet = val => dryProperty = val;

        const desc = new AccessorDescriptor(dryGet, drySet, true, true);

        Reflect.defineProperty(dryFunction, "default", desc);

        expect(wetObserver).toHaveBeenCalledTimes(2);
        {
          const args = wetObserver.calls.argsFor(0);
          expect(args.length).toBe(1);

          const message = args[0];
          expectMessage(message, wetFunction, "defineProperty", "default", dryGet, "get");
        }

        {
          const args = wetObserver.calls.argsFor(1);
          expect(args.length).toBe(1);

          const message = args[0];
          expectMessage(message, wetFunction, "defineProperty", "default", drySet, "set");
        }
      });
    });

    describe("proxies which cannot receive any more properties via", () => {
      beforeEach(() => {
        membrane.proxyEntryNotifier.setEntryObserver(
          wetGraph, "defineProperty", wetFunction, wetObserver
        );

        Reflect.preventExtensions(wetFunction);
      });

      it("assignment", () => {
        const dryProperty = { color: "red" };
        expect(() => {
          dryFunction.default = dryProperty;
        }).toThrow();

        expect(wetObserver).toHaveBeenCalledTimes(1);
        const args = wetObserver.calls.first().args;
        expect(args.length).toBe(1);

        const message = args[0];
        expectMessage(message, wetFunction, "defineProperty", "default", dryProperty);
      });

      it("Reflect.defineProperty with a data descriptor", () => {
        const dryProperty = { color: "red" };
        const desc = new DataDescriptor(dryProperty, false, true, true);
        Reflect.defineProperty(dryFunction, "default", desc);

        expect(wetObserver).toHaveBeenCalledTimes(1);
        const args = wetObserver.calls.first().args;
        expect(args.length).toBe(1);

        const message = args[0];
        expectMessage(message, wetFunction, "defineProperty", "default", dryProperty);
      });

      it("Reflect.defineProperty with an accessor descriptor", () => {
        let dryProperty = { color: "red" };
        const dryGet = () => dryProperty;
        const drySet = val => dryProperty = val;

        const desc = new AccessorDescriptor(dryGet, drySet, true, true);

        Reflect.defineProperty(dryFunction, "default", desc);

        expect(wetObserver).toHaveBeenCalledTimes(2);
        {
          const args = wetObserver.calls.argsFor(0);
          expect(args.length).toBe(1);

          const message = args[0];
          expectMessage(message, wetFunction, "defineProperty", "default", dryGet, "get");
        }

        {
          const args = wetObserver.calls.argsFor(1);
          expect(args.length).toBe(1);

          const message = args[0];
          expectMessage(message, wetFunction, "defineProperty", "default", drySet, "set");
        }
      });
    });

    it("a function call", () => {
      const dryArgs = [{}, {}, {}];

      wetFunction = function() { return wetReturn; };
      dryFunction = membrane.convertArgumentToProxy(wetGraph, dryGraph, wetFunction);

      membrane.proxyEntryNotifier.setEntryObserver(
        wetGraph, "apply", wetFunction, wetObserver
      );

      const dryObserver = jasmine.createSpy("dryObserver");
      membrane.proxyEntryNotifier.setEntryObserver(
        dryGraph, "apply", dryFunction, dryObserver
      );

      const dryReturn = dryFunction(...dryArgs);

      expect(wetObserver).toHaveBeenCalledTimes(3);
      dryArgs.forEach((dryArgument, index) => {
        const args = wetObserver.calls.argsFor(index);
        expect(args.length).toBe(1);

        const message = args[0];
        expectMessage(message, wetFunction, "apply", index, dryArgument);
      });

      expect(dryObserver).toHaveBeenCalledTimes(1)
      {
        const args = dryObserver.calls.argsFor(0);
        expect(args.length).toBe(1);

        const message = args[0];
        expectMessage(message, dryFunction, "apply", "return", dryReturn, null, true);
      }
    });

    it("a method's arguments and 'this' object", () => {
      wetFunction = function() { return wetReturn; };
      dryFunction = membrane.convertArgumentToProxy(wetGraph, dryGraph, wetFunction);

      const wetObject = { method: wetFunction };
      const dryObject = membrane.convertArgumentToProxy(wetGraph, dryGraph, wetObject);

      const dryArgs = [{}, {}, {}];

      membrane.proxyEntryNotifier.setEntryObserver(
        wetGraph, "apply", wetFunction, wetObserver
      );

      const dryObserver = jasmine.createSpy("dryObserver");
      membrane.proxyEntryNotifier.setEntryObserver(
        dryGraph, "apply", dryFunction, dryObserver
      );

      const dryReturn = dryObject.method(...dryArgs);

      /* By invoking dryFunction as dryObject.method(), we already populated the dryObject
         proxy.  So the membrane won't notify for dryObject.
      */
      expect(wetObserver).toHaveBeenCalledTimes(3);
      dryArgs.forEach((dryArgument, index) => {
        const args = wetObserver.calls.argsFor(index);
        expect(args.length).toBe(1);

        const message = args[0];
        expectMessage(message, wetFunction, "apply", index, dryArgument);
      });

      expect(dryObserver).toHaveBeenCalledTimes(1)
      {
        const args = dryObserver.calls.argsFor(0);
        expect(args.length).toBe(1);

        const message = args[0];
        expectMessage(message, dryFunction, "apply", "return", dryReturn, null, true);
      }
    });

    it("a constructor's arguments", () => {
      const dryArgs = [{}, {}, {}];

      membrane.proxyEntryNotifier.setEntryObserver(
        wetGraph, "construct", wetFunction, wetObserver
      );

      const dryObserver = jasmine.createSpy("dryObserver");
      membrane.proxyEntryNotifier.setEntryObserver(
        dryGraph, "construct", dryFunction, dryObserver
      );

      const dryReturn = new dryFunction(...dryArgs);

      expect(wetObserver).toHaveBeenCalledTimes(3);
      dryArgs.forEach((dryArgument, index) => {
        const args = wetObserver.calls.argsFor(index);
        expect(args.length).toBe(1);

        const message = args[0];
        expectMessage(message, wetFunction, "construct", index, dryArgument);
      });

      expect(dryObserver).toHaveBeenCalledTimes(1);
      {
        const args = dryObserver.calls.argsFor(0);
        expect(args.length).toBe(1);

        const message = args[0];
        expectMessage(message, dryFunction, "construct", "return", dryReturn, null, true);
      }
    });

    it("setting a prototype", () => {
      const dryProto = {
        method: function() {
          return 3;
        }
      }
      membrane.proxyEntryNotifier.setEntryObserver(
        wetGraph, "setPrototypeOf", wetFunction, wetObserver
      );

      Object.setPrototypeOf(dryFunction, dryProto);

      expect(wetObserver).toHaveBeenCalledTimes(1);
      const args = wetObserver.calls.first().args;
      expect(args.length).toBe(1);

      const message = args[0];
      expectMessage(message, wetFunction, "setPrototypeOf", null, dryProto);
    });

    it("a proxy entering a graph more than once before the membrane populates it", () => {
      membrane.proxyEntryNotifier.setEntryObserver(
        wetGraph, "defineProperty", wetFunction, wetObserver
      );

      const dryProperty = { color: "red" };
      dryFunction.default = dryProperty;
      dryFunction.default = dryProperty;

      expect(wetObserver).toHaveBeenCalledTimes(2);
      const count = wetObserver.calls.count();
      for (let i = 0; i < count; i++) {
        const args = wetObserver.calls.argsFor(i);
        expect(args.length).toBe(1);

        const message = args[0];
        expectMessage(message, wetFunction, "defineProperty", "default", dryProperty);
      }
    });
  });

  describe("do not trigger for", () => {
    it("populated proxies", () => {
      membrane.proxyEntryNotifier.setEntryObserver(
        wetGraph, "defineProperty", wetFunction, wetObserver
      );

      const wetProperty = { color: "red" };
      const dryProperty = membrane.convertArgumentToProxy(wetGraph, dryGraph, wetProperty);

      void(Reflect.isExtensible(dryProperty));
      dryFunction.default = dryProperty;

      expect(wetObserver).toHaveBeenCalledTimes(0);
    });

    it("a property in the same object graph", () => {
      membrane.proxyEntryNotifier.setEntryObserver(
        wetGraph, "defineProperty", wetFunction, wetObserver
      );

      const wetProperty = { color: "red" };
      const dryProperty = membrane.convertArgumentToProxy(wetGraph, dryGraph, wetProperty);

      void(Reflect.isExtensible(wetProperty));
      dryFunction.default = dryProperty;

      expect(wetObserver).toHaveBeenCalledTimes(0);
    });

    it("passing in primitive properties to functions", () => {
      const dryArgs = [{}, Symbol("foo"), {}, {}];

      wetFunction = function() { return wetReturn; };
      dryFunction = membrane.convertArgumentToProxy(wetGraph, dryGraph, wetFunction);

      membrane.proxyEntryNotifier.setEntryObserver(
        wetGraph, "apply", wetFunction, wetObserver
      );

      const dryObserver = jasmine.createSpy("dryObserver");
      membrane.proxyEntryNotifier.setEntryObserver(
        dryGraph, "apply", dryFunction, dryObserver
      );

      const dryReturn = dryFunction(...dryArgs);
      dryArgs.splice(1, 1);

      expect(wetObserver).toHaveBeenCalledTimes(3);
      dryArgs.forEach((dryArgument, index) => {
        const args = wetObserver.calls.argsFor(index);
        expect(args.length).toBe(1);

        const message = args[0];
        expectMessage(
          message,
          wetFunction,
          "apply",
          index === 0 ? index : index + 1,
          dryArgument
        );
      });

      expect(dryObserver).toHaveBeenCalledTimes(1)
      {
        const args = dryObserver.calls.argsFor(0);
        expect(args.length).toBe(1);

        const message = args[0];
        expectMessage(message, dryFunction, "apply", "return", dryReturn, null, true);
      }
    });

    it("returning primitive properties from functions", () => {
      const dryArgs = [{}, {}, {}];
      wetReturn = Symbol("foo");

      wetFunction = function() { return wetReturn; };
      dryFunction = membrane.convertArgumentToProxy(wetGraph, dryGraph, wetFunction);

      membrane.proxyEntryNotifier.setEntryObserver(
        wetGraph, "apply", wetFunction, wetObserver
      );

      const dryObserver = jasmine.createSpy("dryObserver");
      membrane.proxyEntryNotifier.setEntryObserver(
        dryGraph, "apply", dryFunction, dryObserver
      );

      void(dryFunction(...dryArgs));

      expect(wetObserver).toHaveBeenCalledTimes(3);
      dryArgs.forEach((dryArgument, index) => {
        const args = wetObserver.calls.argsFor(index);
        expect(args.length).toBe(1);

        const message = args[0];
        expectMessage(message, wetFunction, "apply", index, dryArgument);
      });

      expect(dryObserver).toHaveBeenCalledTimes(0)
    });

    describe("defining a primitive property via", () => {
      const dryProperty = "red";
      beforeEach(() => {
        membrane.proxyEntryNotifier.setEntryObserver(
          wetGraph, "defineProperty", wetFunction, wetObserver
        );
      });

      it("assignment", () => {
        dryFunction.default = dryProperty;

        expect(wetObserver).toHaveBeenCalledTimes(0);
      });

      it("Reflect.defineProperty with a data descriptor", () => {
        const desc = new DataDescriptor(dryProperty, false, true, true);
        Reflect.defineProperty(dryFunction, "default", desc);

        expect(wetObserver).toHaveBeenCalledTimes(0);
      });
    });

    describe("replacing a primitive property via", () => {
      const dryProperty = "red";

      beforeEach(() => {
        membrane.proxyEntryNotifier.setEntryObserver(
          wetGraph, "defineProperty", wetFunction, wetObserver
        );

        const desc = new DataDescriptor({ color: "blue" }, true, true, true);
        Reflect.defineProperty(dryFunction, "default", desc);

        wetObserver.calls.reset();
      });

      it("assignment", () => {
        dryFunction.default = dryProperty;

        expect(wetObserver).toHaveBeenCalledTimes(0);
      });

      it("Reflect.defineProperty with a data descriptor", () => {
        const desc = new DataDescriptor(dryProperty, false, true, true);
        Reflect.defineProperty(dryFunction, "default", desc);

        expect(wetObserver).toHaveBeenCalledTimes(0);
      });
    });
  });

  it("allow setting distortions on a proxy before the membrane populates the proxy", () => {
    membrane.proxyEntryNotifier.setEntryObserver(
      wetGraph, "defineProperty", wetFunction, wetObserver
    );

    wetObserver.and.callFake(message => {
      membrane.modifyRules.storeUnknownAsLocal("wet", message.proxyTarget);
    });

    const dryProperty = { color: "red" };
    dryFunction.default = dryProperty;

    expect(wetObserver).toHaveBeenCalledTimes(1);
    const args = wetObserver.calls.first().args;
    expect(args.length).toBe(1);

    const message = args[0];
    expectMessage(message, wetFunction, "defineProperty", "default", dryProperty);

    wetFunction.default.shape = "box";
    expect(typeof dryFunction.default.shape).toBe("undefined");
  });

  xit("allow adding a proxy entry notifier for invoking callback functions", () => {
    var callbackObserver, wetFunction, wetObject, dryObject, wetResponse, dryCallback;

    wetObserver.and.callFake(message => {
      const actual = membrane.convertArgumentToProxy(wetGraph, dryGraph, message.proxyTarget);
      expect(actual === dryCallback).toBe(true);
      membrane.proxyEntryNotifier.setEntryObserver(
        wetGraph, "apply", message.proxyTarget, callbackObserver
      );
    });

    callbackObserver = jasmine.createSpy("dryObserver");
    callbackObserver.and.callFake(message => {
      void(message);
    });

    wetFunction = function(cb) {
      this.callback = cb;
    }

    wetResponse = {};
    dryCallback = jasmine.createSpy("dryCallback");

    wetObject = {
      method: wetFunction,
      callback: function() {},
    };

    /*
    // comment me out
    dryFunction = membrane.convertArgumentToProxy(wetGraph, dryGraph, wetFunction);
    void(dryFunction); // we're not going to invoke it directly
    */

    membrane.proxyEntryNotifier.setEntryObserver(
      wetGraph, "apply", wetFunction, wetObserver
    );

    dryObject = membrane.convertArgumentToProxy(wetGraph, dryGraph, wetObject);

    dryObject.method(dryCallback);
    expect(wetObserver).toHaveBeenCalledTimes(1);
    if (wetObserver.calls.count() === 1)
    {
      const args = wetObserver.calls.argsFor(0);
      expect(args.length).toBe(1);

      const message = args[0];
      expectMessage(message, wetFunction, "apply", 0, dryCallback);
    }
    expect(callbackObserver).toHaveBeenCalledTimes(0);

    wetObject.callback(wetResponse);

    expect(wetObserver).toHaveBeenCalledTimes(1);
    expect(callbackObserver).toHaveBeenCalledTimes(1);
    {
      const args = callbackObserver.calls.argsFor(0);
      expect(args.length).toBe(1);

      const message = args[0];
      expectMessage(message, dryCallback, "apply", "return", wetResponse, null, true);
    }
  });
});
