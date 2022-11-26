import {
  getModuleDefaultClassWithArgs,
  ModuleSourceDirectory,
} from "../../source/AsyncSpecModules.mjs";

import type {
  DoubleArrayPromiseType,
} from "./DoubleArrayPromise.mjs";

const moduleSource: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: ".."
};

const DoubleArrayPromise = await getModuleDefaultClassWithArgs<
  [number],
  DoubleArrayPromiseType
>(
  moduleSource, "DoubleArrayPromise.mjs"
);

const doubleArray = new DoubleArrayPromise(100);
console.log(await doubleArray.run());
// [ 0, 2, 4, 6, ... 196, 198]
