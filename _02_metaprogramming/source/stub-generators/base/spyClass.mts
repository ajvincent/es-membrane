import {
  type ModuleSourceDirectory,
  pathToModule
} from "../../../../_01_stage_utilities/source/AsyncSpecModules.mjs";

import addPublicTypeImport from "./addPublicTypeImport.mjs";

import BaseStub, {
  type ExtendsAndImplements
} from "./baseStub.mjs";

import type {
  TS_Method
} from "./private-types.mjs";

const projectDir: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../../../../.."
};
const SpyBasePath = pathToModule(
  projectDir, "_01_stage_utilities/source/SpyBase.mjs"
);

export default
class SpyClassStub extends BaseStub
{
  protected getExtendsAndImplements(): ExtendsAndImplements
  {
    return {
      extends: [],
      implements: [`VoidMethodsOnly<${this.interfaceOrAliasName}>`],
    };
  }

  protected methodTrap(
    methodStructure: TS_Method | null,
    isBefore: boolean,
  ) : void
  {
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

    methodStructure.returnType = "void";
  }

  protected buildMethodBody(
    structure: TS_Method
  ): void
  {
    const paramsStr = structure.parameters?.map(
      param  => param.name
    ).join(", ") ?? "";
    this.classWriter.writeLine(
      `this.#spyClass.getSpy("${structure.name}")(${paramsStr});`
    );
  }
}
