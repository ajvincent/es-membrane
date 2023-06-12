import {
  type ModuleSourceDirectory,
  pathToModule
} from "#stage_utilities/source/AsyncSpecModules.mjs";
import getTS_SourceFile from "#stage_utilities/source/getTS_SourceFile.mjs";
import ConfigureStub from "../source/base/ConfigureStub.mjs";

import StubClassSet, {
  type StubClassSetConfiguration
} from "../source/StubClassSet.mjs";

const stageDir: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../.."
}

const sourceFile = getTS_SourceFile(stageDir, "fixtures/types/NumberStringType.d.mts");

export default
async function runModule() : Promise<void>
{
  const config: StubClassSetConfiguration = {
    sourceFile,
    interfaceOrAliasName: "NumberStringType",
    destinationDir: pathToModule(stageDir, "spec-generated"),
    className: "NumberStringClass",
    pathToTypeFile: pathToModule(stageDir, "fixtures/types/NumberStringType.mjs"),

    middleParameters: [
      {
        name: "m1",
        type: "boolean"
      },
      {
        name: "m2",
        type: "() => Promise<void>",
      }
    ],

    tailParamRenamer: (name) => name + "_tail",

    transitionsHead: {
      midParamsTypeAlias: "NST_MiddleParameters",
      midBuilder: function(
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
      },
      tailBuilder: function(
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
    },

    transitionsMiddle: {
      buildMethodBody: function (this: ConfigureStub, structure, remainingArgs): void {
        this.voidArguments(remainingArgs);
        this.classWriter.writeLine(`return s_tail.repeat(n_tail);`)
      }
    }
  };
  const classSet = new StubClassSet(config);
  await classSet.run();
}
