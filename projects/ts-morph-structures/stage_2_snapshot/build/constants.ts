import {
  type ModuleSourceDirectory,
  pathToModule,
} from "#utilities/source/AsyncSpecModules.js";

const stageDir: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../.."
};

const snapshotDir = pathToModule(stageDir, "snapshot");
const sourceGeneratedDir = pathToModule(stageDir, "source/generated");

export {
  stageDir,
  snapshotDir,
  sourceGeneratedDir,
};
