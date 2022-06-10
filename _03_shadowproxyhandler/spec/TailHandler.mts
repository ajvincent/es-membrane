import TailHandler from "../source/TailHandler.mjs";
import SpyProxyHandler from "./fixtures/SpyProxyHandler.mjs";

describe("TailHandler forwards to ProxyHandler for the trap", () => {
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

  let tail: TailHandler<object>;
  let spyHandler: SpyProxyHandler<object>;
  beforeEach(() => {
    tail = new TailHandler;
    spyHandler = new SpyProxyHandler;
  });

  it(`"apply"`, () => {
    spyHandler.getSpy("apply").and.returnValue(generic);
    expect(
      tail.apply(shadowTarget, thisArg, argArray, nextTarget, spyHandler, nextThisArg, nextArgArray)
    ).toBe(generic);

    spyHandler.expectSpiesClearExcept("apply");
    expect(spyHandler.getSpy("apply")).toHaveBeenCalledOnceWith(
      nextTarget, nextThisArg, nextArgArray
    );
  });

  it(`"construct"`, () => {
    spyHandler.getSpy("construct").and.returnValue(generic);
    expect(
      tail.construct(shadowTarget, argArray, GenericFunction, nextTarget, spyHandler, nextArgArray, GenericOther)
    ).toBe(generic);

    spyHandler.expectSpiesClearExcept("construct");
    expect(spyHandler.getSpy("construct")).toHaveBeenCalledOnceWith(
      nextTarget, nextArgArray, GenericOther
    );
  });

  it(`"defineProperty"`, () => {
    spyHandler.getSpy("defineProperty").and.returnValue(true);
    expect(
      tail.defineProperty(shadowTarget, "foo", propDescFirst, nextTarget, spyHandler, propDescNext)
    ).toBe(true);

    spyHandler.expectSpiesClearExcept("defineProperty");
    expect(spyHandler.getSpy("defineProperty")).toHaveBeenCalledOnceWith(
      nextTarget, "foo", propDescNext
    );
  });

  it(`"deleteProperty"`, () => {
    spyHandler.getSpy("deleteProperty").and.returnValue(false);
    expect(tail.deleteProperty(
      shadowTarget, "foo", nextTarget, spyHandler
    )).toBe(false);

    spyHandler.expectSpiesClearExcept("deleteProperty");
    expect(spyHandler.getSpy("deleteProperty")).toHaveBeenCalledOnceWith(
      nextTarget, "foo"
    );
  });

  it(`"get"`, () => {
    spyHandler.getSpy("get").and.returnValue(generic);
    expect(tail.get(
      shadowTarget, "bar", receiver, nextTarget, spyHandler, nextReceiver
    )).toBe(generic);

    spyHandler.expectSpiesClearExcept("get");
    expect(spyHandler.getSpy("get")).toHaveBeenCalledOnceWith(
      nextTarget, "bar", nextReceiver
    );
  });

  it(`"getOwnPropertyDescriptor"`, () => {
    spyHandler.getSpy("getOwnPropertyDescriptor").and.returnValue(propDescNext);
    expect(tail.getOwnPropertyDescriptor(
      shadowTarget, "bar", nextTarget, spyHandler
    )).toBe(propDescNext);

    spyHandler.expectSpiesClearExcept("getOwnPropertyDescriptor");
    expect(spyHandler.getSpy("getOwnPropertyDescriptor")).toHaveBeenCalledOnceWith(
      nextTarget, "bar"
    );
  });

  it(`"getPrototypeOf"`, () => {
    spyHandler.getSpy("getPrototypeOf").and.returnValue(nextProto);
    expect(tail.getPrototypeOf(
      shadowTarget, nextTarget, spyHandler
    )).toBe(nextProto);

    spyHandler.expectSpiesClearExcept("getPrototypeOf");
    expect(spyHandler.getSpy("getPrototypeOf")).toHaveBeenCalledOnceWith(
      nextTarget
    );
  });

  it(`"has"`, () => {
    spyHandler.getSpy("has").and.returnValue(true);
    expect(tail.has(
      shadowTarget, "bar", nextTarget, spyHandler
    )).toBe(true);

    spyHandler.expectSpiesClearExcept("has");
    expect(spyHandler.getSpy("has")).toHaveBeenCalledOnceWith(
      nextTarget, "bar"
    );
  });

  it(`"isExtensible"`, () => {
    spyHandler.getSpy("isExtensible").and.returnValue(false);
    expect(tail.isExtensible(
      shadowTarget, nextTarget, spyHandler
    )).toBe(false);

    spyHandler.expectSpiesClearExcept("isExtensible");
    expect(spyHandler.getSpy("isExtensible")).toHaveBeenCalledOnceWith(
      nextTarget
    );
  });

  it(`"ownKeys"`, () => {
    spyHandler.getSpy("ownKeys").and.returnValue(["foo", "bar"]);
    expect(
      tail.ownKeys(shadowTarget, nextTarget, spyHandler)
    ).toEqual(["foo", "bar"]);

    spyHandler.expectSpiesClearExcept("ownKeys");
    expect(spyHandler.getSpy("ownKeys")).toHaveBeenCalledOnceWith(
      nextTarget
    );
  });

  it(`"preventExtensions"`, () => {
    spyHandler.getSpy("preventExtensions").and.returnValue(false);
    expect(tail.preventExtensions(
      shadowTarget, nextTarget, spyHandler
    )).toBe(false);

    spyHandler.expectSpiesClearExcept("preventExtensions");
    expect(spyHandler.getSpy("preventExtensions")).toHaveBeenCalledOnceWith(
      nextTarget
    );
  });

  it(`"set"`, () => {
    spyHandler.getSpy("set").and.returnValue(true);
    expect(tail.set(
      shadowTarget, "foo", value, receiver, nextTarget, spyHandler, nextValue, nextReceiver
    )).toBe(true);

    spyHandler.expectSpiesClearExcept("set");
    expect(spyHandler.getSpy("set")).toHaveBeenCalledOnceWith(
      nextTarget, "foo", nextValue, nextReceiver
    );
  });

  it(`"setPrototypeOf"`, () => {
    spyHandler.getSpy("setPrototypeOf").and.returnValue(false);
    expect(tail.setPrototypeOf(
      shadowTarget, proto, nextTarget, spyHandler, nextProto
    )).toBe(false);

    spyHandler.expectSpiesClearExcept("setPrototypeOf");
    expect(spyHandler.getSpy("setPrototypeOf")).toHaveBeenCalledOnceWith(
      nextTarget, nextProto
    );
  });
});
