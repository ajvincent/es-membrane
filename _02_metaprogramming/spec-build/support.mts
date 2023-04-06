import {
  type ModuleSourceDirectory,
  pathToModule
} from "../../_01_stage_utilities/source/AsyncSpecModules.mjs";
import getTS_SourceFile from "../../_01_stage_utilities/source/getTS_SourceFile.mjs";

import { buildAspectClassRaw } from "../source/draft-20230323/AspectDecorators.mjs";

import NotImplementedStub from "../source/stub-ts-morph/notImplemented.mjs";
import VoidClassStub from "../source/stub-ts-morph/voidClass.mjs";
import SpyClassStub from "../source/stub-ts-morph/spyClass.mjs";

const stageDir: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../.."
}

const sourceFile = getTS_SourceFile(stageDir, "fixtures/types/NumberStringType.mts");

export default
async function runModule() : Promise<void>
{
  await Promise.all([
    buildRawClass(),
    build_NST_NI(),
    build_NST_Never(),
    build_NST_Void(),
    build_NST_Spy(),
  ]);
}

async function buildRawClass() : Promise<void>
{
  await buildAspectClassRaw(
    {
      exportName: "NumberStringType",
      importMeta: import.meta,
      pathToDirectory: "../../fixtures/types",
      leafName: "NumberStringType.mjs"
    },
    {
      exportName: "NumberStringClass",
      importMeta: import.meta,
      pathToDirectory: "../../fixtures/components/shared",
      leafName: "NumberStringClass.mjs"
    },
    {
      "repeatForward": [
        ["s", "string"],
        ["n", "number"],
      ],

      "repeatBack": [
        ["n", "number"],
        ["s", "string"],
      ],
    },
    {
      importMeta: import.meta,
      pathToDirectory: "../../fixtures/aspects"
    },
    {
      classInvariant: ["Spy", "Spy"]
    },
    {
      exportName: "NumberStringAspectClass",
      importMeta: import.meta,
      pathToDirectory: "../../spec-generated",
      leafName: "NumberStringAspectClass.mts"
    }
  );
}

async function build_NST_NI() : Promise<void>
{
  const classWriter = new NotImplementedStub(
    sourceFile,
    "NumberStringType",
    pathToModule(stageDir, "spec-generated/NST_NotImplemented.mts"),
    "NumberStringClass_NotImplemented",
    false
  );

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
    pathToModule(stageDir, "spec-generated/NST_Never.mts"),
    "NumberStringClass_Never",
    true
  );

  classWriter.addImport(
    pathToModule(stageDir, "fixtures/types/NumberStringType.mjs"),
    "type NumberStringType",
    false
  );

  classWriter.addImport(
    pathToModule(stageDir, "source/aspects/public-types/NotImplementedOnly.mjs"),
    "type NotImplementedOnly",
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
    pathToModule(stageDir, "spec-generated/NST_Void.mts"),
    "NumberStringClass_NotImplemented",
  );

  classWriter.addImport(
    pathToModule(stageDir, "fixtures/types/NumberStringType.mjs"),
    "type NumberStringType",
    false
  );

  classWriter.addImport(
    pathToModule(stageDir, "source/aspects/public-types/VoidMethodsOnly.mjs"),
    "type VoidMethodsOnly",
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
    pathToModule(stageDir, "spec-generated/NST_Spy.mts"),
    "NumberStringClass_Spy",
  );

  classWriter.addImport(
    pathToModule(stageDir, "fixtures/types/NumberStringType.mjs"),
    "type NumberStringType",
    false
  );

  classWriter.addImport(
    pathToModule(stageDir, "source/aspects/public-types/VoidMethodsOnly.mjs"),
    "type VoidMethodsOnly",
    false
  );

  classWriter.buildClass();
  await classWriter.write();
}
