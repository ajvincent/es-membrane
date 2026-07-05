import type {
  AbstractClass,
  Class
} from "type-fest";

import type {
  MembraneIfc
} from "../source/types/MembraneIfc.js";

import {
  MockEventPhase
} from "../fixtures/mock-dom/MockEventPhase.js";

import type {
  MockDocumentIfc,
  MockElementIfc,
  MockEventIfc,
  MockNodeIfc
} from "../fixtures/mock-dom/types/MockDOMInterfaces.js";

import {
  MocksMembrane
} from "./support/MocksMembrane.js";

describe("basic concepts (with two object graphs):", () => {
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

  it("Callback functions properly wrap their arguments", () => {
    let dryEvent: MockEventIfc = {
      type: "",
      currentPhase: MockEventPhase.CAPTURING
    };
    function dryHandler(evt: MockEventIfc): void {
      dryEvent = evt;
    }

    let wetEvent: MockEventIfc = {
      type: "",
      currentPhase: MockEventPhase.CAPTURING
    };
    function wetHandler(evt: MockEventIfc): void {
      wetEvent = evt;
    }

    const dryRoot = dryDocument.rootElement;
    dryRoot.addEventListener("testEvent", dryHandler, true);
    wetDocument.rootElement.addEventListener("testEvent", wetHandler, true);
    dryRoot.dispatchEvent("testEvent");

    expect(dryEvent.type).toBe("testEvent");
    const wetPrototype = Reflect.getPrototypeOf(wetEvent);
    const dryPrototype = Reflect.getPrototypeOf(dryEvent);
    expect(dryPrototype === wetPrototype).toBeFalse();
    expect(membrane.isObjectInGraph("dry", dryEvent)).toBeTrue();
    expect(membrane.isObjectInGraph("wet", wetEvent)).toBeTrue();
  });

  it("constructors work", () => {
    const elem = new ElementDry(dryDocument, "test-element");
    expect(elem.name).toBe("test-element");
    expect(elem.ownerDocument === dryDocument).toBeTrue();
    expect(Reflect.getPrototypeOf(elem) === ElementDry.prototype).toBeTrue();
  });

  // XXX ajvincent Be sure to retest this via frames, sandboxes.
  it(
    "Executing a function via .apply() returns a properly wrapped object",
    function() {
      const method1 = dryDocument.createElement;
      const elem: MockElementIfc = method1.apply(dryDocument, ["test-element"]);
      expect(elem.name).toBe("test-element");
      expect(elem.ownerDocument === dryDocument).toBeTrue();
    }
  );

  it("Looking up Object.isExtensible() works", function() {
    let wetExtensible = Object.isExtensible(wetDocument);
    let dryExtensible = Object.isExtensible(dryDocument);

    expect(wetExtensible).toBeTrue();
    expect(dryExtensible).toBeTrue();

    // there's a later test for Object.preventExtension(dryDocument).
    Object.preventExtensions(wetDocument);

    wetExtensible = Object.isExtensible(wetDocument);
    dryExtensible = Object.isExtensible(dryDocument);

    expect(wetExtensible).toBeFalse();
    expect(dryExtensible).toBeFalse();
  });

  it("Reflect.ownKeys() returns the same results for both object graphs with no distortions", () => {
    expect(Reflect.ownKeys(dryDocument)).toEqual(Reflect.ownKeys(wetDocument));
    expect(Reflect.ownKeys(dryDocument.rootElement)).toEqual(Reflect.ownKeys(wetDocument.rootElement));
    expect(Reflect.ownKeys(ElementDry)).toEqual(Reflect.ownKeys(ElementWet));
    expect(Reflect.ownKeys(ElementDry.prototype)).toEqual(Reflect.ownKeys(ElementWet.prototype));
    expect(Reflect.ownKeys(NodeDry)).toEqual(Reflect.ownKeys(NodeWet));
    expect(Reflect.ownKeys(NodeDry.prototype)).toEqual(Reflect.ownKeys(NodeWet.prototype));
  });

  it("The in operator works", function() {
    function checkHas(
      this: null,
      value: object,
      valueName: string,
      propName: string,
      index: number,
      array: unknown[]
    )
    {
      expect(propName in value).withContext(valueName + ":" + propName).toBe(index !== array.length - 1);
    };
    const propList = [
      "nodeType",
      "childNodes",
      "ownerDocument",
      "unknownProperty"
    ];

    propList.forEach(checkHas.bind(null, dryDocument, "dryDocument"));

    // root follows inheritance patterns.
    const root = dryDocument.rootElement;
    propList.forEach(checkHas.bind(null, root, "root"));
  });

  describe("The delete operator works as expected", function() {
    it("on dryDocument.rootElement", function() {
      const wasDeleted = delete (dryDocument as Partial<MockDocumentIfc>).rootElement;
      expect(typeof dryDocument.rootElement).toBe("undefined");
      expect("rootElement" in dryDocument).toBeFalse();
      expect(wasDeleted).toBeTrue();

      expect("rootElement" in wetDocument).toBeFalse();
    });

    it("on dryDocument.rootElement.nodeName", function() {
      const root = dryDocument.rootElement as { name?: string };
      const wasDeleted = delete root.name;
      expect(typeof root.name).toBe("undefined");
      expect("nodeName" in root).toBeFalse();
      expect(wasDeleted).toBeTrue();

      expect(wetDocument.rootElement.name).toBeUndefined();
    });

    it("on dryDocument.rootElement.insertBefore", function() {
      const root = dryDocument.rootElement as Partial<MockElementIfc>;
      const wasDeleted = delete root.insertBefore;

      // This is because insertBefore is inherited from NodeWet.prototype.
      expect(typeof root.insertBefore).toBe("function");
      expect("insertBefore" in root).toBeTrue();
      expect(wasDeleted).toBeTrue();

      expect(typeof wetDocument.rootElement.insertBefore).toBe("function");
    });
  });

  describe("Deleting a property via Reflect.deleteProperty(...) works as expected", function() {
    it("when the property doesn't exist", function() {
      expect(Reflect.deleteProperty(dryDocument, "doesNotExist")).toBeTrue();
    });

    it("when the property descriptor has configurable: true", function() {
      Reflect.defineProperty(dryDocument, "doesNotExist", {
        value: 2,
        writable: true,
        enumerable: true,
        configurable: true
      });
      expect(Reflect.deleteProperty(dryDocument, "doesNotExist")).toBeTrue();
      expect(Reflect.getOwnPropertyDescriptor(dryDocument, "doesNotExist")).toBeUndefined();
    });

    it("when the property descriptor has configurable: false", function() {
      Reflect.defineProperty(dryDocument, "doesNotExist", {
        value: 2,
        writable: true,
        enumerable: true,
        configurable: false
      });
      expect(Reflect.deleteProperty(dryDocument, "doesNotExist")).toBeFalse();
      const desc = Reflect.getOwnPropertyDescriptor(dryDocument, "doesNotExist");
      expect(typeof desc).toBe("object");
      if (desc) {
        expect(desc.value).toBe(2);
      }
    });

    it(
      "when the property descriptor is initially defined on the original target with configurable: true",
      function() {
        Reflect.defineProperty(wetDocument, "doesNotExist", {
          value: 2,
          writable: true,
          enumerable: true,
          configurable: true
        });
        expect(Reflect.deleteProperty(dryDocument, "doesNotExist")).toBeTrue();
        expect(
          Reflect.getOwnPropertyDescriptor(dryDocument, "doesNotExist")
        ).toBeUndefined();
      }
    );

    it(
      "when the property descriptor is initially defined on the original target with configurable: false",
      function() {
        Reflect.defineProperty(wetDocument, "doesNotExist", {
          value: 2,
          writable: true,
          enumerable: true,
          configurable: false
        });
        expect(Reflect.deleteProperty(dryDocument, "doesNotExist")).toBeFalse();
        const desc = Reflect.getOwnPropertyDescriptor(dryDocument, "doesNotExist");
        expect(typeof desc).toBe("object");
        if (desc) {
          expect(desc.value).toBe(2);
        }
      }
    );
  });

  interface DocProperties extends MockDocumentIfc {
    screenWidth?: number;
    screenHeight?: number;
    location?: Record<"name", string>;
    extra?: object;
  }

  it("Defining a property via Object.defineProperty(...) works as expected", function() {
    const dryDoc = dryDocument as DocProperties;
    const wetDoc = wetDocument as DocProperties;

    Object.defineProperty(dryDoc, "screenWidth", {
      value: 200,
      writable: true,
      enumerable: true,
      configurable: true
    });
    expect(dryDoc.screenWidth).toBe(200);
    expect(wetDoc.screenWidth).toBe(200);

    let localHeight: number = 150;
    Object.defineProperty(dryDocument, "screenHeight", {
      get: function() { return localHeight; },
      set: function(val: number) { localHeight = val; },
      enumerable: true,
      configurable: true
    });
    expect(dryDoc.screenHeight).toBe(150);
    expect(wetDoc.screenHeight).toBe(150);

    const location: Record<"name", string> = {
      name: "location"
    };
    Object.defineProperty(dryDocument, "location", {
      value: location,
      writable: true,
      enumerable: true,
      configurable: true
    });
    expect(dryDoc.location === location).toBe(true);
    expect(wetDoc.location !== location).toBe(true);
    expect(wetDoc.location!.name === "location").toBe(true);

    /* XXX ajvincent There is an obvious temptation to just call:
     * dryDocument.screenWidth = 200;
     *
     * That's covered in the next test.  Here, we're testing defineProperty.
     *
     * On the other hand, we've just tested that setting a property from the
     * "dry" side retains its identity with the "dry" object graph.
     */

    // Additional test for configurable: false
    const obj = {};
    Object.defineProperty(dryDoc, "extra", {
      value: obj,
      writable: true,
      enumerable: false,
      configurable: false
    });
    const extra = dryDoc.extra;
    expect(extra).toBe(obj);
  });

  it("Defining a property directly works as expected", function() {
    const dryDoc = dryDocument as DocProperties;
    const wetDoc = wetDocument as DocProperties;

    dryDoc.screenWidth = 200;
    expect(dryDoc.screenWidth).toBe(200);
    expect(wetDoc.screenWidth).toBe(200);

    let localHeight: number = 150;
    Object.defineProperty(dryDocument, "screenHeight", {
      get: function() { return localHeight; },
      set: function(val: number) { localHeight = val; },
      enumerable: true,
      configurable: true
    });
    wetDoc.screenHeight = 200;
    expect(dryDoc.screenHeight).toBe(200);
    expect(wetDoc.screenHeight).toBe(200);

    const location = {
      name: "location"
    };
    dryDoc.location = location;
    expect(dryDoc.location === location).toBe(true);
    expect(wetDoc.location !== location).toBe(true);
    expect(wetDoc.location!.name === "location").toBe(true);
  });

  it("Setting a prototype works as expected", function() {
    interface ElementWithNamespace extends MockElementIfc {
      namespaceURI?: string;
    }
    const XHTMLElementDryProto = Object.create(ElementDry.prototype, {
      namespaceURI: {
        value: "http://www.w3.org/1999/xhtml",
        writable: false,
        enumerable: true,
        configurable: true,
      }
    }) as ElementWithNamespace;

    class TraceMap extends Map<object, string> {
      addMember(value: object, name: string): void {
        this.getOrInsert(value, name);
        if (typeof value === "function")
          this.getOrInsert(value.prototype as object, name + ".prototype");
      }

      getPrototypeChain(value: object) {
        const rv: string[] = [];
        let next: string;
        while (value) {
          next = this.get(value) || "(unknown)";
          rv.push(next);

          // yes, getPrototypeOf can return null.  The while loop takes care of this.
          value = Reflect.getPrototypeOf(value)!;
        }
        return rv;
      }
    }

    const traceMap = new TraceMap();
    {
      traceMap.addMember(Reflect.getPrototypeOf(dryDocument)!.constructor, "DocumentDry");
      traceMap.addMember(dryDocument, "dryDocument");
      traceMap.set(dryDocument.rootElement, "dryDocument.rootElement");
      traceMap.addMember(ElementDry, "ElementDry");
      traceMap.addMember(NodeDry, "NodeDry");
      traceMap.addMember(Reflect.getPrototypeOf(NodeDry.prototype)!.constructor, "EventTargetDry");

      traceMap.addMember(Reflect.getPrototypeOf(wetDocument)!.constructor, "DocumentWet");
      traceMap.addMember(wetDocument, "wetDocument");
      traceMap.set(wetDocument.rootElement, "wetDocument.rootElement");
      traceMap.addMember(ElementWet, "ElementWet");
      traceMap.addMember(NodeWet, "NodeWet");
      traceMap.addMember(Reflect.getPrototypeOf(NodeWet.prototype)!.constructor, "EventTargetWet");

      traceMap.set(XHTMLElementDryProto, "XHTMLElementDryProto");
    }

    {
      const chain = traceMap.getPrototypeChain(wetDocument.rootElement);
      const expectedChain = [
        "wetDocument.rootElement",
        "ElementWet.prototype",
        "NodeWet.prototype",
        "EventTargetWet.prototype",
        "(unknown)"
      ];
      expect(chain).toEqual(expectedChain);
    }

    {
      const chain = traceMap.getPrototypeChain(dryDocument.rootElement);
      const expectedChain = [
        "dryDocument.rootElement",
        "ElementDry.prototype",
        "NodeDry.prototype",
        "EventTargetDry.prototype",
        "(unknown)"
      ];
      expect(chain).toEqual(expectedChain);
    }

    {
      const chain = traceMap.getPrototypeChain(XHTMLElementDryProto);
      const expectedChain = [
        "XHTMLElementDryProto",
        "ElementDry.prototype",
        "NodeDry.prototype",
        "EventTargetDry.prototype",
        "(unknown)"
      ];
      expect(chain).toEqual(expectedChain);
    }

    const dryRoot = dryDocument.rootElement;
    expect(Reflect.setPrototypeOf(dryRoot, XHTMLElementDryProto)).toBe(true);
    expect(Reflect.getPrototypeOf(dryRoot) === XHTMLElementDryProto).toBe(true);
    {
      const chain = traceMap.getPrototypeChain(dryRoot);
      const expectedChain = [
        "dryDocument.rootElement",
        "XHTMLElementDryProto",
        "ElementDry.prototype",
        "NodeDry.prototype",
        "EventTargetDry.prototype",
        "(unknown)"
      ];
      expect(chain).toEqual(expectedChain);
    }

    const wetRoot = wetDocument.rootElement;
    {
      const chain = traceMap.getPrototypeChain(wetRoot);
      const expectedChain = [
        "wetDocument.rootElement",
        "(unknown)",
        "ElementWet.prototype",
        "NodeWet.prototype",
        "EventTargetWet.prototype",
        "(unknown)"
      ];
      expect(chain).toEqual(expectedChain);
    }

    expect((dryRoot as ElementWithNamespace).namespaceURI).toBe(XHTMLElementDryProto.namespaceURI);
    expect((wetRoot as ElementWithNamespace).namespaceURI).toBe(XHTMLElementDryProto.namespaceURI);

    /* Class prototypes are not writable.
    class XHTMLElementDry extends ElementDry {
    }
    XHTMLElementDry.prototype = XHTMLElementDryProto; // throws an error

    Of course people can sort of hack around it...
    */
    const XHTMLElementDry = class extends ElementDry {
      constructor(ownerDoc: MockDocumentIfc, name: string) {
        super(ownerDoc, name);
        Reflect.setPrototypeOf(this, XHTMLElementDryProto);
      }
    } as Class<ElementWithNamespace, [MockDocumentIfc, string]>;
    traceMap.addMember(XHTMLElementDry, "XHTMLElementDry");

    const x = new XHTMLElementDry(dryDocument, "test-element");
    traceMap.addMember(x, "x");

    {
      const chain = traceMap.getPrototypeChain(x);
      const expectedChain = [
        "x",
        "XHTMLElementDryProto",
        "ElementDry.prototype",
        "NodeDry.prototype",
        "EventTargetDry.prototype",
        "(unknown)"
      ];
      expect(chain).toEqual(expectedChain);
    }
    expect(x.namespaceURI).toBe(XHTMLElementDryProto.namespaceURI);
    expect(x.nodeType).toBe(1);
  });

  it("Calling Object.preventExtensions(...) works as expected", function() {
    expect(Object.isExtensible(dryDocument)).toBe(true);
    Object.preventExtensions(dryDocument);
    expect(Object.isExtensible(dryDocument)).toBe(false);

    // this line is NOT expected to throw an exception
    Object.preventExtensions(dryDocument);
    expect(Object.isExtensible(dryDocument)).toBe(false);
  });

  it("Array.prototype.splice works on wrapped arrays", function() {
    interface StringsOwner extends MockDocumentIfc {
      strings: string[];
    }
    const wetDoc = wetDocument as StringsOwner;
    const dryDoc = dryDocument as StringsOwner;

    wetDoc.strings = ["alpha", "beta", "gamma"];
    expect(dryDoc.strings.length).toBe(3);

    Array.prototype.splice.apply(dryDoc.strings, [
      1, 1, "delta", "epsilon"
    ]);

    expect(wetDoc.strings).toEqual(["alpha", "delta", "epsilon", "gamma"]);
  });

  describe("Receivers in proxies", function() {
    interface Alphabet {
      ALPHA: Record<"value", "A">,
      BETA: Record<"value", "B">,
      alpha: {
        _hidden: Record<"value", string>,
        upper: Record<"value", string>,
        value: "a"
      },
      beta: {
        _hidden: Record<"value", string>,
        upper: Record<"value", string>,
        value: "b"
      }

      X: Record<"value", string>
    }

    let wetObj: Alphabet, dryObj: Alphabet;
    beforeEach(function() {
      const ALPHA: Record<"value", "A"> = {
        value: "A"
      };
      const BETA: Record<"value", "B"> = {
        value: "B"
      };

      const alpha: {
        _hidden: Record<"value", string>,
        upper: Record<"value", string>,
        value: "a"
      } = {
        get upper() {
          return this._hidden;
        },
        set upper(val) {
          this._hidden = val;
        },
        _hidden: ALPHA,
        value: "a",
      };

      const beta: {
        _hidden: Record<"value", string>,
        upper: Record<"value", string>,
        value: "b"
      } = {
        _hidden: { value: "F" },
        upper: BETA,
        value: "b"
      };

      wetObj = {
        ALPHA,
        BETA,
        alpha,
        beta,

        X: { value: "X" },
      };

      dryObj = membrane.convertObject(
        "wet", "dry", wetObj
      );
    });

    it("are where property lookups happen", function() {
      const dry_a = dryObj.alpha, dry_b = dryObj.beta;
      const val = Reflect.get(dry_a, "upper", dry_b);
      expect(val).toBe(dry_b._hidden);
    });

    it("are where property setter invocations happen", function() {
      const dry_a = dryObj.alpha, dry_b = dryObj.beta, dryA = dryObj.ALPHA, dryX = dryObj.X;
      const wetX = wetObj.X;

      Reflect.set(dry_a, "upper", dryX, dry_b);
      expect(dry_b._hidden).toBe(dryX);
      expect(dry_a._hidden).toBe(dryA);

      expect(wetObj.beta._hidden).toBe(wetX);
    });
  });

  describe("Revocation works", () => {
    let dryRoot: MockElementIfc;

    let dryEvent: MockEventIfc = {
      type: "",
      currentPhase: MockEventPhase.CAPTURING
    };
    function dryHandler(evt: MockEventIfc): void {
      dryEvent = evt;
    }

    let wetEvent: MockEventIfc = {
      type: "",
      currentPhase: MockEventPhase.CAPTURING
    };
    function wetHandler(evt: MockEventIfc): void {
      wetEvent = evt;
    }

    beforeEach(() => {
      wetEvent = {
        type: "",
        currentPhase: MockEventPhase.CAPTURING
      };

      dryEvent = {
        type: "",
        currentPhase: MockEventPhase.CAPTURING
      };

      dryRoot = dryDocument.rootElement;
      dryRoot.addEventListener("testEvent", dryHandler, true);
      wetDocument.rootElement.addEventListener("testEvent", wetHandler, true);
      dryRoot.dispatchEvent("testEvent");
    });

    it("on the wet object graph", () => {
      membrane.revokeObjectGraph("wet");
      expect(() => dryDocument.rootElement).withContext("dryDocument.rootElement").toThrow();
      expect(() => dryRoot.ownerDocument).withContext("dryRoot.ownerDocument").toThrow();
      expect(() => wetEvent.type).withContext("wetEvent.type").not.toThrow();
      expect(() => dryEvent.type).withContext("dryEvent.type").toThrow();

      expect(() => membrane.convertObject("wet", "dry", {})).withContext(
        "convert wet to dry after revoke"
      ).toThrow();
      expect(() => membrane.convertObject("dry", "wet", {})).withContext(
        "convert dry to wet after revoke"
      ).toThrow();

      expect(() => membrane.createObjectGraph("wet")).withContext("create graph again").toThrow();
      expect(() => membrane.revokeObjectGraph("wet")).withContext("revoke again").not.toThrow();

      expect(() => membrane.createObjectGraph("steamy")).withContext("create steamy graph").not.toThrow();
    });

    it("on the dry object graph", () => {
      membrane.revokeObjectGraph("dry");
      expect(() => dryDocument.rootElement).withContext("dryDocument.rootElement").toThrow();
      expect(() => dryRoot.ownerDocument).withContext("dryRoot.ownerDocument").toThrow();
      expect(() => wetEvent.type).withContext("wetEvent.type").not.toThrow();
      expect(() => dryEvent.type).withContext("dryEvent.type").toThrow();

      expect(() => membrane.convertObject("wet", "dry", {})).withContext(
        "convert wet to dry after revoke"
      ).toThrow();
      expect(() => membrane.convertObject("dry", "wet", {})).withContext(
        "convert dry to wet after revoke"
      ).toThrow();

      expect(() => membrane.createObjectGraph("steamy")).withContext("create steamy graph").not.toThrow();
    });

    it("on the entire membrane", () => {
      membrane.revokeEverything();
      expect(() => dryDocument.rootElement).withContext("dryDocument.rootElement").toThrow();
      expect(() => dryRoot.ownerDocument).withContext("dryRoot.ownerDocument").toThrow();
      expect(() => wetEvent.type).withContext("wetEvent.type").not.toThrow();
      expect(() => dryEvent.type).withContext("dryEvent.type").toThrow();

      expect(() => membrane.convertObject("wet", "dry", {})).withContext(
        "convert wet to dry after revoke"
      ).toThrow();
      expect(() => membrane.convertObject("dry", "wet", {})).withContext(
        "convert dry to wet after revoke"
      ).toThrow();

      expect(() => membrane.createObjectGraph("dry")).withContext("create graph again").toThrow();
      expect(() => membrane.revokeObjectGraph("dry")).withContext("revoke again").not.toThrow();

      expect(() => membrane.createObjectGraph("steamy")).withContext("create steamy graph").toThrow();
    });
  });
});

describe("basic concepts (with three object graphs): Revocation works", () => {
  let membrane: MembraneIfc;
  let wetDocument: MockDocumentIfc, dryDocument: MockDocumentIfc, dampDocument: MockDocumentIfc;
  let wetRoot: MockElementIfc, dryRoot: MockElementIfc, dampRoot: MockElementIfc;

  let dryEvent: MockEventIfc = {
    type: "",
    currentPhase: MockEventPhase.CAPTURING
  };
  function dryHandler(evt: MockEventIfc): void {
    dryEvent = evt;
  }

  let wetEvent: MockEventIfc = {
    type: "",
    currentPhase: MockEventPhase.CAPTURING
  };
  function wetHandler(evt: MockEventIfc): void {
    wetEvent = evt;
  }

  let dampEvent: MockEventIfc = {
    type: "",
    currentPhase: MockEventPhase.CAPTURING
  };
  function dampHandler(evt: MockEventIfc): void {
    dampEvent = evt;
  }

  beforeEach(async () => {
    const parts = await MocksMembrane(new Set(), true);
    membrane = parts.membrane;
    wetDocument = parts.wetDocument;
    dryDocument = parts.dryDocument;
    dampDocument = parts.dampDocument;

    wetEvent = {
      type: "",
      currentPhase: MockEventPhase.CAPTURING
    };

    dryEvent = {
      type: "",
      currentPhase: MockEventPhase.CAPTURING
    };

    dampEvent = {
      type: "",
      currentPhase: MockEventPhase.CAPTURING
    };

    dryRoot = dryDocument.rootElement;
    dryRoot.addEventListener("testEvent", dryHandler, true);

    wetRoot = wetDocument.rootElement;
    wetRoot.addEventListener("testEvent", wetHandler, true);

    dampRoot = dampDocument.rootElement;
    dampRoot.addEventListener("testEvent", dampHandler, true);

    dryRoot.dispatchEvent("testEvent");
  });

  afterEach(() => {
    membrane.revokeEverything();
  });

  it("on the wet object graph", () => {
    membrane.revokeObjectGraph("wet");
    expect(() => dryDocument.rootElement).withContext("dryDocument.rootElement").toThrow();
    expect(() => dryRoot.ownerDocument).withContext("dryRoot.ownerDocument").toThrow();
    expect(() => wetEvent.type).withContext("wetEvent.type").not.toThrow();
    expect(() => dryEvent.type).withContext("dryEvent.type").toThrow();

    // these belong to the wet graph
    expect(() => dampDocument.rootElement).withContext("dampDocument.rootElement").toThrow();
    expect(() => dampRoot.ownerDocument).withContext("dampRoot.ownerDocument").toThrow();
    expect(() => dampEvent.type).withContext("dampEvent.type").toThrow();

    expect(() => membrane.convertObject("wet", "dry", {})).withContext(
      "convert wet to dry after revoke"
    ).toThrow();
    expect(() => membrane.convertObject("dry", "wet", {})).withContext(
      "convert dry to wet after revoke"
    ).toThrow();
    expect(() => membrane.convertObject("wet", "damp", {})).withContext(
      "convert wet to damp after revoke"
    ).toThrow();
    expect(() => membrane.convertObject("damp", "wet", {})).withContext(
      "convert damp to wet after revoke"
    ).toThrow();
    expect(() => membrane.convertObject("dry", "damp", {})).withContext(
      "convert dry to damp after revoke"
    ).not.toThrow();
    expect(() => membrane.convertObject("dry", "damp", {})).withContext(
      "convert damp to dry after revoke"
    ).not.toThrow();

    expect(() => membrane.createObjectGraph("wet")).withContext("create graph again").toThrow();
    expect(() => membrane.revokeObjectGraph("wet")).withContext("revoke again").not.toThrow();

    expect(() => membrane.createObjectGraph("steamy")).withContext("create steamy graph").not.toThrow();
  });

  it("on the dry object graph", () => {
    membrane.revokeObjectGraph("dry");
    expect(() => dryDocument.rootElement).withContext("dryDocument.rootElement").toThrow();
    expect(() => dryRoot.ownerDocument).withContext("dryRoot.ownerDocument").toThrow();
    expect(() => wetEvent.type).withContext("wetEvent.type").not.toThrow();
    expect(() => dryEvent.type).withContext("dryEvent.type").toThrow();

    // these belong to the wet graph
    expect(() => dampDocument.rootElement).withContext("dampDocument.rootElement").not.toThrow();
    expect(() => dampRoot.ownerDocument).withContext("dampRoot.ownerDocument").not.toThrow();
    expect(() => dampEvent.type).withContext("dampEvent.type").not.toThrow();

    expect(() => membrane.convertObject("wet", "dry", {})).withContext(
      "convert wet to dry after revoke"
    ).toThrow();
    expect(() => membrane.convertObject("dry", "wet", {})).withContext(
      "convert dry to wet after revoke"
    ).toThrow();
    expect(() => membrane.convertObject("wet", "damp", {})).withContext(
      "convert wet to damp after revoke"
    ).not.toThrow();
    expect(() => membrane.convertObject("damp", "wet", {})).withContext(
      "convert damp to wet after revoke"
    ).not.toThrow();
    expect(() => membrane.convertObject("dry", "damp", {})).withContext(
      "convert dry to damp after revoke"
    ).toThrow();
    expect(() => membrane.convertObject("dry", "damp", {})).withContext(
      "convert damp to dry after revoke"
    ).toThrow();

    expect(() => membrane.createObjectGraph("steamy")).withContext("create steamy graph").not.toThrow();
  });

  it("on the damp object graph", () => {
    membrane.revokeObjectGraph("damp");
    expect(() => dryDocument.rootElement).withContext("dryDocument.rootElement").not.toThrow();
    expect(() => dryRoot.ownerDocument).withContext("dryRoot.ownerDocument").not.toThrow();
    expect(() => wetEvent.type).withContext("wetEvent.type").not.toThrow();
    expect(() => dryEvent.type).withContext("dryEvent.type").not.toThrow();

    expect(() => dampDocument.rootElement).withContext("dampDocument.rootElement").toThrow();
    expect(() => dampRoot.ownerDocument).withContext("dampRoot.ownerDocument").toThrow();
    expect(() => dampEvent.type).withContext("dampEvent.type").toThrow();

    expect(() => membrane.convertObject("wet", "dry", {})).withContext(
      "convert wet to dry after revoke"
    ).not.toThrow();
    expect(() => membrane.convertObject("dry", "wet", {})).withContext(
      "convert dry to wet after revoke"
    ).not.toThrow();
    expect(() => membrane.convertObject("wet", "damp", {})).withContext(
      "convert wet to damp after revoke"
    ).toThrow();
    expect(() => membrane.convertObject("damp", "wet", {})).withContext(
      "convert damp to wet after revoke"
    ).toThrow();
    expect(() => membrane.convertObject("dry", "damp", {})).withContext(
      "convert dry to damp after revoke"
    ).toThrow();
    expect(() => membrane.convertObject("dry", "damp", {})).withContext(
      "convert damp to dry after revoke"
    ).toThrow();

    expect(() => membrane.createObjectGraph("steamy")).withContext("create steamy graph").not.toThrow();
  });

  it("on the entire membrane", () => {
    membrane.revokeEverything();
    expect(() => dryDocument.rootElement).withContext("dryDocument.rootElement").toThrow();
    expect(() => dryRoot.ownerDocument).withContext("dryRoot.ownerDocument").toThrow();
    // this is a value native to the wet graph, so there's no proxy
    expect(() => wetEvent.type).withContext("wetEvent.type").not.toThrow();
    expect(() => dryEvent.type).withContext("dryEvent.type").toThrow();

    expect(() => dampDocument.rootElement).withContext("dampDocument.rootElement").toThrow();
    expect(() => dampRoot.ownerDocument).withContext("dampRoot.ownerDocument").toThrow();
    expect(() => dampEvent.type).withContext("dampEvent.type").toThrow();

    expect(() => membrane.convertObject("wet", "dry", {})).withContext(
      "convert wet to dry after revoke"
    ).toThrow();
    expect(() => membrane.convertObject("dry", "wet", {})).withContext(
      "convert dry to wet after revoke"
    ).toThrow();
    expect(() => membrane.convertObject("wet", "damp", {})).withContext(
      "convert wet to damp after revoke"
    ).toThrow();
    expect(() => membrane.convertObject("damp", "wet", {})).withContext(
      "convert damp to wet after revoke"
    ).toThrow();
    expect(() => membrane.convertObject("dry", "damp", {})).withContext(
      "convert dry to damp after revoke"
    ).toThrow();
    expect(() => membrane.convertObject("dry", "damp", {})).withContext(
      "convert damp to dry after revoke"
    ).toThrow();

    expect(() => membrane.createObjectGraph("wet")).withContext("create graph again").toThrow();
    expect(() => membrane.revokeObjectGraph("wet")).withContext("revoke again").not.toThrow();

    expect(() => membrane.createObjectGraph("steamy")).withContext("create steamy graph").toThrow();
  });
});
