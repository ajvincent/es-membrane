import {
  type ModuleSourceDirectory,
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import getTS_SourceFile from "#stage_utilities/source/getTS_SourceFile.mjs";

const stageDir: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../.."
};

const NST_SourceDirectory: ModuleSourceDirectory = {
  isAbsolutePath: true,
  pathToDirectory: "#stage_utilities",
};

const NST_Path_Base = "fixtures/types/NumberStringType.d.mts";

const NumberStringTypeFile = getTS_SourceFile(
  NST_SourceDirectory,
  NST_Path_Base,
);

const NST_Path = NST_SourceDirectory.pathToDirectory + "/" + NST_Path_Base;

const pathToTypeFile = "#stage_utilities/fixtures/types/NumberStringType.mjs";

export {
  NST_Path,
  NumberStringTypeFile,
  pathToTypeFile,
  stageDir,
};
