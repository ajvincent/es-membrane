import {
  type ModuleSourceDirectory,
  pathToModule
} from "../../_01_stage_utilities/source/AsyncSpecModules.mjs";
import getTS_SourceFile from "../../_01_stage_utilities/source/getTS_SourceFile.mjs";

import NotImplementedStub from "../source/stub-ts-morph/notImplemented.mjs";
import VoidClassStub from "../source/stub-ts-morph/voidClass.mjs";
import SpyClassStub from "../source/stub-ts-morph/spyClass.mjs";
import PrependReturnStub from "../source/stub-ts-morph/prependReturn.mjs";

const stageDir: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../.."
}

const sourceFile = getTS_SourceFile(stageDir, "fixtures/types/NumberStringType.mts");

export default
async function runModule() : Promise<void>
{
  await Promise.all([
    build_NST_NI(),
    build_NST_Never(),
    build_NST_Void(),
    build_NST_Spy(),
    build_NST_PrependReturn(),
  ]);
}

async function build_NST_NI() : Promise<void>
{
  const classWriter = new NotImplementedStub(
    sourceFile,
    "NumberStringType",
    pathToModule(stageDir, "spec-generated/components/common/NST_NotImplemented.mts"),
    "NumberStringClass_NotImplemented",
  );
  classWriter.setNotImplementedOnly(false);

  classWriter.addImport(
    pathToModule(stageDir, "fixtures/types/NumberStringType.mjs"),
    "type NumberStringType",
    false
  );

  classWriter.buildClass();
  await classWriter.write();
}

async function build_NST_Never() : Promise<void>
{
  const classWriter = new NotImplementedStub(
    sourceFile,
    "NumberStringType",
    pathToModule(stageDir, "spec-generated/components/common/NST_Never.mts"),
    "NumberStringClass_Never",
  );
  classWriter.setNotImplementedOnly(true);

  classWriter.addImport(
    pathToModule(stageDir, "fixtures/types/NumberStringType.mjs"),
    "type NumberStringType",
    false
  );

  classWriter.buildClass();
  await classWriter.write();
}

async function build_NST_Void() : Promise<void>
{
  const classWriter = new VoidClassStub(
    sourceFile,
    "NumberStringType",
    pathToModule(stageDir, "spec-generated/components/common/NST_Void.mts"),
    "NumberStringClass_Void",
  );

  classWriter.addImport(
    pathToModule(stageDir, "fixtures/types/NumberStringType.mjs"),
    "type NumberStringType",
    false
  );

  classWriter.buildClass();
  await classWriter.write();
}

async function build_NST_Spy() : Promise<void>
{
  const classWriter = new SpyClassStub(
    sourceFile,
    "NumberStringType",
    pathToModule(stageDir, "spec-generated/components/common/NST_Spy.mts"),
    "NumberStringClass_Spy",
  );

  classWriter.addImport(
    pathToModule(stageDir, "fixtures/types/NumberStringType.mjs"),
    "type NumberStringType",
    false
  );

  classWriter.buildClass();
  await classWriter.write();
}

async function build_NST_PrependReturn() : Promise<void>
{
  const classWriter = new PrependReturnStub(
    sourceFile,
    "NumberStringType",
    pathToModule(stageDir, "spec-generated/components/common/NST_PrependReturn.mts"),
    "NumberStringClass_PrependReturn",
  );

  classWriter.addImport(
    pathToModule(stageDir, "fixtures/types/NumberStringType.mjs"),
    "type NumberStringType",
    false
  );

  classWriter.buildClass();
  await classWriter.write();
}
