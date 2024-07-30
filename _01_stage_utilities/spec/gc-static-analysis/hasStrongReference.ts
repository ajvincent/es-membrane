import {
  loadSourceDirReferences
} from "#stage_utilities/source/gc-static-analysis/loadReferences.js";

import hasStrongParameterReference from "#stage_utilities/source/gc-static-analysis/hasStrongReference.js";

describe("hasStrongReference works", () => {
  beforeAll(async () => {
    await loadSourceDirReferences([

    ]);
  });

  describe("on WeakMap::", () => {
    it("set(key)", () => {
      expect(
        hasStrongParameterReference({
          className: "WeakMap",
          methodName: "set",
          parameterName: "key"
        })
      ).toBe(false);
    });

    it("set(value)", () => {
      expect(
        hasStrongParameterReference({
          className: "WeakMap",
          methodName: "set",
          parameterName: "value"
        })
      ).toBe(false);
    });
  });

  describe("on Map::", () => {
    it("set(key)", () => {
      expect(
        hasStrongParameterReference({
          className: "Map",
          methodName: "set",
          parameterName: "key"
        })
      ).toBe(true);
    });

    it("set(value)", () => {
      expect(
        hasStrongParameterReference({
          className: "Map",
          methodName: "set",
          parameterName: "value"
        })
      ).toBe(true);
    });
  });
});
