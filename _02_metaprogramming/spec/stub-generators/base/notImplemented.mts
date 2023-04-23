import {
  type ModuleSourceDirectory,
  getModuleDefaultClass,
} from "../../../../_01_stage_utilities/source/AsyncSpecModules.mjs";

import type {
  NotImplementedOnly,
} from "../../../source/aspects/types/export-types.mjs";

import type {
  NumberStringType
} from "../../../fixtures/types/NumberStringType.mjs";

describe("stub-ts-morph: notImplemented", () => {
  const generatedDir: ModuleSourceDirectory = {
    importMeta: import.meta,
    pathToDirectory: "../../../../spec-generated/"
  };

  it("with default return types throws for all methods", async () => {
    const NST_NotImplemented = await getModuleDefaultClass<NumberStringType>(
      generatedDir, "components/common/NST_NotImplemented.mjs"
    );

    expect(Reflect.ownKeys(NST_NotImplemented.prototype)).toEqual([
      "constructor",
      "repeatForward",
      "repeatBack"
    ]);

    const nst = new NST_NotImplemented;
    expect(() => nst.repeatForward("foo", 3)).toThrowError("not yet implemented");
    expect(() => nst.repeatBack(3, "foo")).toThrowError("not yet implemented");
  });

  it("with 'never' return types throws for all methods", async () => {
    const NST_Never = await getModuleDefaultClass<NotImplementedOnly<NumberStringType>>(
      generatedDir, "components/common/NST_Never.mjs"
    );

    expect(Reflect.ownKeys(NST_Never.prototype)).toEqual([
      "constructor",
      "repeatForward",
      "repeatBack"
    ]);

    const nst = new NST_Never;
    expect(() => nst.repeatForward("foo", 3)).toThrowError("not yet implemented");
    expect(() => nst.repeatBack(3, "foo")).toThrowError("not yet implemented");
  });
});
