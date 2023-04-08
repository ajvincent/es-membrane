import BaseStub, {
  type ExtendsAndImplements
} from "./baseStub.mjs";

import addPublicTypeImport from "./addPublicTypeImport.mjs";

import type {
  TS_Method
} from "./private-types.mjs";

export default
class PrependReturnStub extends BaseStub
{
  protected getExtendsAndImplements(): ExtendsAndImplements
  {
    return {
      extends: [],
      implements: [
        `MethodsPrependReturn<${this.interfaceOrAliasName}>`
      ],
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
      addPublicTypeImport(
        this, "MethodsPrependReturn.mjs", "MethodsPrependReturn"
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
    methodStructure: TS_Method
  ): void
  {
    methodStructure.parameters?.forEach(
      param => this.classWriter.writeLine(`void(${param.name});`)
    );
  }
}
