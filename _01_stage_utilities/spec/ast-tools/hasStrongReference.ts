import {
  loadSourceDirReferences
} from "#stage_utilities/source/ast-tools/loadReferences.js";

import hasStrongParameterReference from "#stage_utilities/source/ast-tools/hasStrongReference.js";

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

    xit("set(value)", () => {
      expect(
        hasStrongParameterReference({
          className: "WeakMap",
          methodName: "set",
          parameterName: "value"
        })
      ).toBe(false);
    });
  });
});
