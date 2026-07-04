import type {
  AbstractClass,
  Class
} from "type-fest";

import type {
  MembraneIfc
} from "../source/types/MembraneIfc.js";

import {
  MockDocumentIfc,
  MockElementIfc,
  MockEventIfc,
  MockEventListenerIfc,
  MockNodeIfc
} from "../fixtures/mock-dom/types/MockDOMInterfaces.js";

import {
  MocksMembrane
} from "./support/MocksMembrane.js";

describe("basic concepts (with two object graphs): ", () => {
  let wetDocument: MockDocumentIfc, dryDocument: MockDocumentIfc, membrane: MembraneIfc;
  let ElementWet: Class<MockElementIfc, [MockDocumentIfc, string]>, ElementDry: Class<MockElementIfc, [MockDocumentIfc, string]>;
  let NodeWet: AbstractClass<MockNodeIfc, [MockDocumentIfc]>, NodeDry: AbstractClass<MockNodeIfc, [MockDocumentIfc]>;

  beforeEach(async () => {
    const parts = await MocksMembrane(new Set(), false);
    membrane = parts.membrane;
    wetDocument = parts.wetDocument;
    NodeWet = parts.NodeWet;
    ElementWet = parts.ElementWet;
    dryDocument = parts.dryDocument;
    NodeDry = parts.NodeDry;
    ElementDry = parts.ElementDry;

    void ElementWet;
    void NodeWet;
  });

  afterEach(() => {
    membrane.revokeEverything();
  });

  it("dryDocument and wetDocument should not be the same", () => {
    expect(dryDocument === wetDocument).toBe(false);
  });

  it("Looking up a primitive on a directly defined value works", ()=> {
    expect(dryDocument.nodeType).toBe(9);
  });

  it("Looking up null through a property name works", function() {
    expect(dryDocument.ownerDocument).toBe(null);
  });

  it("Looking up null through a property getter works", function() {
    expect(dryDocument.firstChild).toBe(null);
  });

  it("Looking up an object twice returns the same object", function() {
    const root1 = dryDocument.rootElement;
    const root2 = dryDocument.rootElement;
    expect(root1 === root2).withContext("same object identity").toBeTrue();
    expect(root1 !== wetDocument.rootElement).withContext("dry !== wet").toBeTrue();
    expect(typeof root1).toBe("object");
    expect(root1 !== null).withContext("root !== null").toBeTrue();
  });

  it("Accessors on a different graph should wrap and unwrap values correctly", function () {
    let extraHolder: object = { isOriginal: true };
    const desc = {
      get: function(): object {
        return extraHolder;
      },

      set: function(val: object) {
        extraHolder = val;
        return val;
      },
      enumerable: true,
      configurable: true
    };

    Reflect.defineProperty(wetDocument, "extra", desc);

    const dryDoc = dryDocument as unknown as Record<"extra", object>;
    const wetDoc = wetDocument as unknown as Record<"extra", object>;

    const unwrappedExtra: object = { isExtra: true };
    dryDoc.extra = unwrappedExtra;
    expect(typeof extraHolder).toBe("object");
    expect(extraHolder).not.toBeNull();
    expect(extraHolder).withContext("setter does not pass through unwrapped").not.toBe(unwrappedExtra);
    expect(extraHolder === unwrappedExtra).withContext("").toBeFalse();

    /* In summary:
     *
     * dryDocument is a proxy, dryDocument.extra is an unwrapped object
     * wetDocument is an unwrapped object, wetDocument.extra is a proxy
     */
    expect(dryDoc.extra).toBe(unwrappedExtra);
    expect(wetDoc.extra).toBe(extraHolder);
    expect(Reflect.get(wetDoc.extra, "isExtra")).toBeTrue();

    const wrappedDesc = Reflect.getOwnPropertyDescriptor(dryDoc, "extra")!;
    expect(typeof wrappedDesc.get).toBe("function");
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(wrappedDesc.get).not.toBe(desc.get);

    expect(typeof wrappedDesc.set).toBe("function");
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(wrappedDesc.set).not.toBe(desc.set);
  });

  it("Accessors on the same graph should wrap and unwrap values correctly", function () {
    let extraHolder: object = { isOriginal: true };
    const desc = {
      get: function(): object {
        return extraHolder;
      },

      set: function(val: object) {
        extraHolder = val;
        return val;
      },
      enumerable: true,
      configurable: true
    };

    Reflect.defineProperty(dryDocument, "extra", desc);

    const dryDoc = dryDocument as unknown as Record<"extra", object>;
    const wetDoc = wetDocument as unknown as Record<"extra", object>;

    const unwrappedExtra: object = { isExtra: true };
    dryDoc.extra = unwrappedExtra;
    expect(typeof extraHolder).toBe("object");
    expect(extraHolder).not.toBeNull();
    expect(extraHolder === unwrappedExtra).withContext("setter does not pass through unwrapped").toBeTrue();

    /* In summary:
     *
     * dryDocument is a proxy, dryDocument.extra is an unwrapped object
     * wetDocument is an unwrapped object, wetDocument.extra is a proxy
     */
    expect(dryDoc.extra).toBe(unwrappedExtra);
    expect(wetDoc.extra).not.toBe(extraHolder);
    expect(Reflect.get(wetDoc.extra, "isExtra")).toBeTrue();
  });

  it("Looking up an cyclic object (a.b.c == a)", function() {
    const root = dryDocument.rootElement;
    const owner = root.ownerDocument;
    expect(dryDocument === owner).toBeTrue();
  });

  it("Looking up an object's prototype works", () => {
    // DocumentWet.prototype
    let wetProto = Reflect.getPrototypeOf(wetDocument)!;
    let dryProto = Reflect.getPrototypeOf(dryDocument)!;
    expect(wetProto === dryProto).toBeFalse();
    expect(dryProto).toBeDefined();
    expect(wetProto).toBeDefined();
    expect(Reflect.getPrototypeOf(dryDocument) === dryProto).toBeTrue();

    expect(Reflect.getOwnPropertyDescriptor(dryProto, "baseURL")).toBeDefined();

    // NodeWet.prototype
    wetProto = Reflect.getPrototypeOf(wetProto)!;
    dryProto = Reflect.getPrototypeOf(dryProto)!;
    expect(wetProto === dryProto).toBeFalse();
    expect(dryProto).toBeDefined();
    expect(wetProto).toBeDefined();

    expect(Reflect.ownKeys(dryProto).includes("firstChild")).toBeTrue();

    // EventTargetWet.prototype
    wetProto = Reflect.getPrototypeOf(wetProto)!;
    dryProto = Reflect.getPrototypeOf(dryProto)!;
    expect(wetProto === dryProto).toBeFalse();
    expect(dryProto).toBeDefined();
    expect(wetProto).toBeDefined();

    expect(Reflect.getOwnPropertyDescriptor(dryProto, "addEventListener")).toBeDefined();

    // Object.prototype
    wetProto = Reflect.getPrototypeOf(wetProto)!;
    dryProto = Reflect.getPrototypeOf(dryProto)!;
    expect(wetProto === dryProto).toBeFalse();
    expect(dryProto).toBeDefined();
    expect(wetProto).toBeDefined();

    expect(Reflect.getOwnPropertyDescriptor(dryProto, "toString")).toBeDefined();

    expect(Reflect.getPrototypeOf(dryProto)).toBeNull();
  });

  it("instanceof operator works within the same graph", () => {
    expect(dryDocument.rootElement instanceof ElementDry).withContext("dryDocument.rootElement instanceof ElementDry").toBeTrue();
    expect(dryDocument.rootElement instanceof NodeDry).withContext("dryDocument.rootElement instanceof NodeDry").toBeTrue();
    expect(dryDocument instanceof NodeDry).withContext("dryDocument instanceof NodeDry").toBeTrue();
    expect(dryDocument instanceof ElementDry).withContext("dryDocument instanceof ElementDry").toBeFalse();
  });

  it("instanceof across different graphs produces weird, inconsistent results", () => {
    /* Symbol.hasInstance is how it works, but remember that is itself a part of Function.prototype,
       so it is itself going through wrap/unwrap operations.

       I need to put some time into understanding the discrepancy better.  There could be a subtle bug I haven't uncovered.
    */

    const dryRoot = dryDocument.rootElement;
    expect(dryRoot instanceof ElementWet).withContext("dryDocument.rootElement instanceof ElementWet").toBeFalse();
    expect(dryRoot instanceof NodeWet).withContext("dryDocument.rootElement instanceof NodeWet").toBeFalse();
    expect(dryDocument instanceof NodeWet).withContext("dryDocument instanceof NodeWet").toBeFalse();
    expect(dryDocument instanceof ElementWet).withContext("dryDocument instanceof ElementWet").toBeFalse();

    const wetRoot = wetDocument.rootElement;
    expect(wetRoot instanceof ElementDry).withContext("wetDocument.rootElement instanceof ElementDry").toBeTrue();
    expect(wetRoot instanceof NodeDry).withContext("wetDocument.rootElement instanceof NodeDry").toBeTrue();
    expect(wetDocument instanceof NodeDry).withContext("wetDocument instanceof NodeDry").toBeTrue();
    expect(wetDocument instanceof ElementDry).withContext("wetDocument instanceof ElementDry").toBeFalse();
  });

  it("Looking up a method twice returns the same method", function() {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const method1 = dryDocument.rootElement.insertBefore;
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const method2 = dryDocument.rootElement.insertBefore;

    expect(method1 === method2).toBeTrue();
    expect(method1 !== wetDocument.rootElement.insertBefore).toBeTrue();
    expect(typeof method1).toBe("function");
  });

  it(
    "Looking up a non-configurable, non-writable property twice returns the same property",
    function() {
      const obj = { value: 6 };
      Reflect.defineProperty(wetDocument, "extra", {
        value: obj,
        writable: false,
        enumerable: true,
        configurable: false
      });

      const dryDoc = dryDocument as unknown as Record<"extra", Record<"value", number>>;
      const lookup1 = dryDoc.extra;
      const lookup2 = dryDoc.extra;

      expect(lookup1 === lookup2).toBe(true);
      expect(lookup1 === obj).toBe(false);

      expect(lookup1.value).toBe(6);
    }
  );

  it("Looking up an accessor descriptor works", function() {
    const desc = Reflect.getOwnPropertyDescriptor(Reflect.getPrototypeOf(dryDocument)!, "baseURL")!;
    expect(desc.configurable).withContext("configurable").toBeTrue();

    // This was a surprise, but it is following the spec for classes.
    expect(desc.enumerable).withContext("enumerable").toBeFalse();
    expect(typeof desc.get).toBe("function");
    expect(typeof desc.set).toBe("function");

    dryDocument.baseURL = "https://www.ecmascript.org/";
    expect(dryDocument.baseURL).toBe("https://www.ecmascript.org/");
  });

  it("Executing a method returns a properly wrapped object", function() {
    const element: MockElementIfc = dryDocument.createElement("foo");
    dryDocument.rootElement.insertBefore(element, null);
    expect(element == dryDocument.rootElement.firstChild).toBe(true);

    expect(wetDocument.rootElement.firstChild).not.toBeNull();
    expect(element === wetDocument.rootElement.firstChild).toBeFalse();
    expect(element.name).toBe((wetDocument.rootElement.firstChild as MockElementIfc).name);
  });

  describe("Revocation works", () => {
    let root: MockElementIfc;
    let wetEventListener: MockEventListenerIfc;
    const dryEventListener: MockEventListenerIfc = {
      handleEvent: function(evt: MockEventIfc): void {
        void evt;
      }
    };

    beforeEach(() => {
      root = dryDocument.rootElement;
      root.addEventListener("testEvent", dryEventListener, true);
      wetEventListener = wetDocument.rootElement._eventHandlers[0].listener;
    });

    it("on the wet object graph", () => {
      membrane.revokeObjectGraph("wet");
      expect(() => dryDocument.rootElement).toThrow();
      expect(() => root.ownerDocument).toThrow();
      expect(() => wetEventListener.handleEvent).toThrow();
    });

    it("on the dry object graph", () => {
      membrane.revokeObjectGraph("dry");
      expect(() => dryDocument.rootElement).toThrow();
      expect(() => root.ownerDocument).toThrow();
      expect(() => wetEventListener.handleEvent).toThrow();
    });

    it("on the entire membrane", () => {
      membrane.revokeEverything();
      expect(() => dryDocument.rootElement).toThrow();
      expect(() => root.ownerDocument).toThrow();
      expect(() => wetEventListener.handleEvent).toThrow();
    });
  });
});
