import {
  ModuleSourceDirectory,
  getModuleDefaultClass,
} from "#stage_utilities/source/AsyncSpecModules.mjs";
import type {
  NumberStringType
} from "#stage_utilities/fixtures/types/NumberStringType.mjs";

describe("stub-ts-morph: notImplemented", () => {
  const stageDir: ModuleSourceDirectory = {
    pathToDirectory: "#aspects/stubs/spec-generated",
    isAbsolutePath: true
  };

  it("with default return types throws for all methods", async () => {
    const NST_NotImplemented_Base = await getModuleDefaultClass<
      NumberStringType
    >
    (
      stageDir, "stubs/NotImplemented_Base.mjs"
    );

    expect(Reflect.ownKeys(NST_NotImplemented_Base.prototype)).toEqual([
      "constructor",
      "repeatForward",
      "repeatBack"
    ]);

    const nst = new NST_NotImplemented_Base;
    expect(() => nst.repeatForward("foo", 3)).toThrowError("not yet implemented");
    expect(() => nst.repeatBack(3, "foo")).toThrowError("not yet implemented");
  });
});
