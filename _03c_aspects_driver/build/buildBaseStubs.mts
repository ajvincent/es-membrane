import fs from "fs/promises";

import {
  pathToModule,
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import ConfigureStub from "#stub_classes/source/base/ConfigureStub.mjs";

import StubClassSet, {
  type StubClassSetConfiguration
} from "#stub_classes/source/StubClassSet.mjs";

import {
  sourceFile,
  fixturesDir,
  pathToTypeFile,
} from "./constants.mjs";

const destinationDir = pathToModule(fixturesDir, "stubs");

export default
async function buildBaseStubs() : Promise<void>
{
  let found = false;

  try {
    await fs.access(destinationDir);
    found = true;
  }
  catch {
    // do nothing
  }
  if (found)
    await fs.rm(destinationDir, { recursive: true });

  const config: StubClassSetConfiguration = {
    sourceFile,
    interfaceOrAliasName: "NumberStringType",
    destinationDir,
    className: "NumberStringClass",
    pathToTypeFile,

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
