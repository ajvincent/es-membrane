import {
  type ModuleSourceDirectory,
  pathToModule,
} from "#stage_utilities/source/AsyncSpecModules.js";

const stageDir: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../.."
};

const sourceGeneratedDir = pathToModule(stageDir, "source/generated");

export {
  stageDir,
  sourceGeneratedDir,
};
