import {
  type ModuleSourceDirectory,
  pathToModule
} from "#stage_utilities/source/AsyncSpecModules.mjs";
import getTS_SourceFile from "#stage_utilities/source/getTS_SourceFile.mjs";

import createAspectDriver, {
  type CreateAspectDriverConfig
} from "../source/stubs/classBuilders/createAspectDriver.mjs";

const stageDir: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../.."
}

const fixturesDir: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../../../_03z_aspects_test_fixtures"
};

const sourceFile = getTS_SourceFile(fixturesDir, "fixtures/types/NumberStringType.d.mts");
const generatedDir = pathToModule(stageDir, "spec-generated");

export default async function runModule() : Promise<void>
{
  await Promise.all([
    buildEmptyAspects(),
  ]);
}

async function buildEmptyAspects() : Promise<void>
{
  const config: CreateAspectDriverConfig = {
    sourceFile,
    interfaceOrAliasName: "NumberStringType",
    destinationDir: generatedDir,
    pathToBaseClassFile: pathToModule(
      fixturesDir, "fixtures/components/shared/NumberStringClass.mjs"
    ),
    className: "NumberStringClass",
    isDefaultImport: true
  };

  await createAspectDriver(config);
}
