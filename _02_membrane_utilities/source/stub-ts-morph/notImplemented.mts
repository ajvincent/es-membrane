import type {
  SourceFile,
  OptionalKind,
  MethodSignatureStructure,
} from "ts-morph";

import BaseStub from "./base.mjs";

export default
class NotImplementedStub extends BaseStub
{
  /**
   * @param sourceFile - the source file containing the interface or type alias.
   * @param interfaceOrAliasName - the name of the interface or type alias
   * @param pathToClassFile - the absolute path to the class file.
   * @param className - the class name to use.
   * @param notImplementedOnly - true if I will insert `NotImplementedOnly<>` around the interface or alias.
   */
  constructor(
    sourceFile: SourceFile,
    interfaceOrAliasName: string,
    pathToClassFile: string,
    className: string,
    notImplementedOnly: boolean
  )
  {
    super(sourceFile, interfaceOrAliasName, pathToClassFile, className);
    this.#notImplementedOnly = notImplementedOnly;
  }

  #notImplementedOnly: boolean;

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
    if (!this.#notImplementedOnly || !isBefore || !methodStructure)
      return;
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
