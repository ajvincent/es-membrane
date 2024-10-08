import { fileURLToPath } from "url";

import {
  type ModuleSourceDirectory,
  pathToModule,
  getModuleDefaultClass,
  getModuleDefaultClassWithArgs,
  getModulePart,
} from "../source/AsyncSpecModules.js";

import NumberStringClass from "../fixtures/NumberStringClass.js";
import type {
  NumberStringType
} from "../fixtures/types/NumberStringType.js";

import type {
  DoubleArrayPromiseType,
} from "../examples/source/DoubleArrayPromise.js";

const stageDir: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../.."
};

describe("AsyncSpecModules", () => {
  it("pathToModule provides resolved paths", () => {
    expect(
      pathToModule(stageDir, "spec/AsyncSpecModules.js")
    ).toBe(fileURLToPath(import.meta.url));

    expect(
      pathToModule({
        pathToDirectory: "#stage_utilities/spec",
        isAbsolutePath: true
      }, "AsyncSpecModules.js")
    ).toBe(fileURLToPath(import.meta.url));
  });

  it("getModuleDefaultClass retrieves an exported module", async () => {
    await expectAsync(getModuleDefaultClass<NumberStringType>(
      stageDir, "fixtures/NumberStringClass.js"
    )).toBeResolvedTo(NumberStringClass);
  });

  it("getModuleDefaultClassWithArgs retrieves an exported module as a class having arguments", async () => {
    const DoubleArrayPromise = await getModuleDefaultClassWithArgs<
      [number],
      DoubleArrayPromiseType
    >
    (
      stageDir, "examples/source/DoubleArrayPromise.js"
    );
    const doubleArray = new DoubleArrayPromise(100);
    expect((await doubleArray.run()).length).toBe(100);
  });

  it("getModulePart retrieves a non-default value a module exports", async () => {
    const pathToModuleAsPart = await getModulePart<
      "pathToModule", typeof pathToModule
    >
    (
      stageDir, "source/AsyncSpecModules.js", "pathToModule"
    );

    expect(pathToModuleAsPart).toBe(pathToModule);
  });
});
