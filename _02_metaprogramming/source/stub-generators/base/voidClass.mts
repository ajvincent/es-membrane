import BaseStub, {
  type ExtendsAndImplements
} from "./baseStub.mjs";

import addPublicTypeImport from "./addPublicTypeImport.mjs";

import type {
  TS_Method
} from "./private-types.mjs";

export default
class VoidClassStub extends BaseStub
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
      addPublicTypeImport(this, "VoidMethodsOnly.mjs", "VoidMethodsOnly");
      return;
    }

    methodStructure.returnType = "void";
  }

  protected buildMethodBody(
    methodStructure: TS_Method
  ): void
  {
    methodStructure.parameters?.forEach(
      param => this.classWriter.writeLine(`void(${param.name});`)
    );
  }
}
