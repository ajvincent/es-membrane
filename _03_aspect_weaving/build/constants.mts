import {
  type ModuleSourceDirectory,
  pathToModule,
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import getTS_SourceFile from "#stage_utilities/source/getTS_SourceFile.mjs";

export const stageDir: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../.."
};

const sourceFile = getTS_SourceFile(stageDir, "fixtures/types/NumberStringType.d.mts");

const destinationDir = pathToModule(stageDir, "fixtures/generated/stubs");
const pathToTypeFile = pathToModule(stageDir, "fixtures/types/NumberStringType.mjs");

export {
  sourceFile,
  destinationDir,
  pathToTypeFile,
};
