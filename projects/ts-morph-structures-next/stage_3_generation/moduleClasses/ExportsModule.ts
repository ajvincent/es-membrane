import {
  ExportManager
} from "#stage_two/snapshot/source/exports.js";

import {
  pathToModule,
} from "#utilities/source/AsyncSpecModules.js";

import {
  distDir
} from "../build/constants.js";

export const internalExports = new ExportManager(pathToModule(distDir, "source/internal-exports.ts"));
export const publicExports = new ExportManager(pathToModule(distDir, "source/exports.ts"));
