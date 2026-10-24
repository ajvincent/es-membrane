import {
  type ModuleSourceDirectory,
} from "#utilities/source/AsyncSpecModules.js";

const stageDir: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: ".."
};

const fixturesDir: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../fixtures"
};

export {
  fixturesDir,
  stageDir,
};
