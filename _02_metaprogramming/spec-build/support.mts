import {
  type ModuleSourceDirectory,
  pathToModule
} from "../../_01_stage_utilities/source/AsyncSpecModules.mjs";
import getTS_SourceFile from "../../_01_stage_utilities/source/getTS_SourceFile.mjs";

import StubMap from "../source/stub-generators/exports.mjs";
import TransitionsStub from "../source/stub-generators/transitions/baseStub.mjs";

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

    build_NST_Transition(),
  ]);
}

async function build_NST_NI() : Promise<void>
{
  const classWriter = new StubMap.NotImplemented(
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
  const classWriter = new StubMap.NotImplemented(
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
  const classWriter = new StubMap.VoidClass(
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
  const classWriter = new StubMap.SpyClass(
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
  const classWriter = new StubMap.PrependReturn(
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

async function build_NST_Transition() : Promise<void>
{
  const classWriter = new StubMap.TransitionsStub(
    sourceFile,
    "NumberStringType",
    pathToModule(stageDir, "spec-generated/components/transition/NST_Base.mts"),
    "NumberStringClass_Transitions",
  );

  classWriter.defineExtraParams(
    [
      {
        name: "m1",
        type: "boolean"
      },
      {
        name: "m2",
        type: "() => Promise<void>",
      }
    ],
    (name) => name + "_tail"
  );

  classWriter.addImport(
    pathToModule(stageDir, "fixtures/types/NumberStringType.mjs"),
    "type NumberStringType",
    false
  );

  classWriter.defineBuildMethodBody(
    function (this: TransitionsStub, structure): void {
      structure.parameters?.forEach(
        param => this.classWriter.writeLine(`void(${param.name});`)
      );

      this.classWriter.writeLine(`return s_tail.repeat(n_tail);`)
    }
  );

  classWriter.buildClass();
  await classWriter.write();
}
