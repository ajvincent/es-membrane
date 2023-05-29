import path from "path";

import {
  type ModuleSourceDirectory,
  pathToModule
} from "#stage_utilities/source/AsyncSpecModules.mjs";
import getTS_SourceFile from "#stage_utilities/source/getTS_SourceFile.mjs";

import createAspectDriver from "../source/stub-build/createAspectDriver.mjs";

const stageDir: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../.."
}

const sourceFile = getTS_SourceFile(stageDir, "fixtures/types/NumberStringType.d.mts");
const generatedDir = pathToModule(stageDir, "spec-generated");

const classFile = pathToModule(stageDir, "fixtures/components/shared/NumberStringClass.mjs");

export default async function runModule() : Promise<void>
{
  await Promise.all([
    buildEmptyAspects(),
  ]);
}

async function buildEmptyAspects() : Promise<void>
{
  await createAspectDriver(
    sourceFile,
    "NumberStringType",
    path.join(generatedDir, "empty"),
    classFile,
    "NumberStringClass",
  );
}
