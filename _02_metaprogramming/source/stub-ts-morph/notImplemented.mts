import type {
  OptionalKind,
  MethodSignatureStructure,
} from "ts-morph";

import BaseStub from "./base.mjs";
import addPublicTypeImport from "./addPublicTypeImport.mjs";

export default
class NotImplementedStub extends BaseStub
{
  #notImplementedOnly = false;
  #notImplementedSet = false;

  setNotImplementedOnly(useNever: boolean) : void
  {
    if (this.#notImplementedSet)
      throw new Error("You've called setNotImplementedOnly already");
    this.#notImplementedSet = true;
    this.#notImplementedOnly = useNever;
  }

  buildClass() : void
  {
    if (!this.#notImplementedSet)
      throw new Error("Call this.setNotImplementedOnly()");
    super.buildClass();
  }

  protected getExtendsAndImplements(): string
  {
    return `implements ${
      this.#notImplementedOnly ? "NotImplementedOnly<" : ""
    }${
      this.interfaceOrAliasName
    }${
      this.#notImplementedOnly ? ">" : ""
    }`;
  }

  protected methodTrap(
    methodStructure: OptionalKind<MethodSignatureStructure> | null,
    isBefore: boolean,
  ) : void
  {
    if (!this.#notImplementedOnly || !isBefore)
      return;

    if (!methodStructure) {
      addPublicTypeImport(
        this, "NotImplementedOnly.mjs", "NotImplementedOnly"
      );
      return;
    }

    methodStructure.returnType = "never";
  }

  protected buildMethodBody(
    structure: OptionalKind<MethodSignatureStructure>
  ): void
  {
    if (structure.parameters) {
      structure.parameters.forEach(
        param => this.classWriter.writeLine(`void(${param.name});`)
      );
    }

    this.classWriter.writeLine(`throw new Error("not yet implemented");`);
  }
}
