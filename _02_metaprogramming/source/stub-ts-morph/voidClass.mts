import type {
  OptionalKind,
  MethodSignatureStructure,
} from "ts-morph";

import BaseStub from "./base.mjs";
import addPublicTypeImport from "./addPublicTypeImport.mjs";

export default
class VoidClassStub extends BaseStub
{
  protected getExtendsAndImplements(): string
  {
    return `implements VoidMethodsOnly<${this.interfaceOrAliasName}>`;
  }

  protected methodTrap(
    methodStructure: OptionalKind<MethodSignatureStructure> | null,
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
    structure: OptionalKind<MethodSignatureStructure>
  ): void
  {
    structure.parameters?.forEach(
      param => this.classWriter.writeLine(`void(${param.name});`)
    );
  }
}