import ProxyInitMessage from "../../../source/core/broadcasters/ProxyInitMessage.mjs";
import ProxyMessageBase from "../../../source/core/broadcasters/ProxyMessageBase.mjs";

import {
  expectValueDescriptor
} from "../../helpers/expectDataDescriptor.mjs";

describe("ProxyInitMessage", () => {
  let message;

  const proxy = {}, realTarget = {}, graph = {};
  beforeEach(() => {
    message = new ProxyInitMessage(proxy, realTarget, graph, true);
  });

  afterEach(() => {
    message = null;
  });

  it("inherits from ProxyMessageBase", () => {
    expect(message instanceof ProxyMessageBase).toBe(true);
  });

  it("() initializes cleanly with an origin graph", () => {
    expectValueDescriptor(
      proxy, false, true, false, Reflect.getOwnPropertyDescriptor(message, "proxy")
    );
    expectValueDescriptor(
      realTarget, false, true, false, Reflect.getOwnPropertyDescriptor(message, "realTarget")
    );
    expectValueDescriptor(
      graph, false, true, false, Reflect.getOwnPropertyDescriptor(message, "graph")
    );
    expectValueDescriptor(
      true, false, true, false, Reflect.getOwnPropertyDescriptor(message, "isOriginGraph")
    );
  });

  it("() initializes cleanly with a foreign graph", () => {
    message = new ProxyInitMessage(proxy, realTarget, graph, false);
    expectValueDescriptor(
      proxy, false, true, false, Reflect.getOwnPropertyDescriptor(message, "proxy")
    );
    expectValueDescriptor(
      realTarget, false, true, false, Reflect.getOwnPropertyDescriptor(message, "realTarget")
    );
    expectValueDescriptor(
      graph, false, true, false, Reflect.getOwnPropertyDescriptor(message, "graph")
    );
    expectValueDescriptor(
      false, false, true, false, Reflect.getOwnPropertyDescriptor(message, "isOriginGraph")
    );
  });

  it("can have additional properties", () => {
    expect(Reflect.defineProperty(message, "foo", {
      value: true,
      writable: true,
      enumerable: true,
      configurable: true
    })).toBe(true);
    expect(message.foo).toBe(true);
  });
});
