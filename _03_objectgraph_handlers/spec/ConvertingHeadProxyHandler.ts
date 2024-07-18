import ConvertingHeadProxyHandler from "#objectgraph_handlers/source/generated/ConvertingHeadProxyHandler.js";

import type {
  ObjectGraphHandlerIfc
} from "#objectgraph_handlers/source/generated/types/ObjectGraphHandlerIfc.js";

import type {
  MembraneIfc,
} from "#objectgraph_handlers/source/types/MembraneIfc.js";

import SpyProxyHandler from "./support/SpyProxyHandler.js";

class LocalHead extends ConvertingHeadProxyHandler {
  readonly #expectedRealTarget: () => void;
  targetGraph?: string | symbol

  constructor(
    membraneIfc: MembraneIfc,
    objectGraphIfc: ObjectGraphHandlerIfc,
    expectedRealTarget: () => void
  )
  {
    super(membraneIfc, objectGraphIfc);
    this.#expectedRealTarget = expectedRealTarget;
  }

  public getRealTargetForShadowTarget(shadowTarget: object): object {
    return this.#expectedRealTarget;
  }

  public getTargetGraphKeyForRealTarget(realTarget: object): string | symbol {
    return this.targetGraph!;
  }
}

class MockMembrane implements MembraneIfc {
  convertArray<ValueTypes extends unknown[]>(targetGraphKey: string | symbol, values: ValueTypes): ValueTypes {
    throw new Error("Method not implemented.");
  }
  convertDescriptor(targetGraphKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor {
    throw new Error("Method not implemented.");
  }
}

describe("Converting-head proxy handler works for the trap", () => {
  let membrane: MockMembrane;
  let spyObjectGraphHandler: SpyProxyHandler;
  let shadowTarget: () => void;
  let expectedRealTarget: () => void;

  let headHandler: LocalHead;

  beforeEach(() => {
    shadowTarget = () => { return undefined; };
    expectedRealTarget = () => { return undefined; };

    membrane = new MockMembrane();

    spyObjectGraphHandler = new SpyProxyHandler;
    headHandler = new LocalHead(
      membrane,
      spyObjectGraphHandler,
      expectedRealTarget
    );
  });

  it(`"apply"`, () => {
    headHandler.targetGraph = ("apply test");

    const nextThisArg = { nextThisArg: true };
    const nextArgArray = [{ argName: "three" }, { argName: "four"}];
    spyOn(membrane, "convertArray").and.returnValues(
      [ nextThisArg ],
      nextArgArray
    );

    const result = { result: true };
    spyObjectGraphHandler.getSpy("apply").and.returnValue(result);

    const thisArg = { thisArg: true };
    const argArray = [{ argName: "one"}, { argName: "two"}];

    expect(headHandler.apply(shadowTarget, thisArg, argArray)).toBe(result);

    spyObjectGraphHandler.expectSpiesClearExcept("apply");
    expect(spyObjectGraphHandler.getSpy("apply")).toHaveBeenCalledOnceWith(
      shadowTarget,
      thisArg,
      argArray,
      headHandler.targetGraph,
      expectedRealTarget,
      nextThisArg,
      nextArgArray,
    );
  });

  it(`"construct"`, () => {
    headHandler.targetGraph = ("construct test");

    const nextArgArray = [{ argName: "three" }, { argName: "four"}];
    const nextNewTarget = { nextNewTarget: true };
    spyOn(membrane, "convertArray").and.returnValues(
      [ nextNewTarget ],
      nextArgArray,
    );

    const result = { constructed: true };
    spyObjectGraphHandler.getSpy("construct").and.returnValue(result);

    const argArray = [{ argName: "one"}, { argName: "two"}];
    const newTarget = () => { return "new target" };
    expect(headHandler.construct(shadowTarget, argArray, newTarget)).toBe(result);

    spyObjectGraphHandler.expectSpiesClearExcept("construct");
    expect(spyObjectGraphHandler.getSpy("construct")).toHaveBeenCalledOnceWith(
      shadowTarget,
      argArray,
      newTarget,
      headHandler.targetGraph,
      expectedRealTarget,
      nextArgArray,
      nextNewTarget
    );
  });

  it(`"defineProperty"`, () => {
    headHandler.targetGraph = ("defineProperty test");

    const property = Symbol("property");
    const attributes: PropertyDescriptor = {
      value: "attributes",
      configurable: false,
      enumerable: true,
      writable: false
    };

    const nextProperty = Symbol("next property");
    const nextAttributes: PropertyDescriptor = {
      get: () => "nextAttributes",
      configurable: false,
      enumerable: true,
    };

    spyOn(membrane, "convertArray").and.returnValue(
      [ nextProperty ]
    );
    spyOn(membrane, "convertDescriptor").and.returnValue(
      nextAttributes
    );

    spyObjectGraphHandler.getSpy("defineProperty").and.returnValue(true);

    expect(headHandler.defineProperty(shadowTarget, property, attributes)).toBe(true);

    spyObjectGraphHandler.expectSpiesClearExcept("defineProperty");
    expect(spyObjectGraphHandler.getSpy("defineProperty")).toHaveBeenCalledOnceWith(
      shadowTarget,
      property,
      attributes,
      headHandler.targetGraph,
      expectedRealTarget,
      nextProperty,
      nextAttributes,
    );
  });

  it(`"deleteProperty"`, () => {
    headHandler.targetGraph = ("deleteProperty test");
    const property = Symbol("property");
    const nextProperty = Symbol("next property");

    spyOn(membrane, "convertArray").and.returnValue(
      [ nextProperty ]
    );

    spyObjectGraphHandler.getSpy("deleteProperty").and.returnValue(false);

    expect(headHandler.deleteProperty(shadowTarget, property)).toBe(false);

    spyObjectGraphHandler.expectSpiesClearExcept("deleteProperty");
    expect(spyObjectGraphHandler.getSpy("deleteProperty")).toHaveBeenCalledOnceWith(
      shadowTarget,
      property,
      headHandler.targetGraph,
      expectedRealTarget,
      nextProperty
    );
  });

  it(`"get"`, () => {
    headHandler.targetGraph = ("get test");
    const property = Symbol("property");
    const receiver = { receiver: true };

    const nextProperty = Symbol("next property");
    const nextReceiver = { nextReceiver: true };

    spyOn(membrane, "convertArray").and.returnValue(
      [ nextProperty, nextReceiver ]
    );

    const result = { result: true };
    spyObjectGraphHandler.getSpy("get").and.returnValue(result);

    expect(headHandler.get(shadowTarget, property, receiver)).toBe(result);

    spyObjectGraphHandler.expectSpiesClearExcept("get");
    expect(spyObjectGraphHandler.getSpy("get")).toHaveBeenCalledOnceWith(
      shadowTarget,
      property,
      receiver,
      headHandler.targetGraph,
      expectedRealTarget,
      nextProperty,
      nextReceiver
    );
  });

  it(`"getOwnPropertyDescriptor"`, () => {
    headHandler.targetGraph = ("getOwnPropertyDescriptor test");

    const property = Symbol("property");
    const attributes: PropertyDescriptor = {
      value: "attributes",
      configurable: false,
      enumerable: true,
      writable: false
    };

    const nextProperty = Symbol("next property");
    spyOn(membrane, "convertArray").and.returnValue(
      [ nextProperty ]
    );

    spyObjectGraphHandler.getSpy("getOwnPropertyDescriptor").and.returnValue(attributes);

    expect(headHandler.getOwnPropertyDescriptor(shadowTarget, property)).toBe(attributes);

    spyObjectGraphHandler.expectSpiesClearExcept("getOwnPropertyDescriptor");
    expect(spyObjectGraphHandler.getSpy("getOwnPropertyDescriptor")).toHaveBeenCalledOnceWith(
      shadowTarget,
      property,
      headHandler.targetGraph,
      expectedRealTarget,
      nextProperty,
    );
  });

  it(`"getPrototypeOf"`, () => {
    headHandler.targetGraph = ("getPrototypeOf test");

    const proto = { isPrototype: true };
    spyObjectGraphHandler.getSpy("getPrototypeOf").and.returnValue(proto);

    expect(headHandler.getPrototypeOf(shadowTarget)).toBe(proto);

    spyObjectGraphHandler.expectSpiesClearExcept("getPrototypeOf");
    expect(spyObjectGraphHandler.getSpy("getPrototypeOf")).toHaveBeenCalledOnceWith(
      shadowTarget,
      headHandler.targetGraph,
      expectedRealTarget
    );
  });

  it(`"has"`, () => {
    headHandler.targetGraph = ("has test");
    const property = Symbol("property");
    const nextProperty = Symbol("next property");

    spyOn(membrane, "convertArray").and.returnValue(
      [ nextProperty ]
    );

    const result = false;
    spyObjectGraphHandler.getSpy("has").and.returnValue(result);

    expect(headHandler.has(shadowTarget, property)).toBe(result);

    spyObjectGraphHandler.expectSpiesClearExcept("has");
    expect(spyObjectGraphHandler.getSpy("has")).toHaveBeenCalledOnceWith(
      shadowTarget,
      property,
      headHandler.targetGraph,
      expectedRealTarget,
      nextProperty,
    );
  });

  it(`"isExtensible"`, () => {
    headHandler.targetGraph = ("isExtensible test");

    const result = false;
    spyObjectGraphHandler.getSpy("isExtensible").and.returnValue(result);

    expect(headHandler.isExtensible(shadowTarget)).toBe(result);

    spyObjectGraphHandler.expectSpiesClearExcept("isExtensible");
    expect(spyObjectGraphHandler.getSpy("isExtensible")).toHaveBeenCalledOnceWith(
      shadowTarget,
      headHandler.targetGraph,
      expectedRealTarget,
    );
  });

  it(`"ownKeys"`, () => {
    headHandler.targetGraph = ("ownKeys test");

    const result = [ "one", "two", "three" ];
    spyObjectGraphHandler.getSpy("ownKeys").and.returnValue(result);

    expect(headHandler.ownKeys(shadowTarget)).toBe(result);

    spyObjectGraphHandler.expectSpiesClearExcept("ownKeys");
    expect(spyObjectGraphHandler.getSpy("ownKeys")).toHaveBeenCalledOnceWith(
      shadowTarget,
      headHandler.targetGraph,
      expectedRealTarget,
    );
  });

  it(`"preventExtensions"`, () => {
    headHandler.targetGraph = ("preventExtensions test");

    const result = true;
    spyObjectGraphHandler.getSpy("preventExtensions").and.returnValue(result);

    expect(headHandler.preventExtensions(shadowTarget)).toBe(result);

    spyObjectGraphHandler.expectSpiesClearExcept("preventExtensions");
    expect(spyObjectGraphHandler.getSpy("preventExtensions")).toHaveBeenCalledOnceWith(
      shadowTarget,
      headHandler.targetGraph,
      expectedRealTarget,
    );
  });

  it(`"set"`, () => {
    headHandler.targetGraph = ("set test");
    const property = Symbol("property");
    const newValue = { newValue: true };
    const receiver = { receiver: true };

    const nextProperty = Symbol("next property");
    const nextNewValue = { nextNewValue: true };
    const nextReceiver = { nextReceiver: true };

    spyOn(membrane, "convertArray").and.returnValue(
      [ nextProperty, nextNewValue, nextReceiver ]
    );

    spyObjectGraphHandler.getSpy("set").and.returnValue(true);

    expect(headHandler.set(shadowTarget, property, newValue, receiver)).toBe(true);

    spyObjectGraphHandler.expectSpiesClearExcept("set");
    expect(spyObjectGraphHandler.getSpy("set")).toHaveBeenCalledOnceWith(
      shadowTarget,
      property,
      newValue,
      receiver,
      headHandler.targetGraph,
      expectedRealTarget,
      nextProperty,
      nextNewValue,
      nextReceiver,
    );
  });

  it(`"setPrototypeOf"`, () => {
    headHandler.targetGraph = ("setPrototypeOf test");

    const proto = { isPrototype: true };
    const nextProto = { isNextPrototype: true };

    spyOn(membrane, "convertArray").and.returnValue(
      [ nextProto ]
    );

    spyObjectGraphHandler.getSpy("setPrototypeOf").and.returnValue(false);

    expect(headHandler.setPrototypeOf(shadowTarget, proto)).toBe(false);

    spyObjectGraphHandler.expectSpiesClearExcept("setPrototypeOf");
    expect(spyObjectGraphHandler.getSpy("setPrototypeOf")).toHaveBeenCalledOnceWith(
      shadowTarget,
      proto,
      headHandler.targetGraph,
      expectedRealTarget,
      nextProto
    );
  });
});
