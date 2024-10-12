import type { ModuleSourceDirectory } from "../source/AsyncSpecModules.js";
import getTS_SourceFile from "../source/getTS_SourceFile.js";

it("getTS_SourceFile works", () => {
  const startDir: ModuleSourceDirectory = {
    importMeta: import.meta,
    pathToDirectory: "../../source"
  };

  const sourceFile = getTS_SourceFile(startDir, "PromiseTypes.ts");
  expect(
    () => sourceFile.getFunctionOrThrow("PromiseAllParallel")
  ).not.toThrow();
});
