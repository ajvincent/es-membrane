import LinkedListHandler from "../../source/ProxyHandlers/LinkedList.mjs";

import Membrane from "../../source/core/Membrane.mjs";

import {
  expectValueDescriptor
} from "../helpers/expectDataDescriptor.mjs";

const objectGraph = {};

describe("LinkedListHandler", () => {
  let handler;
  beforeEach(() => {
    handler = new LinkedListHandler(objectGraph);
  });

  it("class is frozen", () => {
    expect(Object.isFrozen(LinkedListHandler)).toBe(true);
    expect(Object.isFrozen(LinkedListHandler.prototype)).toBe(true);
  });

  it("instances are extensible", () => {
    expect(Reflect.isExtensible(handler)).toBe(true);
  });

  xit("is exposed on Membrane", () => {
    const desc = Reflect.getOwnPropertyDescriptor(Membrane, "LinkedListHandler");
    expectValueDescriptor(LinkedListHandler, false, true, false, desc);
  });

  it("has the object graph property", () => {
    const desc = Reflect.getOwnPropertyDescriptor(handler, "objectGraph");
    expectValueDescriptor(objectGraph, false, true, false, desc);
  });

  it("forwards invokeNextHandler to its NextHandlerMap", () => {
    const nextHandler = jasmine.createSpyObj("handler", ["ownKeys"]);

    // allowed because it's a package property
    handler.nextHandlerMap.setDefault("ownKeys", nextHandler);

    const shadowTarget = {};
    const args = [{}, {}, {}];
    const rv = {};
    nextHandler.ownKeys.and.returnValue(rv);

    expect(handler.invokeNextHandler("ownKeys", shadowTarget, ...args)).toBe(rv);
    expect(nextHandler.ownKeys).toHaveBeenCalledOnceWith(shadowTarget, ...args);
  });
});
