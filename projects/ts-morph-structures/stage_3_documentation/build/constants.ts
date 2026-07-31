import {
  type ModuleSourceDirectory,
  pathToModule,
} from "#utilities/source/AsyncSpecModules.js";

const stageDir: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../.."
};

const snapshotDir: string = pathToModule(stageDir, "snapshot");
const typingsSnapshotDir: string = pathToModule(stageDir, "typings-snapshot");

export {
  snapshotDir,
  stageDir,
  typingsSnapshotDir,
};
