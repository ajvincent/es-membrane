// #region preamble

import fs from "fs/promises";
import path from "path";

import {
  SourceFile,
  Node,
  InterfaceDeclaration,
  type TypeAliasDeclaration,
  type MethodSignatureStructure,
  OptionalKind,
  ParameterDeclarationStructure,
  WriterFunction,
  type InterfaceDeclarationStructure,
} from "ts-morph";

import CodeBlockWriter, {
  type Options as CodeBlockWriterOptions
} from "code-block-writer";

import {
  DefaultMap,
} from "../../../../_01_stage_utilities/source/DefaultMap.mjs";

// #endregion preamble

type StructureWithMethods = Pick<InterfaceDeclarationStructure, "methods">;

export type ExtendsAndImplements = {
  readonly extends: ReadonlyArray<string>,
  readonly implements: ReadonlyArray<string>,
};

/**
 * A base class for quickly generating class stubs.
 */
export default class BaseStub
{
  // #region static fields
  static readonly #writerOptions: Partial<CodeBlockWriterOptions> = Object.freeze({
    indentNumberOfSpaces: 2
  });

  /**
   * Write a start token, invoke a block, and write the end token, in that order.
   * @param writer - the code block writer.
   * @param startToken - the start token.
   * @param endToken - the end token.
   * @param newLine - true if we should call `.newLine()` after the start and before the end.
   * @param indent - true if we should indent the block statements.
   * @param block - the callback to execute for the block statements.
   *
   * @see {@link https://github.com/dsherret/code-block-writer/issues/44}
   */
  static pairedWrite(
    this: void,
    writer: CodeBlockWriter,
    startToken: string,
    endToken: string,
    newLine: boolean,
    indent: boolean,
    block: () => void
  ) : void
  {
    writer.write(startToken);
    if (newLine)
      writer.newLine();
    if (indent)
      writer.indent(block);
    else
      block();
    if (newLine)
      writer.newLine();
    writer.write(endToken);
  }

  // #endregion static fields;

  // #region basic tools and configurations

  readonly #interfaceOrAlias: InterfaceDeclaration | TypeAliasDeclaration;

  /** The absolute path to the class file. */
  readonly #pathToClassFile: string;

  readonly #className: string;

  // imports to define in the module.
  /**
   * key: absolute file path
   * value: default import name
   */
  readonly #defaultImports = new Map<string, string>;

  /**
   * key: absolute file path
   * value: import names
   */
  readonly #blockImports = new DefaultMap<string, Set<string>>;

  /** This handles imports inside the module. */
  readonly #preambleWriter = new CodeBlockWriter(BaseStub.#writerOptions);

  /** This handles the actual class generation code. */
  protected readonly classWriter = new CodeBlockWriter(BaseStub.#writerOptions);

  protected readonly interfaceOrAliasName: string;

  // #endregion basic tools and configurations

  /** Get the "extends" and "implements" fields for the class. */
  protected getExtendsAndImplements() : ExtendsAndImplements
  {
    throw new Error("not implemented on BaseStub");
  }

  /**
   * @param sourceFile - the source file containing the interface or type alias.
   * @param interfaceOrAliasName - the name of the interface or type alias
   * @param pathToClassFile - the absolute path to the class file.
   * @param className - the class name to use.
   */
  constructor(
    sourceFile: SourceFile,
    interfaceOrAliasName: string,
    pathToClassFile: string,
    className: string,
  )
  {
    if (new.target === BaseStub)
      throw new Error("You must subclass BaseStub!");

    if (!path.isAbsolute(pathToClassFile))
      throw new Error("pathToClassFile must be absolute");

    const untypedInterfaceOrAlias = interfaceOrAliasName.replace(/<.*$/g, "");

    let interfaceOrAlias: (
      InterfaceDeclaration | TypeAliasDeclaration | undefined
    ) = sourceFile.getInterface(untypedInterfaceOrAlias);
    if (!interfaceOrAlias)
      interfaceOrAlias = sourceFile.getTypeAliasOrThrow(untypedInterfaceOrAlias);
    this.#interfaceOrAlias = interfaceOrAlias;

    this.#pathToClassFile = pathToClassFile;
    this.#className = className;

    this.interfaceOrAliasName = interfaceOrAliasName;
  }

  // #region import management

  /**
   * Add an import to the preamble.
   *
   * @param pathToModule - the absolute path to the module.
   * @param importString - the value to import, including `type` prefix if desirable.
   * @param isDefault - true if this is a default import.
   */
  addImport(
    pathToModule: string,
    importString: string,
    isDefault: boolean,
  ) : void
  {
    if (!path.isAbsolute(pathToModule))
      throw new Error("pathToModule must be absolute");

    if (this.#writeCalled)
      throw new Error(`File ${this.#pathToClassFile} has been written!`);

    if (isDefault) {
      const existingDefault = this.#defaultImports.get(pathToModule);
      if (existingDefault && existingDefault !== importString)
        throw new Error(`A default import, "${existingDefault}", already exists for ${pathToModule}!`);
      this.#defaultImports.set(pathToModule, importString);
    }
    else {
      const s = this.#blockImports.getDefault(pathToModule, () => new Set);
      s.add(importString);
    }
  }

  /** Write the preamble (module imports). */
  #writePreamble() : void
  {
    const locations = new Set<string>(this.#defaultImports.keys())
    for (const location of this.#blockImports.keys()) {
      locations.add(location);
    }

    this.#preambleWriter.writeLine(`/* This file is generated.  Do not edit. */`);
    BaseStub.pairedWrite(
      this.#preambleWriter,
      "// #region preamble",
      "// #endregion preamble",
      false,
      false,
      () => {
        this.#preambleWriter.blankLine();
        for (const location of locations.values()) {
          this.#writeImportBlock(location)
        }
        this.#preambleWriter.blankLine();
      }
    );
  }

  /**
   * Write one import statement to the preamble.
   * @param importLocation - a module's absolute path.
   */
  #writeImportBlock(importLocation: string) : void
  {
    const defaultImport = this.#defaultImports.get(importLocation) ?? "";
    const blockImports: string[] = Array.from(this.#blockImports.get(importLocation) || []);

    this.#defaultImports.delete(importLocation);
    this.#blockImports.delete(importLocation);

    this.#preambleWriter.write(`import ${defaultImport}`);
    this.#preambleWriter.conditionalWrite(
      Boolean(defaultImport && blockImports.length),
      ", "
    );
    if (blockImports.length) {
      this.#preambleWriter.inlineBlock(() => {
        blockImports.forEach(i => this.#preambleWriter.writeLine(i + ","))
      });
    }
    this.#preambleWriter.write(` from "${
      path.relative(path.dirname(this.#pathToClassFile), importLocation)
    }";`);
    this.#preambleWriter.newLine();
  }

  // #endregion import management

  // #region class building
  #buildCalled = false;

  /** Build the class into the class writer. (But don't write it to the file system.) */
  buildClass() : void
  {
    if (this.#buildCalled) {
      throw new Error(`Build has been called for file ${this.#pathToClassFile}`);
    }
    this.#buildCalled = true;

    this.classWriter.writeLine(`export default class ${this.#className}`);

    const {
      extends: _extends,
      implements: _implements
    } = this.getExtendsAndImplements();

    if (_extends.length)
      this.classWriter.writeLine("extends " + _extends.join(", "));
    if (_implements.length)
      this.classWriter.writeLine("implements " + _implements.join(", "));

    const methods = this.#getTypeMethods();

    this.classWriter.block(() => {
      this.methodTrap(null, true);

      methods.forEach((methodStructure, index) => {
        this.methodTrap(methodStructure, true);

        this.#buildMethod(methodStructure);
        if (index < methods.length - 1) {
          this.classWriter.newLine();
          this.classWriter.newLine();
        }

        this.methodTrap(methodStructure, false);
      })

      this.methodTrap(null, false);
    });
  }

  /** Get the methods of the type or interface. */
  #getTypeMethods(): ReadonlyArray<OptionalKind<MethodSignatureStructure>>
  {
    let structure: StructureWithMethods;

    if (this.#interfaceOrAlias instanceof InterfaceDeclaration) {
      const s = this.#interfaceOrAlias.getStructure();
      if (!("methods" in s))
        throw new Error("assertion failure: we should have methods");
      structure = s as StructureWithMethods;
    }
    else {
      const literal = this.#interfaceOrAlias.getTypeNodeOrThrow();
      if (!Node.hasStructure(literal))
        throw new Error("assertion failure: not type-element membered");
      const s = literal.getStructure() as StructureWithMethods;
      if (!Array.isArray(s.methods)) {
        throw new Error("assertion failure, expected type-element-membered");
      }
      structure = s;
    }

    if (!structure.methods) {
      throw new Error("no methods to write?");
    }
    return structure.methods;
  }

  /**
   * Allow subclasses of this to insert other class fields.
   * @param methodStructure - the structure for the method, or null if at the start or beginning of the class.
   * @param isBefore - true if this trap fires before the method definition, false for after.
   */
  protected methodTrap(
    methodStructure: OptionalKind<MethodSignatureStructure> | null,
    isBefore: boolean,
  ) : void
  {
    void(methodStructure);
    void(isBefore);
  }

  /**
   * Build one method.
   * @param methodStructure - the structure for the method.
   * @param isBefore - true if this trap fires before the method definition, false for after.
   */
  #buildMethod(
    method: OptionalKind<MethodSignatureStructure>
  ) : void
  {
    BaseStub.pairedWrite(this.classWriter, method.name + "(", ")", false, true, () => {
      if (method.parameters) {
        method.parameters.forEach(param => this.#writeParameter(param));
        this.classWriter.newLineIfLastNot();
      }
    });
    this.#writeType(method.returnType);
    this.classWriter.newLineIfLastNot();

    this.classWriter.block(() => this.buildMethodBody(method));
  }

  /** Build the markup for a single parameter. */
  #writeParameter(
    param: OptionalKind<ParameterDeclarationStructure>
  ): void
  {
    this.classWriter.write(param.name);
    this.#writeType(param.type);
    this.classWriter.write(",");
    this.classWriter.newLineIfLastNot();
  }

  /** Write a parameter or return type, if we have it. */
  #writeType(
    type: string | WriterFunction | undefined
  ) : void
  {
    if (!type)
      return;
    this.classWriter.write(": ");
    if (typeof type === "string")
      this.classWriter.write(type);
    else
      type(this.classWriter);
  }

  /**
   * Build the body of a class method.
   * @param structure - the method structure.
   */
  protected buildMethodBody(
    structure: OptionalKind<MethodSignatureStructure>
  ) : void
  {
    void(structure);
    throw new Error("not implemented on BaseStub");
  }

  // #endregion class building

  // #region writing to the file system

  #writeCalled = false;

  /** Write the class module to the file system! */
  async write() : Promise<void>
  {
    if (!this.#buildCalled)
      throw new Error(`File ${this.#pathToClassFile} has not been built!`);
    if (this.#writeCalled)
      throw new Error(`File ${this.#pathToClassFile} has been written!`);
    this.#writeCalled = true;

    this.#writePreamble();

    const contents = [
      this.#preambleWriter.toString(),
      this.classWriter.toString(),
    ].join("\n\n") + "\n";

    await fs.mkdir(path.dirname(this.#pathToClassFile), { recursive: true });
    await fs.writeFile(this.#pathToClassFile, contents, { "encoding": "utf-8"});
  }

  // #endregion writing to the file system
}
