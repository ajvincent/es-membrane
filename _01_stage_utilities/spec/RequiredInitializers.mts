import {
  RequiredInitializers,
  type RequiredState
} from "../source/RequiredInitializers.mjs";

it("RequiredInitializers provides a one-way path to ensuring flags are set, then cleared, then empty", () => {
  function message(allowedPrevious: RequiredState, assertCurrent: RequiredState, currentState: RequiredState) : string
  {
    return `RequiredInitializers state mismatch: expected ${allowedPrevious} or ${assertCurrent}, found ${currentState}`;
  }

  const initializer = new RequiredInitializers;

  expect(
    () => initializer.check()
  ).toThrowError(message("ready", "checkFired", "initial"));

  initializer.add("one");
  expect(
    () => initializer.check()
  ).toThrowError(message("ready", "checkFired", "adding"));

  expect(
    () => initializer.add("one")
  ).toThrowError("key already required");

  initializer.add("two");
  initializer.add("three");
  expect(initializer.getState()).toBe("adding");

  expect(
    () => initializer.resolve("zero")
  ).toThrowError("unknown or already resolved initializer key: zero");
  expect(initializer.getState()).toBe("adding");

  initializer.resolve("one");
  expect(initializer.getState()).toBe("resolving");
  expect(
    () => initializer.check()
  ).toThrowError(message("ready", "checkFired", "resolving"));
  expect(
    () => initializer.add("four")
  ).toThrowError(message("initial", "adding", "resolving"));

  initializer.resolve("three");
  expect(
    () => initializer.check()
  ).toThrowError(message("ready", "checkFired", "resolving"));
  expect(
    () => initializer.add("four")
  ).toThrowError(message("initial", "adding", "resolving"));

  expect(
    () => initializer.resolve("three")
  ).toThrowError("unknown or already resolved initializer key: three");
  expect(initializer.getState()).toBe("resolving");

  initializer.resolve("two");
  expect(initializer.getState()).toBe("ready");
  expect(
    () => initializer.add("four")
  ).toThrowError(message("initial", "adding", "ready"));
  expect(
    () => initializer.resolve("one")
  ).toThrowError("unknown or already resolved initializer key: one");
  expect(initializer.getState()).toBe("ready");

  initializer.check();
  expect(initializer.getState()).toBe("checkFired");

  expect(
    () => initializer.add("four")
  ).toThrowError(message("initial", "adding", "checkFired"));
  expect(
    () => initializer.resolve("one")
  ).toThrowError("unknown or already resolved initializer key: one");

  initializer.check();
  expect(initializer.getState()).toBe("checkFired");
});
