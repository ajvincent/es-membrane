import ProxyInitMessage from "../../../source/core/broadcasters/ProxyInitMessage.mjs";

describe("ProxyInitMessage", () => {
  let message;

  const proxy = {}, realTarget = {}, graph = {}, exception = {};
  beforeEach(() => {
    message = new ProxyInitMessage(proxy, realTarget, graph, true);
  });

  afterEach(() => {
    message = null;
  });

  it("() initializes cleanly with an origin graph", () => {
    expect(message.proxy).toBe(proxy);
    expect(message.realTarget).toBe(realTarget);
    expect(message.graph).toBe(graph);
    expect(message.isOriginGraph).toBe(true);
    expect(message.stopped).toBe(false);
    expect(message.exceptionFound).toBe(false);
    expect(message.exception).toBe(undefined);
  });

  it("() initializes cleanly with a foreign graph", () => {
    message = new ProxyInitMessage(proxy, realTarget, graph, false);
    expect(message.proxy).toBe(proxy);
    expect(message.realTarget).toBe(realTarget);
    expect(message.graph).toBe(graph);
    expect(message.isOriginGraph).toBe(false);
    expect(message.stopped).toBe(false);
    expect(message.exceptionFound).toBe(false);
    expect(message.exception).toBe(undefined);
  });

  it(".stopIteration() sets flags to stop progress", () => {
    message.stopIteration();

    expect(message.proxy).toBe(proxy);
    expect(message.realTarget).toBe(realTarget);
    expect(message.graph).toBe(graph);
    expect(message.stopped).toBe(true);
    expect(message.exceptionFound).toBe(false);
    expect(message.exception).toBe(undefined);
  });

  it(".throwException() sets flags to record an exception but does not itself throw", () => {
    message.throwException(exception);

    expect(message.proxy).toBe(proxy);
    expect(message.realTarget).toBe(realTarget);
    expect(message.stopped).toBe(true);
    expect(message.exceptionFound).toBe(true);
    expect(message.exception).toBe(exception);
  });

  it(".stopIteration() may be called more than once", () => {
    message.stopIteration();
    message.stopIteration();

    expect(message.proxy).toBe(proxy);
    expect(message.realTarget).toBe(realTarget);
    expect(message.graph).toBe(graph);
    expect(message.stopped).toBe(true);
    expect(message.exceptionFound).toBe(false);
    expect(message.exception).toBe(undefined);
  });

  it(".throwException() records the exception after a .stopIteration() call", () => {
    message.stopIteration();
    message.throwException(exception);

    expect(message.proxy).toBe(proxy);
    expect(message.realTarget).toBe(realTarget);
    expect(message.graph).toBe(graph);
    expect(message.stopped).toBe(true);
    expect(message.exceptionFound).toBe(true);
    expect(message.exception).toBe(exception);
  });

  it(".stopIteration() has no effect after a .throwException() call", () => {
    message.throwException(exception);
    message.stopIteration();

    expect(message.proxy).toBe(proxy);
    expect(message.realTarget).toBe(realTarget);
    expect(message.graph).toBe(graph);
    expect(message.stopped).toBe(true);
    expect(message.exceptionFound).toBe(true);
    expect(message.exception).toBe(exception);
  });

  it(".throwException() will only support the first exception thrown", () => {
    message.throwException(exception);
    message.throwException({});

    expect(message.proxy).toBe(proxy);
    expect(message.realTarget).toBe(realTarget);
    expect(message.graph).toBe(graph);
    expect(message.stopped).toBe(true);
    expect(message.exceptionFound).toBe(true);
    expect(message.exception).toBe(exception);
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
