// #region preamble
import path from "path";
import { OptionalKind, ParameterDeclarationStructure } from "ts-morph";

import type {
  RightExtendsLeft
} from "#stage_utilities/source/types/Utility.mjs";

import type {
  StaticAndInstance
} from "#stage_utilities/source/types/StaticAndInstance.mjs";

import {
  type ModuleSourceDirectory,
  pathToModule
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import type {
  ConfigureStubDecorator
} from "../types/ConfigureStubDecorator.mjs";

import type {
  TS_Method
} from "../types/private-types.mjs";

import { ExtendsAndImplements } from "../ConfigureStub.mjs";

// #endregion preamble

const projectDir: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../../../../.."
};
const SpyBasePath = pathToModule(
  projectDir, "_01_stage_utilities/source/SpyBase.mjs"
);

export type SpyClassFields = RightExtendsLeft<StaticAndInstance, {
  staticFields: object,
  instanceFields: object,
}>;

const SpyClassDecorator: ConfigureStubDecorator<SpyClassFields, false> = function(
  this: void,
  baseClass
)
{
  return class extends baseClass {
    protected getExtendsAndImplementsTrap(context: Map<symbol, unknown>): ExtendsAndImplements {
      return {
        extends: this.getClassName() + "_WrapThisInner",
        implements: super.getExtendsAndImplementsTrap(context).implements,
      }
    }

    protected methodTrap(
      methodStructure: TS_Method | null,
      isBefore: boolean,
    ) : void
    {
      super.methodTrap(methodStructure, isBefore);

      if (!isBefore)
        return;

      if (!methodStructure) {
        this.addImport("#stub_classes/source/symbol-keys.mjs", "SPY_BASE", false);
        this.addImport(SpyBasePath, "SpyBase", true);
        const pathToClassFile = this.getPathToClassFile();
        const pathToWrapThisClass = path.normalize(path.join(pathToClassFile, "../WrapThisInner.mjs"));

        this.addImport(pathToWrapThisClass, this.getClassName() + "_WrapThisInner", true);

        this.classWriter.writeLine(
          `readonly [SPY_BASE] = new SpyBase;`
        );
        this.classWriter.newLine();
        return;
      }
    }

    protected buildMethodBodyTrap(
      structure: TS_Method,
      remainingArgs: Set<OptionalKind<ParameterDeclarationStructure>>,
    ): void
    {
      const paramsStr = structure.parameters?.map(
        param  => param.name
      ).join(", ") ?? "";

      this.classWriter.writeLine(
        `this[SPY_BASE].getSpy("${structure.name}")(${paramsStr});`
      );
      remainingArgs.clear();

      super.buildMethodBodyTrap(structure, remainingArgs);
    }
  }
}

export default SpyClassDecorator;
