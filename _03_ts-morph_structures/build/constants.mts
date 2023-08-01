import {
  type ModuleSourceDirectory,
  pathToModule,
} from "#stage_utilities/source/AsyncSpecModules.mjs";

export const stageDir: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../.."
};

const sourceGeneratedDir = pathToModule(stageDir, "source/generated");

export {
  sourceGeneratedDir,
};
