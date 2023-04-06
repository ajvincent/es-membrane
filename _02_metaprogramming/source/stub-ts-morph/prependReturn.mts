import type {
  OptionalKind,
  MethodSignatureStructure,
} from "ts-morph";

import {
  type ModuleSourceDirectory,
  pathToModule
} from "../../../_01_stage_utilities/source/AsyncSpecModules.mjs";

const publicTypesDir: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../../aspects/public-types"
};

import BaseStub from "./base.mjs";

export default
class PrependReturnStub extends BaseStub
{
  protected getExtendsAndImplements(): string
  {
    return `implements MethodsPrependReturn<${this.interfaceOrAliasName}>`;
  }

  protected methodTrap(
    methodStructure: OptionalKind<MethodSignatureStructure> | null,
    isBefore: boolean,
  ) : void
  {
    if (!isBefore)
      return;

    if (!methodStructure) {
      this.addImport(
        pathToModule(publicTypesDir, "MethodsPrependReturn.mjs"),
        "type MethodsPrependReturn",
        false
      );
      return;
    }

    methodStructure.parameters ||= [];
    methodStructure.parameters.unshift({
      name: "__rv__",
      type: methodStructure.returnType,
    })
    methodStructure.returnType = "void";
  }

  protected buildMethodBody(
    structure: OptionalKind<MethodSignatureStructure>
  ): void
  {
    structure.parameters?.forEach(
      param => this.classWriter.writeLine(`void(${param.name});`)
    );
  }
}
