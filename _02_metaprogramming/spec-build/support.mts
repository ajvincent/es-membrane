import {
  type ModuleSourceDirectory,
  pathToModule
} from "../../_01_stage_utilities/source/AsyncSpecModules.mjs";
import getTS_SourceFile from "../../_01_stage_utilities/source/getTS_SourceFile.mjs";
import ConfigureStub from "../source/stub-generators/base/baseStub.mjs";

import StubMap from "../source/stub-generators/exports.mjs";

import {
  type MiddleParamBuilder as TransitionsEntryMidBuilder,
  type TailParamBuilder as TransitionsEntryTailBuilder,
} from "../source/stub-generators/transitions/decorators/headCall.mjs";


const stageDir: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../.."
}

const sourceFile = getTS_SourceFile(stageDir, "fixtures/types/NumberStringType.d.mts");

export default
async function runModule() : Promise<void>
{
  await Promise.all([
    build_NST_NI(),
    build_NST_Never(),
    build_NST_Void(),
    build_NST_Spy(),
    build_NST_PrependReturn(),
    build_NST_PrependReturnNI(),
    build_NST_Transition(),
    build_NST_Transition_Head(),
    build_NST_Transition_Tail(),
  ]);
}

async function build_NST_NI() : Promise<void>
{
  const classWriter = new StubMap.NotImplemented;
  classWriter.configureStub(
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
  const classWriter = new StubMap.NotImplemented;
  classWriter.configureStub(
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
  const classWriter = new StubMap.VoidClass;
  classWriter.configureStub(
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
  const classWriter = new StubMap.SpyClass;
  classWriter.configureStub(
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
  const classWriter = new StubMap.PrependReturn;
  classWriter.configureStub(
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

async function build_NST_PrependReturnNI() : Promise<void>
{
  const classWriter = new StubMap.PrependReturnNI;
  classWriter.configureStub(
    sourceFile,
    "NumberStringType",
    pathToModule(stageDir, "spec-generated/components/common/NST_PrependReturnNI.mts"),
    "NumberStringClass_PrependReturnNI",
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

async function build_NST_Transition() : Promise<void>
{
  const classWriter = new StubMap.TransitionsStub;
  classWriter.configureStub(
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
    (name) => name + "_tail",
  );

  classWriter.defineBuildMethodBody(
    function (this: ConfigureStub, structure): void {
      structure.parameters?.forEach(
        param => this.classWriter.writeLine(`void(${param.name});`)
      );

      this.classWriter.writeLine(`return s_tail.repeat(n_tail);`)
    }
  );

  classWriter.addImport(
    pathToModule(stageDir, "fixtures/types/NumberStringType.mjs"),
    "type NumberStringType",
    false
  );

  classWriter.buildClass();
  await classWriter.write();
}

async function build_NST_Transition_Head() : Promise<void>
{
  const classWriter = new StubMap.TransitionsHeadStub;
  classWriter.configureStub(
    sourceFile,
    "NumberStringType",
    pathToModule(stageDir, "spec-generated/components/transition/NST_Head.mts"),
    "NumberStringClass_Transitions_Head",
  );

  const midBuilder: TransitionsEntryMidBuilder = function(
    this: ConfigureStub, methodStructure, structure,
  ) : void
  {
    void(methodStructure);

    if (structure.name === "m1") {
      this.classWriter.writeLine(`const m1 = false;`);
      return;
    }

    if (structure.name === "m2") {
      this.classWriter.writeLine(`const m2: () => Promise<void> = () => Promise.resolve();`);
      return;
    }

    throw new Error("structure name mismatch: " + structure.name);
  };

  const tailBuilder: TransitionsEntryTailBuilder = function(
    this: ConfigureStub, methodStructure, structure, newParameterName,
  )
  {
    void(methodStructure);
    void(structure);
    if (newParameterName === "n_tail") {
      this.classWriter.writeLine(`const n_tail = n + 1;`);
      return;
    }

    if (newParameterName === "s_tail") {
      this.classWriter.writeLine(`const s_tail = s + "_tail";`);
      return;
    }

    throw new Error("new parameter name mismatch: " + newParameterName);
  }

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
    "NST_MiddleParameters",
    midBuilder,
    (name) => name + "_tail",
    tailBuilder
  );

  classWriter.addImport(
    pathToModule(stageDir, "fixtures/types/NumberStringType.mjs"),
    "type NumberStringType",
    false
  );

  classWriter.buildClass();
  await classWriter.write();
}

async function build_NST_Transition_Tail() : Promise<void>
{
  const classWriter = new StubMap.TransitionsTailStub
  classWriter.configureStub(
    sourceFile,
    "NumberStringType",
    pathToModule(stageDir, "spec-generated/components/transition/NST_Tail.mts"),
    "NumberStringClass_Transitions_Tail",
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
    (name) => name + "_tail",
  );

  classWriter.addImport(
    pathToModule(stageDir, "fixtures/types/NumberStringType.mjs"),
    "type NumberStringType",
    false
  );

  classWriter.buildClass();
  await classWriter.write();
}
