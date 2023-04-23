// #region preamble

import type {
  RightExtendsLeft
} from "../../../../../_01_stage_utilities/source/types/Utility.mjs";

import type {
  StaticAndInstance
} from "../../../../../_01_stage_utilities/source/types/StaticAndInstance.mjs";

import {
  type ModuleSourceDirectory,
  pathToModule
} from "../../../../../_01_stage_utilities/source/AsyncSpecModules.mjs";

import type {
  ConfigureStubDecorator
} from "../types/ConfigureStubDecorator.mjs";

import type {
  TS_Method
} from "../types/private-types.mjs";

import addPublicTypeImport from "../utilities/addPublicTypeImport.mjs";
import { OptionalKind, ParameterDeclarationStructure } from "ts-morph";

// #endregion preamble

const projectDir: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../../../../../.."
};
const SpyBasePath = pathToModule(
  projectDir, "_01_stage_utilities/source/SpyBase.mjs"
);

export type SpyClassFields = RightExtendsLeft<StaticAndInstance, {
  staticFields: object,
  instanceFields: object,
}>;

const SpyClassDecorator: ConfigureStubDecorator<SpyClassFields> = function(
  this: void,
  baseClass
)
{
  return class extends baseClass {
    protected methodTrap(
      methodStructure: TS_Method | null,
      isBefore: boolean,
    ) : void
    {
      super.methodTrap(methodStructure, isBefore);

      if (!isBefore)
        return;

      if (!methodStructure) {
        this.addImport(SpyBasePath, "SpyBase", true);

        addPublicTypeImport(this, "VoidMethodsOnly.mjs", "VoidMethodsOnly");

        this.classWriter.writeLine(
          `readonly #spyClass = new SpyBase;`
        );
        this.classWriter.newLine();
        return;
      }
    }

    protected buildMethodBody(
      structure: TS_Method,
      remainingArgs: Set<OptionalKind<ParameterDeclarationStructure>>,
    ): void
    {
      const paramsStr = structure.parameters?.map(
        param  => param.name
      ).join(", ") ?? "";

      this.classWriter.writeLine(
        `this.#spyClass.getSpy("${structure.name}")(${paramsStr});`
      );
      remainingArgs.clear();

      super.buildMethodBody(structure, remainingArgs);
    }
  }
}

export default SpyClassDecorator;
