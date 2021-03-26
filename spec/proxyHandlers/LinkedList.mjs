import {
  LinkedListNode,
  LinkedListManager,
} from "../../source/ProxyHandlers/LinkedList.mjs";

import Membrane from "../../source/core/Membrane.mjs";

import {
  expectValueDescriptor
} from "../helpers/expectDataDescriptor.mjs";

const objectGraph = {};

describe("LinkedListNode", () => {
  let node;
  beforeEach(() => {
    node = new LinkedListNode(objectGraph);
  });

  it("class is frozen", () => {
    expect(Object.isFrozen(LinkedListNode)).toBe(true);
    expect(Object.isFrozen(LinkedListNode.prototype)).toBe(true);
  });

  xit("is exposed on Membrane", () => {
    const desc = Reflect.getOwnPropertyDescriptor(Membrane, "LinkedListNode");
    expectValueDescriptor(LinkedListNode, false, true, false, desc);
  });

  it("has the object graph property", () => {
    const desc = Reflect.getOwnPropertyDescriptor(node, "objectGraph");
    expectValueDescriptor(objectGraph, false, true, false, desc);
  });

  it("forwards invokeNextHandler to its NextHandlerMap", () => {
    const handler = jasmine.createSpyObj("handler", ["ownKeys"]);

    // allowed because it's a package property
    node.nextHandlerMap.setDefault("ownKeys", handler);

    const shadowTarget = {};
    const args = [{}, {}, {}];
    const rv = {};
    handler.ownKeys.and.returnValue(rv);

    expect(node.invokeNextHandler("ownKeys", shadowTarget, ...args)).toBe(rv);
    expect(handler.ownKeys).toHaveBeenCalledOnceWith(shadowTarget, ...args);
  });
});

describe("LinkedListManager", () => {
  let manager;
  beforeEach(() => manager = new LinkedListManager(objectGraph));
  afterEach(() => manager = null);

  it("class is frozen", () => {
    expect(Object.isFrozen(LinkedListManager)).toBe(true);
    expect(Object.isFrozen(LinkedListManager.prototype)).toBe(true);
  });

  it("instances are frozen", () => {
    expect(Object.isFrozen(manager)).toBe(true);
  });

  it("initially exposes only Reflect as a ProxyHandler that may allow insertions before it", () => {
    expect(manager.getSequence()).toEqual([Reflect]);
    expect(manager.canInsertBefore(Reflect)).toBe(true);
  });

  it(".getSequence() returns copies of its internal array", () => {
    const sequence1 = manager.getSequence();
    const sequence2 = manager.getSequence();
    expect(sequence2).not.toBe(sequence1);
    expect(sequence2).toEqual(sequence1);
  });

  describe(".insertBefore() with no specified shadow target", () => {
    it("accepts (false, new LinkedListNode()) on the first call", () => {
      const handler = new LinkedListNode(objectGraph);
      expect(() => {
        manager.insertBefore(false, handler);
      }).not.toThrow();

      expect(manager.getSequence()).toEqual([handler, Reflect]);
      expect(manager.canInsertBefore(handler)).toBe(false);
    });

    it("accepts (true, new LinkedListNode()) on the first call", () => {
      const handler = new LinkedListNode(objectGraph);
      expect(() => {
        manager.insertBefore(true, handler);
      }).not.toThrow();

      expect(manager.getSequence()).toEqual([handler, Reflect]);
      expect(manager.canInsertBefore(handler)).toBe(true);
    });

    it("accepts (false, new LinkedListNode()) before Reflect", () => {
      const handler1 = new LinkedListNode(objectGraph);
      manager.insertBefore(false, handler1);
      const handler2 = new LinkedListNode(objectGraph);
      expect(() => {
        manager.insertBefore(false, handler2);
      }).not.toThrow();

      expect(manager.getSequence()).toEqual([handler1, handler2, Reflect]);
      expect(manager.canInsertBefore(handler2)).toBe(false);
    });

    it("accepts (true, new LinkedListNode()) before Reflect", () => {
      const handler1 = new LinkedListNode(objectGraph);
      manager.insertBefore(false, handler1);
      const handler2 = new LinkedListNode(objectGraph);
      expect(() => {
        manager.insertBefore(false, handler2);
      }).not.toThrow();

      expect(manager.getSequence()).toEqual([handler1, handler2, Reflect]);
      expect(manager.canInsertBefore(handler2)).toBe(false);
    });

    it("accepts (false, new LinkedListNode()) before another handler that allows insertBefore", () => {
      const handler1 = new LinkedListNode(objectGraph);
      manager.insertBefore(true, handler1);
      const handler2 = new LinkedListNode(objectGraph);
      expect(() => {
        manager.insertBefore(true, handler2, handler1);
      }).not.toThrow();

      expect(manager.getSequence()).toEqual([handler2, handler1, Reflect]);
      expect(manager.canInsertBefore(handler2)).toBe(true);
    });

    it("throws on (true, new LinkedListNode()) before another handler that rejects insertBefore", () => {
      const handler1 = new LinkedListNode(objectGraph);
      manager.insertBefore(false, handler1);
      const handler2 = new LinkedListNode(objectGraph);
      expect(() => {
        manager.insertBefore(false, handler2, handler1);
      }).toThrowError("No handler may be inserted immediately before the current handler!");

      expect(manager.getSequence()).toEqual([handler1, Reflect]);
    });

    it("throws when mayInsertBefore is not a boolean", () => {
      const handler = new LinkedListNode(objectGraph);
      expect(() => {
        manager.insertBefore(null, handler);
      }).toThrowError("mayInsertBefore must be a boolean!");

      expect(manager.getSequence()).toEqual([Reflect]);
    });

    it("throws when the handler is not a LinkedListNode", () => {
      expect(() => {
        manager.insertBefore(true, {});
      }).toThrowError("newHandler must be a LinkedListNode!");

      expect(manager.getSequence()).toEqual([Reflect]);
    });

    it("throws when the handler has a different object graph", () => {
      const handler = new LinkedListNode({});
      expect(() => {
        manager.insertBefore(true, handler);
      }).toThrowError("newHandler must share the same object graph as the LinkedListManager!");

      expect(manager.getSequence()).toEqual([Reflect]);
    });

    it("throws for an unknown currentHandler", () => {
      const handler = new LinkedListNode(objectGraph);
      expect(() => {
        manager.insertBefore(true, handler, {});
      }).toThrowError("Current handler not found in sequence of LinkedListNode objects!");

      expect(manager.getSequence()).toEqual([Reflect]);
    });
  });
});
