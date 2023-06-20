import fs from "fs/promises";
import path from "path";

import StubClassSet from "#aspects/stubs/source/StubClassSet.mjs";
import type {
  StubClassSetConfiguration
} from "#aspects/stubs/source/types/StubClassSetConfiguration.mjs";

import {
  sourceFile,
  generatedDir,
  pathToTypeFile,
} from "./constants.mjs";

export default
async function buildAspectsStubs() : Promise<void>
{
  let found = false;
  const destinationDir = path.join(generatedDir, "stubs");

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
    isTypeFilePackage: true,

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

    transitionsTail: {
      paramRenamer: (name: string) => name + "_tail",
      classArgumentTypes: "[]",
    },
    /*

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
    },
    */
  };
  const classSet = new StubClassSet(config);
  await classSet.run();
}
