import ProxyMessageBase from "../../../source/core/broadcasters/ProxyMessageBase.mjs";

describe("ProxyMessageBase", () => {
  let message;

  const exception = {};
  beforeEach(() => {
    message = new ProxyMessageBase();
  });

  it("() initializes cleanly", () => {
    expect(message.stopped).toBe(false);
    expect(message.exceptionFound).toBe(false);
    expect(message.exception).toBe(undefined);
  });

  it(".stopIteration() sets flags to stop progress", () => {
    message.stopIteration();

    expect(message.stopped).toBe(true);
    expect(message.exceptionFound).toBe(false);
    expect(message.exception).toBe(undefined);
  });

  it(".throwException() sets flags to record an exception but does not itself throw", () => {
    message.throwException(exception);

    expect(message.stopped).toBe(true);
    expect(message.exceptionFound).toBe(true);
    expect(message.exception).toBe(exception);
  });

  it(".stopIteration() may be called more than once", () => {
    message.stopIteration();
    message.stopIteration();

    expect(message.stopped).toBe(true);
    expect(message.exceptionFound).toBe(false);
    expect(message.exception).toBe(undefined);
  });

  it(".throwException() records the exception after a .stopIteration() call", () => {
    message.stopIteration();
    message.throwException(exception);

    expect(message.stopped).toBe(true);
    expect(message.exceptionFound).toBe(true);
    expect(message.exception).toBe(exception);
  });

  it(".stopIteration() has no effect after a .throwException() call", () => {
    message.throwException(exception);
    message.stopIteration();

    expect(message.stopped).toBe(true);
    expect(message.exceptionFound).toBe(true);
    expect(message.exception).toBe(exception);
  });

  it(".throwException() will only support the first exception thrown", () => {
    message.throwException(exception);
    message.throwException({});

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