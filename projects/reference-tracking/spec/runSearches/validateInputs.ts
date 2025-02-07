import path from "node:path";

import {
  runSearchesInGuestEngineInternal,
} from "../../source/runSearchesInGuestEngineInternal.js";

import {
  referenceSpecDir,
} from "../support/projectRoot.js";

function getSpecPath(leafName: string): string {
  return path.join(referenceSpecDir, "validateArguments", leafName);
}

describe("report() throws when", () => {
  it("using a non-string key", async () => {
    const { graphs, reportCalls } = await runSearchesInGuestEngineInternal(
      getSpecPath("reportKeyIsNotAString.js")
    );
    expect(graphs.size).toBe(0);
    expect(reportCalls.size).toBe(1);
    expect(reportCalls.get("keyIsNumber")).toBe(`key must be a string`);
  });

  it("using the same key twice", async () => {
    const { graphs, reportCalls } = await runSearchesInGuestEngineInternal(
      getSpecPath("reportSameKeyTwice.js")
    );
    expect(graphs.size).toBe(0);
    expect(reportCalls.size).toBe(2);
    expect(reportCalls.get("key")).toBeTrue();
    expect(reportCalls.get("sameKeyTwice")).toBe(`key "key" is already defined`);
  });

  it("using a non-primitive value", async () => {
    const { graphs, reportCalls } = await runSearchesInGuestEngineInternal(
      getSpecPath("reportValueIsNotAPrimitive.js")
    );
    expect(graphs.size).toBe(0);
    expect(reportCalls.size).toBe(1);
    expect(
      reportCalls.get("valueIsNotAPrimitive")
    ).toBe(`value must be undefined, a string, a boolean, a number, or null.`);
  });
});

describe("runSearchesInGuestEngine throws when", () => {
  it("there aren't any arguments", async () => {
    const { graphs, reportCalls } = await runSearchesInGuestEngineInternal(
      getSpecPath("noArguments.js")
    );
    expect(graphs.size).toBe(0);
    expect(reportCalls.size).toBe(1);
    expect(reportCalls.get("noArguments")).toBe("resultsKey is not a string");
  });

  it("the results key isn't a string", async () => {
    const { graphs, reportCalls } = await runSearchesInGuestEngineInternal(
      getSpecPath("resultsKeyNotAString.js")
    );
    expect(graphs.size).toBe(0);
    expect(reportCalls.size).toBe(1);
    expect(reportCalls.get("resultsKeyMustBeAString")).toBe("resultsKey is not a string");
  });

  it("the target value isn't an object", async () => {
    const { graphs, reportCalls } = await runSearchesInGuestEngineInternal(
      getSpecPath("targetValueNotAnObject.js")
    );
    expect(graphs.size).toBe(0);
    expect(reportCalls.size).toBe(1);
    expect(reportCalls.get("targetKeyIsNumber")).toBe("6 is not an object");
  });

  it("the target value is null", async () => {
    const { graphs, reportCalls } = await runSearchesInGuestEngineInternal(
      getSpecPath("targetValueMustNotBeNull.js")
    );
    expect(graphs.size).toBe(0);
    expect(reportCalls.size).toBe(1);
    expect(reportCalls.get("targetKeyIsNull")).toBe("null is not an object");
  });

  it("the held values aren't an array", async () => {
    const { graphs, reportCalls } = await runSearchesInGuestEngineInternal(
      getSpecPath("heldValuesIsNotAnArray.js")
    );
    expect(graphs.size).toBe(0);
    expect(reportCalls.size).toBe(1);
    expect(reportCalls.get("heldValuesNotAnArray")).toBe("Expected an Array exotic object");
  });

  it("the held values includes a primitive", async () => {
    const { graphs, reportCalls } = await runSearchesInGuestEngineInternal(
      getSpecPath("heldValuesIncludesAPrimitive.js")
    );
    expect(graphs.size).toBe(0);
    expect(reportCalls.size).toBe(1);
    expect(reportCalls.get("heldValuesIncludesAPrimitive")).toBe(`heldValues[1] is not an object`);
  });

  it("strongReferencesOnly is not a boolean", async () => {
    const { graphs, reportCalls } = await runSearchesInGuestEngineInternal(
      getSpecPath("strongRefsIsNotABoolean.js")
    );
    expect(graphs.size).toBe(0);
    expect(reportCalls.size).toBe(1);
    expect(reportCalls.get("strongReferencesIsNotABoolean")).toBe(`strongReferencesOnly is not a boolean`);
  });

  it("resultsKey can only be used once per run", async () => {
    const { graphs, reportCalls } = await runSearchesInGuestEngineInternal(
      getSpecPath("duplicateSearchKeys.js")
    );
    expect(graphs.size).toBe(1);
    expect(reportCalls.size).toBe(1);
    expect(reportCalls.get("duplicateSearchKeys")).toBe(
      `You already have a search with the results key "duplicateSearchKeys"`
    );
  });
});
