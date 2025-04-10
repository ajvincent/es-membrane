import {
  runSearchesInGuestEngineInternal,
} from "../../source/runSearchesInGuestEngineInternal.js";

import {
  getReferenceSpecPath,
} from "../support/projectRoot.js";

describe("report() throws when", () => {
  it("using a non-string key", async () => {
    const { graphs, reportCalls } = await runSearchesInGuestEngineInternal(
      getReferenceSpecPath("validateArguments/reportKeyIsNotAString.js")
    );
    expect(graphs.size).toBe(0);
    expect(reportCalls.size).toBe(1);
    expect(reportCalls.get("keyIsNumber")).toBe(`key must be a string`);
  });

  it("using the same key twice", async () => {
    const { graphs, reportCalls } = await runSearchesInGuestEngineInternal(
      getReferenceSpecPath("validateArguments/reportSameKeyTwice.js")
    );
    expect(graphs.size).toBe(0);
    expect(reportCalls.size).toBe(2);
    expect(reportCalls.get("key")).toBeTrue();
    expect(reportCalls.get("sameKeyTwice")).toBe(`key "key" is already defined`);
  });

  it("using a non-primitive value", async () => {
    const { graphs, reportCalls } = await runSearchesInGuestEngineInternal(
      getReferenceSpecPath("validateArguments/reportValueIsNotAPrimitive.js")
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
      getReferenceSpecPath("validateArguments/noArguments.js")
    );
    expect(graphs.size).toBe(0);
    expect(reportCalls.size).toBe(1);
    expect(reportCalls.get("noArguments")).toBe("resultsKey is not a string");
  });

  it("the results key isn't a string", async () => {
    const { graphs, reportCalls } = await runSearchesInGuestEngineInternal(
      getReferenceSpecPath("validateArguments/resultsKeyNotAString.js")
    );
    expect(graphs.size).toBe(0);
    expect(reportCalls.size).toBe(1);
    expect(reportCalls.get("resultsKeyMustBeAString")).toBe("resultsKey is not a string");
  });

  it("the target value isn't an object", async () => {
    const { graphs, reportCalls } = await runSearchesInGuestEngineInternal(
      getReferenceSpecPath("validateArguments/targetValueNotAnObject.js")
    );
    expect(graphs.size).toBe(0);
    expect(reportCalls.size).toBe(1);
    expect(reportCalls.get("targetKeyIsNumber")).toBe("6 is not an object or a symbol");
  });

  it("the target value is null", async () => {
    const { graphs, reportCalls } = await runSearchesInGuestEngineInternal(
      getReferenceSpecPath("validateArguments/targetValueMustNotBeNull.js")
    );
    expect(graphs.size).toBe(0);
    expect(reportCalls.size).toBe(1);
    expect(reportCalls.get("targetKeyIsNull")).toBe("null is not an object or a symbol");
  });

  it("the held values aren't an array", async () => {
    const { graphs, reportCalls } = await runSearchesInGuestEngineInternal(
      getReferenceSpecPath("validateArguments/heldValuesIsNotAnArray.js")
    );
    expect(graphs.size).toBe(0);
    expect(reportCalls.size).toBe(1);
    expect(reportCalls.get("heldValuesNotAnArray")).toBe("Expected an Array exotic object");
  });

  it("the held values includes a primitive", async () => {
    const { graphs, reportCalls } = await runSearchesInGuestEngineInternal(
      getReferenceSpecPath("validateArguments/heldValuesIncludesAPrimitive.js")
    );
    expect(graphs.size).toBe(0);
    expect(reportCalls.size).toBe(1);
    expect(reportCalls.get("heldValuesIncludesAPrimitive")).toBe(`true is not an object or a symbol`);
  });

  it("strongReferencesOnly is not a boolean", async () => {
    const { graphs, reportCalls } = await runSearchesInGuestEngineInternal(
      getReferenceSpecPath("validateArguments/strongRefsIsNotABoolean.js")
    );
    expect(graphs.size).toBe(0);
    expect(reportCalls.size).toBe(1);
    expect(reportCalls.get("strongReferencesIsNotABoolean")).toBe(`strongReferencesOnly is not a boolean`);
  });

  it("resultsKey can only be used once per run", async () => {
    const { graphs, reportCalls } = await runSearchesInGuestEngineInternal(
      getReferenceSpecPath("validateArguments/duplicateSearchKeys.js")
    );
    expect(graphs.size).toBe(1);
    expect(reportCalls.size).toBe(1);
    expect(reportCalls.get("duplicateSearchKeys")).toBe(
      `You already have a search with the results key "duplicateSearchKeys"`
    );
  });
});
