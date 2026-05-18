import {
  getModuleDefaultClassWithArgs,
  ModuleSourceDirectory,
} from "../../source/AsyncSpecModules.js";

import type {
  DoubleArrayPromiseType,
} from "./DoubleArrayPromise.js";

const moduleSource: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: ".."
};

const DoubleArrayPromise = await getModuleDefaultClassWithArgs<
  [number],
  DoubleArrayPromiseType
>(
  moduleSource, "DoubleArrayPromise.js"
);

const doubleArray = new DoubleArrayPromise(100);

export { doubleArray };
