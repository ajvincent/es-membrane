import { fileURLToPath } from "url";

import {
  type ModuleSourceDirectory,
  pathToModule,
  getModuleDefaultClass,
  getModuleDefaultClassWithArgs,
  getModulePart,
} from "../source/AsyncSpecModules.mjs";

import NumberStringClass from "../fixtures/NumberStringClass.mjs";
import type {
  NumberStringType
} from "../fixtures/types/NumberStringType.mjs";

import type {
  DoubleArrayPromiseType,
} from "../examples/source/DoubleArrayPromise.mjs";

const stageDir: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../.."
};

describe("AsyncSpecModules", () => {
  it("pathToModule provides resolved paths", () => {
    expect(
      pathToModule(stageDir, "spec/AsyncSpecModules.mjs")
    ).toBe(fileURLToPath(import.meta.url));

    expect(
      pathToModule({
        pathToDirectory: "#stage_utilities/spec",
        isAbsolutePath: true
      }, "AsyncSpecModules.mjs")
    ).toBe(fileURLToPath(import.meta.url));
  });

  it("getModuleDefaultClass retrieves an exported module", async () => {
    await expectAsync(getModuleDefaultClass<NumberStringType>(
      stageDir, "fixtures/NumberStringClass.mjs"
    )).toBeResolvedTo(NumberStringClass);
  });

  it("getModuleDefaultClassWithArgs retrieves an exported module as a class having arguments", async () => {
    const DoubleArrayPromise = await getModuleDefaultClassWithArgs<
      [number],
      DoubleArrayPromiseType
    >
    (
      stageDir, "examples/source/DoubleArrayPromise.mjs"
    );
    const doubleArray = new DoubleArrayPromise(100);
    expect((await doubleArray.run()).length).toBe(100);
  });

  it("getModulePart retrieves a non-default value a module exports", async () => {
    const pathToModuleAsPart = await getModulePart<
      "pathToModule", typeof pathToModule
    >
    (
      stageDir, "source/AsyncSpecModules.mjs", "pathToModule"
    );

    expect(pathToModuleAsPart).toBe(pathToModule);
  });
});
