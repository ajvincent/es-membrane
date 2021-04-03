import ProxyEntryNotifier from "../../source/core/ProxyEntryNotifier.mjs";

import {
  expectValueDescriptor,
} from "../helpers/expectDataDescriptor.mjs";

describe("ProxyEntryNotifier", () => {
  let cylinderMap, notifier;
  beforeEach(() => {
    cylinderMap = new WeakMap;
    notifier = new ProxyEntryNotifier(cylinderMap);
  });

  afterEach(() => {
    cylinderMap = null;
    notifier = null;
  });

  it("class is frozen", () => {
    expect(Object.isFrozen(ProxyEntryNotifier)).toBe(true);
    expect(Object.isFrozen(ProxyEntryNotifier.prototype)).toBe(true);
  });

  it("instance is frozen", () => {
    expect(Object.isFrozen(notifier)).toBe(true);
  });

  describe("setEntryObserver()", () => {
    const objectGraph = {
      membrane: {
        getMembraneProxy: jasmine.createSpy("getMembraneProxy"),
      },
      graphName: "wet",
    };

    const observer = jasmine.createSpy("observer");

    const entryTarget = {};

    beforeEach(() => {
      objectGraph.membrane.getMembraneProxy.and.returnValue([null, entryTarget]);
      objectGraph.membrane.getMembraneProxy.calls.reset();

      observer.and.stub();
      observer.calls.reset();
    });

    describe("stores an observer for", () => {
      it("the tuple of object graph, trap name and entry target", () => {
        expect(() => {
          notifier.setEntryObserver(objectGraph, "apply", entryTarget, observer);
        }).not.toThrow();

        expect(objectGraph.membrane.getMembraneProxy).toHaveBeenCalledOnceWith("wet", entryTarget);
        expect(observer).toHaveBeenCalledTimes(0);
      });

      it("a different object graph", () => {
        notifier.setEntryObserver(objectGraph, "apply", entryTarget, observer);

        const dryGraph = {
          membrane: {
            getMembraneProxy: jasmine.createSpy("getMembraneProxy"),
          },
          graphName: "dry",
        };
        const dryEntryTarget = {};
        dryGraph.membrane.getMembraneProxy.and.returnValue([null, dryEntryTarget]);

        expect(() => {
          notifier.setEntryObserver(dryGraph, "apply", dryEntryTarget, observer);
        }).not.toThrow();

        expect(objectGraph.membrane.getMembraneProxy).toHaveBeenCalledOnceWith("wet", entryTarget);
        expect(dryGraph.membrane.getMembraneProxy).toHaveBeenCalledOnceWith("dry", dryEntryTarget);
        expect(observer).toHaveBeenCalledTimes(0);
      });

      it("a different trap", () => {
        notifier.setEntryObserver(objectGraph, "apply", entryTarget, observer);

        objectGraph.membrane.getMembraneProxy.calls.reset();

        expect(() => {
          notifier.setEntryObserver(objectGraph, "defineProperty", entryTarget, observer);
        }).not.toThrow();

        expect(objectGraph.membrane.getMembraneProxy).toHaveBeenCalledOnceWith("wet", entryTarget);
        expect(observer).toHaveBeenCalledTimes(0);
      });

      it("a different entry target", () => {
        const firstTarget = {};
        objectGraph.membrane.getMembraneProxy.and.returnValue([null, firstTarget]);
        notifier.setEntryObserver(objectGraph, "apply", firstTarget, observer);

        objectGraph.membrane.getMembraneProxy.calls.reset();
        objectGraph.membrane.getMembraneProxy.and.returnValue([null, entryTarget]);

        expect(() => {
          notifier.setEntryObserver(objectGraph, "apply", entryTarget, observer);
        }).not.toThrow();

        expect(objectGraph.membrane.getMembraneProxy).toHaveBeenCalledOnceWith("wet", entryTarget);
        expect(observer).toHaveBeenCalledTimes(0);
      });
    });

    describe("throws for", () => {
      it("an unknown trap", () => {
        expect(() => {
          notifier.setEntryObserver(objectGraph, "foo", entryTarget, observer)
        }).toThrowError(`Unknown trap "foo"!`);

        expect(objectGraph.membrane.getMembraneProxy).toHaveBeenCalledTimes(0);
        expect(observer).toHaveBeenCalledTimes(0);
      });

      it("a non-function observer", () => {
        expect(() => {
          notifier.setEntryObserver(objectGraph, "apply", entryTarget, {})
        }).toThrowError("observer is not a function!");

        expect(objectGraph.membrane.getMembraneProxy).toHaveBeenCalledTimes(0);
        expect(observer).toHaveBeenCalledTimes(0);
      });

      it("a mismatched membrane proxy", () => {
        objectGraph.membrane.getMembraneProxy.and.returnValue([null, {}]);
        expect(() => {
          notifier.setEntryObserver(objectGraph, "apply", entryTarget, observer)
        }).toThrowError("Entry target does not belong to object graph!");
  
        expect(objectGraph.membrane.getMembraneProxy).toHaveBeenCalledOnceWith("wet", entryTarget);
        expect(observer).toHaveBeenCalledTimes(0);
      });
  
      it("setting an observer twice for the same object graph, trap name and entry target", () => {
        notifier.setEntryObserver(objectGraph, "apply", entryTarget, observer);
  
        expect(() => {
          notifier.setEntryObserver(objectGraph, "apply", entryTarget, observer)
        }).toThrowError("Entry trap has already been set for this object graph, trap name and entry target!");
  
        expect(() => {
          notifier.setEntryObserver(objectGraph, "apply", entryTarget, () => {})
        }).toThrowError("Entry trap has already been set for this object graph, trap name and entry target!");
      });
    });
  });

  describe("notify()", () => {
    const wetGraph = {
      membrane: {
        getMembraneProxy: jasmine.createSpy("getMembraneProxy"),
      },
      graphName: "wet",
    };
    const wetObserver = jasmine.createSpy("observer");
    const wetEntryTarget = {};
    const wetProxy = {};

    const dryGraph = {
      membrane: {
        getMembraneProxy: jasmine.createSpy("getMembraneProxy"),
      },
      graphName: "dry",
    };
    const dryObserver = jasmine.createSpy("observer");
    const dryEntryShadow = {};
    const dryEntryTarget = {};
    const dryProxy = {};

    const entryCylinder = jasmine.createSpyObj("entryCylinder", ["getProxy"]);

    const proxyCylinder = jasmine.createSpyObj("dryCylinder", ["getProxy"]);

    function setWetObserver() {
      notifier.setEntryObserver(wetGraph, "apply", wetEntryTarget, wetObserver);
      entryCylinder.getProxy.and.returnValue(wetEntryTarget);
      proxyCylinder.getProxy.and.returnValue(wetProxy);
    }

    function sendNotify() {
      notifier.notify(wetGraph, dryGraph, dryEntryShadow, "apply", 12, dryProxy);
    }

    function expectMessage(message, entryTarget, trapName, proxyTarget, getOrSet = null) {
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
        12, false, true, false, Reflect.getOwnPropertyDescriptor(message, "entryPoint")
      );
      expectValueDescriptor(
        proxyTarget, false, true, false, Reflect.getOwnPropertyDescriptor(message, "proxyTarget")
      );
      expectValueDescriptor(
        getOrSet, false, true, false, Reflect.getOwnPropertyDescriptor(message, "getOrSet")
      );

      expect(Object.isFrozen(message)).toBe(true);
    }

    beforeEach(() => {
      wetGraph.membrane.getMembraneProxy.and.returnValue([null, wetEntryTarget]);
      wetGraph.membrane.getMembraneProxy.calls.reset();

      dryGraph.membrane.getMembraneProxy.and.returnValue([null, dryEntryTarget]);
      dryGraph.membrane.getMembraneProxy.calls.reset();

      wetObserver.and.stub();
      wetObserver.calls.reset();

      dryObserver.and.stub();
      dryObserver.calls.reset();

      cylinderMap.set(dryEntryTarget, entryCylinder);
      cylinderMap.set(dryEntryShadow, entryCylinder);
      cylinderMap.set(dryProxy,       proxyCylinder);

      entryCylinder.getProxy.calls.reset();
      proxyCylinder.getProxy.calls.reset();
    });

    describe("with the wet observer installed", () => {
      beforeEach(setWetObserver);

      it("notifies the wet observer for a matching source graph, entry object, and trap name", () => {
        sendNotify();

        expect(entryCylinder.getProxy).toHaveBeenCalledOnceWith("wet");
        expect(proxyCylinder.getProxy).toHaveBeenCalledOnceWith("wet");

        expect(wetObserver).toHaveBeenCalledTimes(1);
        const args = wetObserver.calls.first().args;
        expect(args.length).toBe(1);

        const message = args[0];
        expectMessage(message, wetEntryTarget, "apply", wetProxy);
      });

      it("notifies the wet observer with context data for a getter or setter", () => {
        notifier.notify(wetGraph, dryGraph, dryEntryTarget, "apply", 12, dryProxy, "get");

        expect(entryCylinder.getProxy).toHaveBeenCalledOnceWith("wet");
        expect(proxyCylinder.getProxy).toHaveBeenCalledOnceWith("wet");

        expect(wetObserver).toHaveBeenCalledTimes(1);
        const args = wetObserver.calls.first().args;
        expect(args.length).toBe(1);

        const message = args[0];
        expectMessage(message, wetEntryTarget, "apply", wetProxy, "get");
      });

      it("does not call the observer with a different source graph", () => {
        notifier.notify({}, dryGraph, dryEntryTarget, "apply", 12, dryProxy);
        expect(entryCylinder.getProxy).toHaveBeenCalledTimes(0);
        expect(wetObserver).toHaveBeenCalledTimes(0);
      });

      it("does not call the observer with a different entry target", () => {
        notifier.notify(wetGraph, dryGraph, {}, "apply", 12, dryProxy);
        expect(entryCylinder.getProxy).toHaveBeenCalledTimes(0);
        expect(wetObserver).toHaveBeenCalledTimes(0);
      });

      it("does not call the observer with a different trap name", () => {
        notifier.notify(wetGraph, dryGraph, dryEntryTarget, "get", 12, dryProxy);
        expect(entryCylinder.getProxy).toHaveBeenCalledTimes(0);
        expect(wetObserver).toHaveBeenCalledTimes(0);
      });

      it("does not propagate an exception thrown from an observer", () => {
        wetObserver.and.throwError(new Error("whoops"));
        expect(sendNotify).not.toThrow();

        expect(entryCylinder.getProxy).toHaveBeenCalledOnceWith("wet");
        expect(proxyCylinder.getProxy).toHaveBeenCalledOnceWith("wet");

        expect(wetObserver).toHaveBeenCalledTimes(1);
        const args = wetObserver.calls.first().args;
        expect(args.length).toBe(1);

        const message = args[0];
        expectMessage(message, wetEntryTarget, "apply", wetProxy);
      });
    });

    it("with the dry observer installed", () => {
      notifier.setEntryObserver(dryGraph, "apply", dryEntryTarget, dryObserver);
      entryCylinder.getProxy.and.returnValue(dryEntryTarget);
      proxyCylinder.getProxy.and.returnValue(dryProxy);

      sendNotify();

      expect(entryCylinder.getProxy).toHaveBeenCalledOnceWith("dry");
      expect(proxyCylinder.getProxy).toHaveBeenCalledOnceWith("dry");

      expect(dryObserver).toHaveBeenCalledTimes(1);
      const args = dryObserver.calls.first().args;
      expect(args.length).toBe(1);

      const message = args[0];
      expectMessage(message, dryEntryShadow, "apply", dryProxy);
    });

    it("with both the wet and dry observers installed", () => {
      setWetObserver();
      notifier.setEntryObserver(dryGraph, "apply", dryEntryTarget, dryObserver);
      entryCylinder.getProxy.and.returnValues(wetEntryTarget, dryEntryTarget);
      proxyCylinder.getProxy.and.returnValues(wetProxy, dryProxy);

      // testing that an exception thrown in one graph doesn't stop the other graph from running
      wetObserver.and.throwError(new Error("whoops"));

      expect(sendNotify).not.toThrow();

      expect(entryCylinder.getProxy).toHaveBeenCalledTimes(2);
      expect(entryCylinder.getProxy).toHaveBeenCalledWith("wet");
      expect(entryCylinder.getProxy).toHaveBeenCalledWith("dry");

      expect(proxyCylinder.getProxy).toHaveBeenCalledTimes(2);
      expect(proxyCylinder.getProxy).toHaveBeenCalledWith("wet");
      expect(proxyCylinder.getProxy).toHaveBeenCalledWith("dry");

      expect(wetObserver).toHaveBeenCalledTimes(1);
      const wetArgs = wetObserver.calls.first().args;
      expect(wetArgs.length).toBe(1);

      const wetMessage = wetArgs[0];
      expectMessage(wetMessage, wetEntryTarget, "apply", wetProxy);

      expect(dryObserver).toHaveBeenCalledTimes(1);
      const dryArgs = dryObserver.calls.first().args;
      expect(dryArgs.length).toBe(1);

      const dryMessage = dryArgs[0];
      expectMessage(dryMessage, dryEntryTarget, "apply", dryProxy);

      expect(wetMessage === dryMessage).toBe(false);
    });
  });
});
