import type {
  OptionalKind,
  MethodSignatureStructure,
} from "ts-morph";

import BaseStub from "./base.mjs";

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
    if (!isBefore || !methodStructure)
      return;
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
