import ShadowHeadHandler from "../source/ShadowHeadHandler.mjs";
import TailHandler from "../source/TailHandler.mjs";

import SpyObjectGraph from "../fixtures/SpyObjectGraph.mjs"
import SpyProxyHandler from "../fixtures/SpyProxyHandler.mjs";

describe("_03_proxyhandler_base integration test for the trap", () => {
  /* I want to simulate what I expect initial behavior to be.  So the goal here
  is for only nextTarget to be different, and all other arguments to the SpyProxyHandler
  be the same.

  ShadowProxyHandler instances may change the next* arguments as they see fit, except for
  nextTarget.  This test is really about keeping the API consistent when we call out to
  nextHandler traps.

  In normal circumstances, nextHandler will be Reflect.  For a distortion where we want to
  pick up the properties of another proxy, nextHandler will be a ShadowHeadHandler<object>
  instead.  So this integration test is really important.
  */

  let head: ShadowHeadHandler<object>;
  let mirrorGraph: SpyObjectGraph<object>;
  let tail: TailHandler<object>;
  let spyHandler: SpyProxyHandler<object>;

  function idObject(id: string) : object
  {
    return Object.freeze({id});
  }

  const shadowTarget = idObject("shadowTarget");
  const nextTarget = idObject("nextTarget");
  const thisArg = idObject("thisArg");
  const argArray = [idObject("arg0"), idObject("arg1")];
  const receiver = idObject("receiver");
  const proto = idObject("prototype");
  const value = idObject("value");

  const propDescFirst: PropertyDescriptor = {
    value: idObject("propDescFirst"),
    enumerable: true,
    writable: true,
    configurable: true
  };

  class GenericFunction {
    data = idObject("generic");
    constructor(...args: unknown[]) {
      void(args);
    }
  }
  const generic = new GenericFunction;

  class MirrorGraph extends SpyObjectGraph<object>
  {
    constructor(tail: TailHandler<object>, finalHandler: SpyProxyHandler<object>) {
      super();

      this.getSpy("getNextTargetForShadow").and.returnValue(nextTarget);
      this.getSpy("getHandlerForTarget").and.returnValue(finalHandler);
      this.getSpy("convertArguments").and.callFake((...args) => args);
      this.getSpy("convertDescriptor").and.callFake((descriptor) => descriptor);
    }
  }

  beforeEach(() => {
    spyHandler = new SpyProxyHandler;

    tail = new TailHandler;
    mirrorGraph = new MirrorGraph(tail, spyHandler);
    head = new ShadowHeadHandler(tail, mirrorGraph, mirrorGraph);
  });

  it(`"apply"`, () => {
    spyHandler.getSpy("apply").and.returnValue(generic);
    expect(head.apply(shadowTarget, thisArg, argArray)).toBe(generic);

    spyHandler.expectSpiesClearExcept("apply");
    expect(spyHandler.getSpy("apply")).toHaveBeenCalledOnceWith(
      nextTarget, thisArg, argArray
    );
  });

  it(`"construct"`, () => {
    spyHandler.getSpy("construct").and.returnValue(generic);
    expect(head.construct(shadowTarget, argArray, GenericFunction)).toBe(generic);

    spyHandler.expectSpiesClearExcept("construct");
    expect(spyHandler.getSpy("construct")).toHaveBeenCalledOnceWith(
      nextTarget, argArray, GenericFunction
    )
  });

  it(`"defineProperty"`, () => {
    spyHandler.getSpy("defineProperty").and.returnValue(true);
    expect(head.defineProperty(shadowTarget, "foo", propDescFirst)).toBe(true);

    spyHandler.expectSpiesClearExcept("defineProperty");
    expect(spyHandler.getSpy("defineProperty")).toHaveBeenCalledOnceWith(
      nextTarget, "foo", propDescFirst
    );
  });

  it(`"deleteProperty"`, () => {
    spyHandler.getSpy("deleteProperty").and.returnValue(false);
    expect(head.deleteProperty(shadowTarget, "foo")).toBe(false);

    spyHandler.expectSpiesClearExcept("deleteProperty");
    expect(spyHandler.getSpy("deleteProperty")).toHaveBeenCalledOnceWith(
      nextTarget, "foo"
    );
  });

  it(`"get"`, () => {
    spyHandler.getSpy("get").and.returnValue(generic);
    expect(head.get(shadowTarget, "bar", receiver)).toBe(generic);

    spyHandler.expectSpiesClearExcept("get");
    expect(spyHandler.getSpy("get")).toHaveBeenCalledOnceWith(
      nextTarget, "bar", receiver
    );
  });

  it(`"getOwnPropertyDescriptor"`, () => {
    spyHandler.getSpy("getOwnPropertyDescriptor").and.returnValue(propDescFirst);
    expect(head.getOwnPropertyDescriptor(
      shadowTarget, "bar"
    )).toBe(propDescFirst);

    spyHandler.expectSpiesClearExcept("getOwnPropertyDescriptor");
    expect(spyHandler.getSpy("getOwnPropertyDescriptor")).toHaveBeenCalledOnceWith(
      nextTarget, "bar"
    );
  });

  it(`"getPrototypeOf"`, () => {
    spyHandler.getSpy("getPrototypeOf").and.returnValue(proto);
    expect(head.getPrototypeOf(shadowTarget)).toBe(proto);

    spyHandler.expectSpiesClearExcept("getPrototypeOf");
    expect(spyHandler.getSpy("getPrototypeOf")).toHaveBeenCalledOnceWith(
      nextTarget
    );
  });

  it(`"has"`, () => {
    spyHandler.getSpy("has").and.returnValue(true);
    expect(head.has(shadowTarget, "bar")).toBe(true);

    spyHandler.expectSpiesClearExcept("has");
    expect(spyHandler.getSpy("has")).toHaveBeenCalledWith(
      nextTarget, "bar"
    );
  });

  it(`"isExtensible"`, () => {
    spyHandler.getSpy("isExtensible").and.returnValue(true);
    expect(head.isExtensible(shadowTarget)).toBe(true);

    spyHandler.expectSpiesClearExcept("isExtensible");
    expect(spyHandler.getSpy("isExtensible")).toHaveBeenCalledWith(
      nextTarget
    );
  });

  it(`"ownKeys"`, () => {
    spyHandler.getSpy("ownKeys").and.returnValue(["foo", "bar"]);
    expect(head.ownKeys(shadowTarget)).toEqual(["foo", "bar"]);

    spyHandler.expectSpiesClearExcept("ownKeys");
    expect(spyHandler.getSpy("ownKeys")).toHaveBeenCalledOnceWith(
      nextTarget
    );
  });

  it(`"preventExtensions"`, () => {
    spyHandler.getSpy("preventExtensions").and.returnValue(true);
    expect(head.preventExtensions(shadowTarget)).toBe(true);

    spyHandler.expectSpiesClearExcept("preventExtensions");
    expect(spyHandler.getSpy("preventExtensions")).toHaveBeenCalledWith(
      nextTarget
    );
  });

  it(`"set"`, () => {
    spyHandler.getSpy("set").and.returnValue(false);
    expect(head.set(
      shadowTarget, "foo", value, receiver
    )).toBe(false);

    spyHandler.expectSpiesClearExcept("set");
    expect(spyHandler.getSpy("set")).toHaveBeenCalledOnceWith(
      nextTarget, "foo", value, receiver
    );
  });

  it(`"setPrototypeOf"`, () => {
    spyHandler.getSpy("setPrototypeOf").and.returnValue(true);
    expect(head.setPrototypeOf(
      shadowTarget, proto
    )).toBe(true);

    spyHandler.expectSpiesClearExcept("setPrototypeOf");
    expect(spyHandler.getSpy("setPrototypeOf")).toHaveBeenCalledOnceWith(
      nextTarget, proto
    );
  });
});
