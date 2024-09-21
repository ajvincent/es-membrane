import type { ModuleSourceDirectory } from "../source/AsyncSpecModules.mjs";
import getTS_SourceFile from "../source/getTS_SourceFile.mjs";

it("getTS_SourceFile works", () => {
  const startDir: ModuleSourceDirectory = {
    importMeta: import.meta,
    pathToDirectory: "../../source"
  };

  const sourceFile = getTS_SourceFile(startDir, "PromiseTypes.mts");
  expect(
    () => sourceFile.getFunctionOrThrow("PromiseAllParallel")
  ).not.toThrow();
});
