import type {
  OptionalKind,
  MethodSignatureStructure,
} from "ts-morph";

import BaseStub, {
  type ExtendsAndImplements
} from "./base.mjs";
import addPublicTypeImport from "./addPublicTypeImport.mjs";

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
    methodStructure: OptionalKind<MethodSignatureStructure> | null,
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
    structure: OptionalKind<MethodSignatureStructure>
  ): void
  {
    structure.parameters?.forEach(
      param => this.classWriter.writeLine(`void(${param.name});`)
    );
  }
}
