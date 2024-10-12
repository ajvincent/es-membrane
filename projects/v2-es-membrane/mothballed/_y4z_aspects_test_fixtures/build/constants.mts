import {
  type ModuleSourceDirectory,
  pathToModule,
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import getTS_SourceFile from "#stage_utilities/source/getTS_SourceFile.mjs";

export const stageDir: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../.."
};

const sourceFile = getTS_SourceFile({
  isAbsolutePath: true,
  pathToDirectory: "#stage_utilities"
}, "fixtures/types/NumberStringType.d.mts");

const generatedDir = pathToModule(stageDir, "fixtures/generated");
const pathToTypeFile = "#stage_utilities/fixtures/types/NumberStringType.mjs";

export {
  sourceFile,
  generatedDir,
  pathToTypeFile,
};
