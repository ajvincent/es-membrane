import {
  type ModuleSourceDirectory,
  pathToModule,
} from "#stage_utilities/source/AsyncSpecModules.mjs";

const stageDir: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../.."
};

const sourceGeneratedDir = pathToModule(stageDir, "source/generated");

export {
  stageDir,
  sourceGeneratedDir,
};
