import path from "path";
import url from "url";

import {
  type ModuleSourceDirectory,
  pathToModule
} from "../../_01_stage_utilities/source/AsyncSpecModules.mjs";
import getTS_SourceFile from "../../_01_stage_utilities/source/getTS_SourceFile.mjs";

import { buildAspectClassRaw } from "../source/AspectDecorators.mjs";

import NotImplementedStub from "../source/stub-ts-morph/notImplemented.mjs";
import VoidClassStub from "../source/stub-ts-morph/voidClass.mjs";
import SpyClassStub from "../source/stubGenerators/spyClass.mjs";
import {
  NST_Methods,
} from "../fixtures/NumberStringType.mjs";

const stageDir: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../.."
}

const sourceFile = getTS_SourceFile(stageDir, "fixtures/NumberStringType.mts");

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
      pathToDirectory: "../../fixtures",
      leafName: "NumberStringType.mjs"
    },
    {
      exportName: "NumberStringClass",
      importMeta: import.meta,
      pathToDirectory: "../../fixtures",
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
    pathToModule(stageDir, "fixtures/NumberStringType.mjs"),
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
    pathToModule(stageDir, "fixtures/NumberStringType.mjs"),
    "type NumberStringType",
    false
  );

  classWriter.addImport(
    pathToModule(stageDir, "source/methodsOnly.mjs"),
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
    pathToModule(stageDir, "fixtures/NumberStringType.mjs"),
    "type NumberStringType",
    false
  );

  classWriter.addImport(
    pathToModule(stageDir, "source/methodsOnly.mjs"),
    "type VoidMethodsOnly",
    false
  );

  classWriter.buildClass();
  await classWriter.write();
}

async function build_NST_Spy() : Promise<void>
{
  const methods = SpyClassStub.cloneDictionary(
    NST_Methods,
    (fieldName, signature) => {
      signature.returnType = "void";
    }
  );

  const stageDir = path.normalize(path.join(
    url.fileURLToPath(import.meta.url), "../.."
  ));

  const classWriter = new SpyClassStub(
    path.join(stageDir, "spec-generated/NST_Spy.mts"),
    "NumberStringClass_Spy",
    "implements VoidMethodsOnly<NumberStringType>",
    methods,
  );

  classWriter.addImport(
    path.join(stageDir, "fixtures/NumberStringType.mjs"),
    "type NumberStringType",
    false
  );

  classWriter.addImport(
    path.join(stageDir, "source/methodsOnly.mjs"),
    "type VoidMethodsOnly",
    false
  );

  classWriter.buildClass();
  await classWriter.write();
}
