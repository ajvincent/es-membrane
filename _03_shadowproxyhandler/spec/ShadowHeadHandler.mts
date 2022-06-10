import ShadowHeadHandler from "../source/ShadowHeadHandler.mjs";
import SpyObjectGraph from "./fixtures/SpyObjectGraph.mjs";
import SpyProxyHandler from "./fixtures/SpyProxyHandler.mjs";
import SpyShadowProxyHandler from "./fixtures/SpyShadowProxyHandler.mjs";

describe("ShadowHeadHandler forwards to ShadowProxyHandler for the trap", () => {
  let currentGraph: SpyObjectGraph<object>,
      targetGraph: SpyObjectGraph<object>,
      shadowHandler: SpyShadowProxyHandler<object>,
      head: ShadowHeadHandler<object>;

  const spyHandler = new SpyProxyHandler;

  function idObject(id: string) : object
  {
    return Object.freeze({id});
  }

  const shadowTarget = idObject("shadowTarget");
  const nextTarget = idObject("nextTarget");
  const thisArg = idObject("thisArg");
  const argArray = [idObject("arg0"), idObject("arg1")];

  const nextThisArg = idObject("nextThisArg");
  const nextArgArray = [idObject("nextArg0"), idObject("nextArg1")];

  const propDescFirst: PropertyDescriptor = {
    value: idObject("propDescFirst"),
    enumerable: true,
    writable: true,
    configurable: true
  };
  const propDescNext: PropertyDescriptor = {
    value: idObject("propDescNext"),
    enumerable: false,
    writable: false,
    configurable: true
  };

  const receiver = idObject("receiver");
  const nextReceiver = idObject("nextReceiver");
  const proto = idObject("prototype");
  const nextProto = idObject("next prototype");
  const value = idObject("value");
  const nextValue = idObject("nextValue");

  class GenericFunction {
    data = idObject("generic");
    constructor(...args: unknown[]) {
      void(args);
    }
  }
  const generic = new GenericFunction;

  class GenericOther {}
  const genericOther = new GenericOther;

  beforeEach(() => {
    currentGraph = new SpyObjectGraph;
    targetGraph = new SpyObjectGraph;
    shadowHandler = new SpyShadowProxyHandler;
    head = new ShadowHeadHandler(shadowHandler, currentGraph, targetGraph);

    targetGraph.getSpy("getNextTargetForShadow").and.returnValue(nextTarget);
    targetGraph.getSpy("getHandlerForTarget").and.returnValue(spyHandler);
  });

  function spotCheckTargetGraph(...extraNames: string[]) : void
  {
    targetGraph.expectSpiesClearExcept("getNextTargetForShadow", "getHandlerForTarget", ...extraNames);
    expect(targetGraph.getSpy("getNextTargetForShadow")).toHaveBeenCalledOnceWith(
      shadowTarget
    );
    expect(targetGraph.getSpy("getHandlerForTarget")).toHaveBeenCalledOnceWith(
      nextTarget
    );
  }

  it(`"apply"`, () => {
    shadowHandler.getSpy("apply").and.returnValue(generic);
    targetGraph.getSpy("convertArguments").and.returnValue([nextThisArg, ...nextArgArray]);
    currentGraph.getSpy("convertArguments").and.returnValue([genericOther]);

    expect(head.apply(shadowTarget, thisArg, argArray)).toBe(genericOther);

    spotCheckTargetGraph("convertArguments");
    expect(targetGraph.getSpy("convertArguments")).toHaveBeenCalledOnceWith(
      thisArg, ...argArray
    );

    currentGraph.expectSpiesClearExcept("convertArguments");
    expect(currentGraph.getSpy("convertArguments")).toHaveBeenCalledOnceWith(generic);

    shadowHandler.expectSpiesClearExcept("apply");
    expect(shadowHandler.getSpy("apply")).toHaveBeenCalledOnceWith(
      shadowTarget, thisArg, argArray, nextTarget, spyHandler, nextThisArg, nextArgArray
    );

    spyHandler.expectSpiesClearExcept();
  });

  it(`"construct"`, () => {
    shadowHandler.getSpy("construct").and.returnValue(generic);
    targetGraph.getSpy("convertArguments").and.returnValue([GenericOther, ...nextArgArray]);
    currentGraph.getSpy("convertArguments").and.returnValue([genericOther]);

    expect(head.construct(shadowTarget, argArray, GenericFunction)).toBe(genericOther);

    spotCheckTargetGraph("convertArguments");
    expect(targetGraph.getSpy("convertArguments")).toHaveBeenCalledOnceWith(
      GenericFunction, ...argArray
    );

    currentGraph.expectSpiesClearExcept("convertArguments");
    expect(currentGraph.getSpy("convertArguments")).toHaveBeenCalledOnceWith(generic);

    shadowHandler.expectSpiesClearExcept("construct");
    expect(shadowHandler.getSpy("construct")).toHaveBeenCalledOnceWith(
      shadowTarget, argArray, GenericFunction, nextTarget, spyHandler, nextArgArray, GenericOther
    );

    spyHandler.expectSpiesClearExcept();
  });

  it(`"defineProperty"`, () => {
    shadowHandler.getSpy("defineProperty").and.returnValue(true);
    targetGraph.getSpy("convertDescriptor").and.returnValue(propDescNext);

    expect(head.defineProperty(shadowTarget, "foo", propDescFirst)).toBe(true);

    spotCheckTargetGraph("convertDescriptor");
    expect(targetGraph.getSpy("convertDescriptor")).toHaveBeenCalledOnceWith(
      propDescFirst
    );

    currentGraph.expectSpiesClearExcept();

    shadowHandler.expectSpiesClearExcept("defineProperty");
    expect(shadowHandler.getSpy("defineProperty")).toHaveBeenCalledOnceWith(
      shadowTarget, "foo", propDescFirst, nextTarget, spyHandler, propDescNext
    );

    spyHandler.expectSpiesClearExcept();
  });

  it(`"deleteProperty"`, () => {
    shadowHandler.getSpy("deleteProperty").and.returnValue(false);

    expect(head.deleteProperty(shadowTarget, "foo")).toBe(false);

    spotCheckTargetGraph();

    currentGraph.expectSpiesClearExcept();
    shadowHandler.expectSpiesClearExcept("deleteProperty");
    expect(shadowHandler.getSpy("deleteProperty")).toHaveBeenCalledOnceWith(
      shadowTarget, "foo", nextTarget, spyHandler
    );

    spyHandler.expectSpiesClearExcept();
  });

  it(`"get"`, () => {
    shadowHandler.getSpy("get").and.returnValue(generic);
    targetGraph.getSpy("convertArguments").and.returnValue([nextReceiver]);
    currentGraph.getSpy("convertArguments").and.returnValue([generic]);

    expect(head.get(shadowTarget, "bar", receiver)).toBe(generic);

    spotCheckTargetGraph("convertArguments");
    expect(targetGraph.getSpy("convertArguments")).toHaveBeenCalledOnceWith(
      receiver
    );

    currentGraph.expectSpiesClearExcept("convertArguments");
    expect(currentGraph.getSpy("convertArguments")).toHaveBeenCalledOnceWith(
      generic
    );

    shadowHandler.expectSpiesClearExcept("get");
    expect(shadowHandler.getSpy("get")).toHaveBeenCalledOnceWith(
      shadowTarget, "bar", receiver, nextTarget, spyHandler, nextReceiver
    );

    spyHandler.expectSpiesClearExcept();
  });

  it(`"getOwnPropertyDescriptor"`, () => {
    shadowHandler.getSpy("getOwnPropertyDescriptor").and.returnValue(propDescFirst);
    currentGraph.getSpy("convertDescriptor").and.returnValue(propDescNext);

    expect(head.getOwnPropertyDescriptor(shadowTarget, "bar")).toBe(propDescNext);

    spotCheckTargetGraph();

    currentGraph.expectSpiesClearExcept("convertDescriptor");
    expect(currentGraph.getSpy("convertDescriptor")).toHaveBeenCalledOnceWith(
      propDescFirst
    );

    shadowHandler.expectSpiesClearExcept("getOwnPropertyDescriptor");
    expect(shadowHandler.getSpy("getOwnPropertyDescriptor")).toHaveBeenCalledOnceWith(
      shadowTarget, "bar", nextTarget, spyHandler
    );

    spyHandler.expectSpiesClearExcept();
  });

  it(`"getPrototypeOf"`, () => {
    shadowHandler.getSpy("getPrototypeOf").and.returnValue(proto);
    currentGraph.getSpy("convertArguments").and.returnValue([nextProto]);

    expect(head.getPrototypeOf(shadowTarget)).toBe(nextProto);

    spotCheckTargetGraph();

    currentGraph.expectSpiesClearExcept("convertArguments");
    expect(currentGraph.getSpy("convertArguments")).toHaveBeenCalledOnceWith(
      proto
    );

    expect(shadowHandler.getSpy("getPrototypeOf")).toHaveBeenCalledOnceWith(
      shadowTarget, nextTarget, spyHandler
    );

    spyHandler.expectSpiesClearExcept();
  });

  it(`"has"`, () => {
    shadowHandler.getSpy("has").and.returnValue(true);

    expect(head.has(shadowTarget, "bar")).toBe(true);

    spotCheckTargetGraph();

    currentGraph.expectSpiesClearExcept();

    expect(shadowHandler.getSpy("has")).toHaveBeenCalledOnceWith(
      shadowTarget, "bar", nextTarget, spyHandler
    );

    spyHandler.expectSpiesClearExcept();
  });

  it(`"isExtensible"`, () => {
    shadowHandler.getSpy("isExtensible").and.returnValue(false);

    expect(head.isExtensible(shadowTarget)).toBe(false);

    spotCheckTargetGraph();

    currentGraph.expectSpiesClearExcept();
    expect(shadowHandler.getSpy("isExtensible")).toHaveBeenCalledOnceWith(
      shadowTarget, nextTarget, spyHandler
    );

    spyHandler.expectSpiesClearExcept();
  });

  it(`"ownKeys"`, () => {
    shadowHandler.getSpy("ownKeys").and.returnValue(["foo", "bar"]);
    expect(head.ownKeys(shadowTarget)).toEqual(["foo", "bar"]);

    spotCheckTargetGraph();

    currentGraph.expectSpiesClearExcept();

    shadowHandler.expectSpiesClearExcept("ownKeys");
    expect(shadowHandler.getSpy("ownKeys")).toHaveBeenCalledOnceWith(
      shadowTarget, nextTarget, spyHandler
    );

    spyHandler.expectSpiesClearExcept();
  });

  it(`"preventExtensions"`, () => {
    shadowHandler.getSpy("preventExtensions").and.returnValue(false);

    expect(head.preventExtensions(shadowTarget)).toBe(false);

    spotCheckTargetGraph();

    currentGraph.expectSpiesClearExcept();

    expect(shadowHandler.getSpy("preventExtensions")).toHaveBeenCalledOnceWith(
      shadowTarget, nextTarget, spyHandler
    );

    spyHandler.expectSpiesClearExcept();
  });

  it(`"set"`, () => {
    shadowHandler.getSpy("set").and.returnValue(true);
    targetGraph.getSpy("convertArguments").and.returnValue([nextValue, nextReceiver]);

    expect(head.set(
      shadowTarget, "foo", value, receiver
    )).toBe(true);

    spotCheckTargetGraph("convertArguments");
    expect(targetGraph.getSpy("convertArguments")).toHaveBeenCalledOnceWith(
      value, receiver
    );

    currentGraph.expectSpiesClearExcept();

    expect(shadowHandler.getSpy("set")).toHaveBeenCalledOnceWith(
      shadowTarget, "foo", value, receiver, nextTarget, spyHandler, nextValue, nextReceiver
    );

    spyHandler.expectSpiesClearExcept();
  });

  it(`"setPrototypeOf"`, () => {
    shadowHandler.getSpy("setPrototypeOf").and.returnValue(false);
    targetGraph.getSpy("convertArguments").and.returnValue([nextProto]);

    expect(head.setPrototypeOf(
      shadowTarget, proto
    )).toBe(false);

    spotCheckTargetGraph("convertArguments");
    expect(targetGraph.getSpy("convertArguments")).toHaveBeenCalledOnceWith(
      proto
    );

    currentGraph.expectSpiesClearExcept();

    expect(shadowHandler.getSpy("setPrototypeOf")).toHaveBeenCalledOnceWith(
      shadowTarget, proto, nextTarget, spyHandler, nextProto
    );

    spyHandler.expectSpiesClearExcept();
  });
});
