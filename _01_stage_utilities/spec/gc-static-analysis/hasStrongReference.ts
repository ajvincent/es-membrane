import hasStrongParameterReference from "#stage_utilities/source/gc-static-analysis/hasStrongReference.js";
import createSourcesAndClasses from "#stage_utilities/source/gc-static-analysis/createSourcesAndClasses.js";

describe("hasStrongReference works", () => {
  beforeAll(async () => {
    await createSourcesAndClasses("_01_stage_utilities/source/collections", false);
  });

  describe("on WeakMap::", () => {
    it("set(key)", async () => {
      await expectAsync(
        hasStrongParameterReference({
          className: "WeakMap",
          methodName: "set",
          parameterName: "key",
          externalReferences: [],
        })
      ).toBeResolvedTo(false);
    });

    it("set(value)", async () => {
      await expectAsync(
        hasStrongParameterReference({
          className: "WeakMap",
          methodName: "set",
          parameterName: "value",
          externalReferences: [],
        })
      ).toBeResolvedTo(false);
    });

    it("set(value) with external reference to key", async () => {
      await expectAsync(
        hasStrongParameterReference({
          className: "WeakMap",
          methodName: "set",
          parameterName: "value",
          externalReferences: ["key"],
        })
      ).toBeResolvedTo(true);
    });
  });

  describe("on Map::", () => {
    it("set(key)", async () => {
      await expectAsync(
        hasStrongParameterReference({
          className: "Map",
          methodName: "set",
          parameterName: "key",
          externalReferences: [],
        })
      ).toBeResolvedTo(true);
    });

    it("set(value)", async() => {
      await expectAsync(
        hasStrongParameterReference({
          className: "Map",
          methodName: "set",
          parameterName: "value",
          externalReferences: [],
        })
      ).toBeResolvedTo(true);
    });
  });

  describe("on DefaultWeakMap::", () => {
    it("set(key)", async () => {
      await expectAsync(
        hasStrongParameterReference({
          className: "DefaultWeakMap",
          methodName: "set",
          parameterName: "key",
          externalReferences: [],
        })
      ).toBeResolvedTo(false);
    });

    it("set(value)", async () => {
      await expectAsync(
        hasStrongParameterReference({
          className: "DefaultWeakMap",
          methodName: "set",
          parameterName: "value",
          externalReferences: [],
        })
      ).toBeResolvedTo(false);
    });

    it("set(value) with external reference to key", async () => {
      await expectAsync(
        hasStrongParameterReference({
          className: "DefaultWeakMap",
          methodName: "set",
          parameterName: "value",
          externalReferences: ["key"],
        })
      ).toBeResolvedTo(true);
    });

    xit("getDefault(key)", async () => {
      await expectAsync(
        hasStrongParameterReference({
          className: "DefaultWeakMap",
          methodName: "getDefault",
          parameterName: "key",
          externalReferences: []
        })
      ).toBeRejected();
    });
  });

  describe("on DefaultMap::", () => {
    it("set(key)", async () => {
      await expectAsync(
        hasStrongParameterReference({
          className: "DefaultMap",
          methodName: "set",
          parameterName: "key",
          externalReferences: [],
        })
      ).toBeResolvedTo(true);
    });

    it("set(value)", async () => {
      await expectAsync(
        hasStrongParameterReference({
          className: "DefaultMap",
          methodName: "set",
          parameterName: "value",
          externalReferences: [],
        })
      ).toBeResolvedTo(true);
    });
  });
});
