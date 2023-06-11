import path from "path";

import {
  type ModuleSourceDirectory,
  pathToModule
} from "#stage_utilities/source/AsyncSpecModules.mjs";
import getTS_SourceFile from "#stage_utilities/source/getTS_SourceFile.mjs";

import createAspectDriver, {
  type CreateAspectDriverConfig
} from "../source/stubs/classBuilders/createAspectDriver.mjs";
import createInderminateReturn from "#aspect_dictionary/source/stubs/classBuilders/createIndeterminateReturn.mjs";

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
    buildIndeterminateReturn(),
  ]);
}

async function buildEmptyAspects() : Promise<void>
{
  const config: CreateAspectDriverConfig = {
    sourceFile,
    interfaceOrAliasName: "NumberStringType",
    destinationDir: path.join(generatedDir, "empty"),
    pathToBaseClassFile: classFile,
    className: "NumberStringClass",
    isDefaultImport: true
  };

  await createAspectDriver(config);
}

async function buildIndeterminateReturn(): Promise<void> {
  await createInderminateReturn(
    sourceFile,
    "NumberStringType",
    path.join(generatedDir, "empty"),
    "NumberStringClass",
  );
}
