// #region preamble

import fs from "fs/promises";
import path from "path";

import {
  SourceFile,
  Node,
  InterfaceDeclaration,
  TypeAliasDeclaration,
  type InterfaceDeclarationStructure,
} from "ts-morph";

import CodeBlockWriter from "code-block-writer";

import {
  DefaultMap,
} from "#stage_utilities/source/DefaultMap.mjs";

import getRequiredInitializers from "#stage_utilities/source/RequiredInitializers.mjs";

import MixinBase from "#mixin_decorators/source/MixinBase.mjs";

import extractType, {
  writerOptions
} from "./utilities/extractType.mjs";

import type {
  TS_Method,
  TS_Parameter,
  TS_TypeParameter,
} from "./types/ts-morph-native.mjs";

import serializeParameter from "./utilities/serializeParameter.mjs";

// #endregion preamble

type StructureWithMethods = Pick<InterfaceDeclarationStructure, "methods">;

export type ExtendsAndImplements = {
  readonly extends: string,
  readonly implements: ReadonlyArray<string>,
};

/**
 * A base class for quickly generating class stubs.
 */
export default class AspectsStubBase extends MixinBase
{
  // #region static fields
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
  protected static pairedWrite(
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

  static readonly #INIT_KEY = "(configure stub base)";

  // #endregion static fields;

  // #region common fields

  /** The original alias for all operations.  Settable exactly once, in this.configureStub(). */
  #interfaceOrAlias: InterfaceDeclaration | TypeAliasDeclaration | null = null;

  /** The absolute path to the class file. */
  #pathToClassFile = "(not yet defined)";

  /** The name of the destination class. */
  #className = "(not yet defined)";

  // imports to define in the module.
  /**
   * key: absolute file path or package path
   * value: default import name
   */
  readonly #defaultImports = new Map<string, string>;

  /**
   * key: absolute file path or package path
   * value: import names
   */
  readonly #blockImports = new DefaultMap<string, Set<string>>;

  /** Package paths for #defaultInports and #blockImports */
  readonly #packagePaths = new Set<string>;

  /** This handles imports inside the module. */
  readonly #preambleWriter = new CodeBlockWriter(writerOptions);

  /**
   * Metadata for enclosing the generated class in a function, where the user can pass in configuration parameters such as the base class.
   */
  #wrapInFunctionParameters?: {
    typeParameters: ReadonlyArray<TS_TypeParameter>,
    parameters: ReadonlyArray<TS_Parameter>,
    functionName: string,
    beforeClassTrap: (classWriter: CodeBlockWriter) => void,
  } = undefined;

  /** This handles the actual class generation code. */
  protected readonly classWriter = new CodeBlockWriter(writerOptions);

  /** The interface name or type alias name we are deriving from.  Settable only via configureStub(). */
  protected interfaceOrAliasName = "(not yet defined)";

  // #endregion common fields

  // #region basic class information

  /** Initialize the class.  The super() call may be unnecessary - try to remove MixinBase? */
  constructor(...args: unknown[]) {
    super(...args);
    getRequiredInitializers(this).add(AspectsStubBase.#INIT_KEY);
  }

  /**
   * Common configuration settings for all aspect stubs.
   *
   * @param sourceFile - the source file containing the interface or type alias.
   * @param interfaceOrAliasName - the name of the interface or type alias
   * @param pathToClassFile - the absolute path to the class file.
   * @param className - the class name to use.
   */
  configureStub(
    sourceFile: SourceFile,
    interfaceOrAliasName: string,
    pathToClassFile: string,
    className: string,
  ) : void
  {
    getRequiredInitializers(this).mayResolve(AspectsStubBase.#INIT_KEY);

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

    getRequiredInitializers(this).resolve(AspectsStubBase.#INIT_KEY);
  }

  /** Get the class name the user defines in this.configureStub(). */
  protected getClassName(): string {
    if (getRequiredInitializers(this).has(AspectsStubBase.#INIT_KEY)) {
      throw new Error("Invoke this.configureStub() first!");
    }

    return this.#className;
  }

  /** Get the path to the target class file the user defines in this.configureStub(). */
  protected getPathToClassFile(): string {
    if (getRequiredInitializers(this).has(AspectsStubBase.#INIT_KEY)) {
      throw new Error("Invoke this.configureStub() first!");
    }

    return this.#pathToClassFile;
  }

  // #endregion basic class information

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
    isPackageImport: boolean
  ) : void
  {
    //getRequiredInitializers(this).check();

    if (!isPackageImport && !path.isAbsolute(pathToModule))
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

    if (isPackageImport)
      this.#packagePaths.add(pathToModule);
  }

  /**
   * Wrap the generated class in a function, for passing in parameters such as the base class the class extends.
   * @param typeParameters - the type parameters for the function.
   * @param parameters - the parameters for the function.
   * @param functionName - the name of the function.
   * @param beforeClassTrap - a callback to execute before I write any of the class code.
   */
  wrapInFunction(
    typeParameters: ReadonlyArray<TS_TypeParameter>,
    parameters: ReadonlyArray<TS_Parameter>,
    functionName: string,
    beforeClassTrap: (classWriter: CodeBlockWriter) => void,
  ) : void
  {
    if (this.#buildCalled) {
      throw new Error(`Build has been called for file ${this.#pathToClassFile}`);
    }

    if (this.#wrapInFunctionParameters) {
      throw new Error("You have already called wrapInFunction()!");
    }

    this.#wrapInFunctionParameters = {
      typeParameters,
      parameters,
      functionName,
      beforeClassTrap,
    };
  }

  /** Write the preamble (module imports). */
  #writePreamble() : void
  {
    const locations = new Set<string>(this.#defaultImports.keys())
    for (const location of this.#blockImports.keys()) {
      locations.add(location);
    }

    this.#preambleWriter.writeLine(`/* This file is generated.  Do not edit. */`);
    AspectsStubBase.pairedWrite(
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

    if (!this.#packagePaths.has(importLocation)) {
      const startDir = path.dirname(this.#pathToClassFile);
      const pathToImport = path.relative(startDir, importLocation);
      if (importLocation.startsWith(startDir)) {
        importLocation = "./" + pathToImport;
      }
      else {
        importLocation = pathToImport;
      }
    }

    this.#preambleWriter.write(` from "${importLocation}";`);
    this.#preambleWriter.newLine();
  }

  // #endregion import management

  // #region class building
  #buildCalled = false;

  /** Build the class into the class writer. (But don't write it to the file system.) */
  buildClass() : void
  {
    getRequiredInitializers(this).check();

    if (this.#buildCalled) {
      throw new Error(`Build has been called for file ${this.#pathToClassFile}`);
    }
    this.#buildCalled = true;

    this.classWriter.write("export default ");

    if (this.#wrapInFunctionParameters) {
      this.#writeWrapperFunction();
    }
    else {
      this.#buildClassDefinition();
    }
  }

  /** Wrap the generated class in a generated function. */
  #writeWrapperFunction(): void {
    if (!this.#wrapInFunctionParameters) {
      throw new Error("unreachable, assertion failure");
    }

    this.addImport(
      "#mixin_decorators/source/types/Class.mjs",
      "type Class",
      false,
      true
    );

    this.classWriter.write(`function ${this.#wrapInFunctionParameters.functionName}`);
    this.classWriter.newLine();

    if (this.#wrapInFunctionParameters.typeParameters.length) {
      AspectsStubBase.pairedWrite(
        this.classWriter, "<", ">", true, true, () => this.#writeWrapFunctionTypeParameters()
      );
      this.classWriter.newLine();
    }

    AspectsStubBase.pairedWrite(
      this.classWriter, "(", ")", true, true, () => this.#writeWrapFunctionParameters()
    );

    AspectsStubBase.pairedWrite(
      this.classWriter, ": Class<", ">", true, true, () => {
        const { implements: _implements } = this.getExtendsAndImplementsTrap(new Map);
        this.classWriter.write(_implements.join(" & "));
      }
    );
    this.classWriter.newLine();

    this.classWriter.block(() => {
      if (!this.#wrapInFunctionParameters) {
        throw new Error("unreachable, assertion failure");
      }
      this.#wrapInFunctionParameters.beforeClassTrap(this.classWriter);
      this.classWriter.write("return ");
      this.#buildClassDefinition();
    });
  }

  #writeWrapFunctionTypeParameters(): void {
    if (this.#wrapInFunctionParameters) {
      this.#wrapInFunctionParameters.typeParameters.forEach(
        (typeParameter, index, array) => this.#writeTypeParameter(typeParameter, index === array.length - 1)
      )
    }
  }

  #writeTypeParameter(typeParameter: TS_TypeParameter, isLast: boolean): void {
    let serialized: string = typeParameter.name;
    if (typeParameter.constraint) {
      serialized += " extends " + (extractType(typeParameter.constraint, true) as string);
    }
    if (!isLast)
      serialized += ", ";
    this.classWriter.write(serialized);
  }

  #writeWrapFunctionParameters(): void {
    if (this.#wrapInFunctionParameters) {
      this.classWriter.write(
        this.#wrapInFunctionParameters.parameters.map(serializeParameter).join(", ")
      );
    }
  }

  /** Actually generate the class via callbacks to the class writer. */
  #buildClassDefinition(): void
  {
    this.classWriter.write(`class ${this.#className}`);
    this.classWriter.newLine();

    const context = new Map<symbol, unknown>;
    const {
      extends: _extends,
      implements: _implements
    } = this.getExtendsAndImplementsTrap(context);

    if (_extends.length)
      this.classWriter.writeLine("extends " + _extends);
    if (_implements.length)
      this.classWriter.writeLine("implements " + _implements.join(", "));

    // The final list of methods.
    const methods: ReadonlyArray<TS_Method> = this.#getTypeMethods();

    // write each method, with method traps before all methods, before and after each method, and after all methods.
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

  /**
   * Get the "extends" and "implements" fields for the class.
   *
   * @param context - for subclass decorators invoked more than once, which wish to consolidate operations.
   */
  protected getExtendsAndImplementsTrap(context: Map<symbol, unknown>) : ExtendsAndImplements
  {
    void(context);
    return {
      extends: "",
      implements: [ this.interfaceOrAliasName ],
    };
  }

  /** Get the methods of the type or interface to implement, including from the user for additional methods. */
  #getTypeMethods(): ReadonlyArray<TS_Method>
  {
    let structure: StructureWithMethods;

    if (this.#interfaceOrAlias instanceof InterfaceDeclaration) {
      const s = this.#interfaceOrAlias.getStructure();
      if (!("methods" in s))
        throw new Error("assertion failure: we should have methods");
      structure = s;
    }
    else if (this.#interfaceOrAlias instanceof TypeAliasDeclaration) {
      const literal = this.#interfaceOrAlias.getTypeNodeOrThrow();
      if (!Node.hasStructure(literal))
        throw new Error("assertion failure: not type-element membered");
      const s = literal.getStructure() as StructureWithMethods;
      if (!Array.isArray(s.methods)) {
        throw new Error("assertion failure, expected type-element-membered");
      }
      structure = s;
    }
    else {
      throw new Error("unreachable");
    }

    if (!structure.methods) {
      throw new Error("no methods to write?");
    }

    // Ask the user what other methods they want, and maybe to provide a new ordering.
    const methodList = this.insertAdditionalMethodsTrap(structure.methods.slice());
    const methodSet = new Set(methodList);
    structure.methods.forEach(method => {
      if (!methodSet.has(method))
        throw new Error("You can't remove any methods in getAdditionalMethods!  Missing " + method.name);
    });

    return methodList;
  }

  /**
   * Get a list of method signatures, including every existing one, to create.  Useful for private methods.
   * @param existingMethods - the methods I retrieved from the interface or type alias.
   * @returns the new method ordering.
   */
  protected insertAdditionalMethodsTrap(
    existingMethods: ReadonlyArray<TS_Method>
  ): ReadonlyArray<TS_Method>
  {
    return existingMethods;
  }

  /**
   * Allow subclasses of this to insert other class fields.
   * @param methodStructure - the structure for the method, or null if at the start or beginning of the class.
   * @param isBefore - true if this trap fires before the method definition, false for after.
   */
  protected methodTrap(
    methodStructure: TS_Method | null,
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
    method: TS_Method
  ) : void
  {
    AspectsStubBase.pairedWrite(this.classWriter, method.name + "(", ")", false, true, () => {
      if (method.parameters) {
        method.parameters.forEach(param => this.#writeParameter(param));
        this.classWriter.newLineIfLastNot();
      }
    });

    if (method.returnType) {
      this.classWriter.write(": ");
      extractType(method.returnType, false, this.classWriter);
    }
    this.classWriter.newLineIfLastNot();

    const remainingArgs = new Set(method.parameters || []);
    this.classWriter.block(() => this.buildMethodBodyTrap(method, remainingArgs));
  }

  /** Build the markup for a single parameter. */
  #writeParameter(
    param: TS_Parameter
  ): void
  {
    this.classWriter.write(param.name);
    if (param.type) {
      this.classWriter.write(": ");
      extractType(param.type, false, this.classWriter);
    }
    this.classWriter.write(",");
    this.classWriter.newLineIfLastNot();
  }

  /**
   * Build the body of a class method.
   * @param structure - the method structure.
   * @param remainingArgs - arguments we haven't used yet.
   */
  protected buildMethodBodyTrap(
    structure: TS_Method,
    remainingArgs: Set<TS_Parameter>,
  ) : void
  {
    void(structure);
    void(remainingArgs);
  }

  /**
   * Write `void(argName);` lines for each remaining argument.
   * @param remainingArgs - arguments we haven't used yet.
   */
  protected voidArguments(
    remainingArgs: Set<TS_Parameter>
  ) : void
  {
    remainingArgs.forEach(
      param => this.classWriter.writeLine(`void(${param.name});`)
    );
    remainingArgs.clear();
  }

  // #endregion class building

  // #region writing to the file system

  #writeCalled = false;

  /** Write the class module to the file system! */
  async write() : Promise<void>
  {
    getRequiredInitializers(this).check();

    if (!this.#buildCalled)
      throw new Error(`File ${this.#pathToClassFile} has not been built!`);
    if (this.#writeCalled)
      throw new Error(`File ${this.#pathToClassFile} has been written!`);
    this.#writeCalled = true;

    this.#writePreamble();

    const contents = [
      this.#preambleWriter.toString(),
      this.writeBeforeExportTrap().trim(),
      this.classWriter.toString(),
      this.writeAfterExportTrap().trim(),
    ].filter(Boolean).join("\n\n") + "\n";

    await fs.mkdir(path.dirname(this.#pathToClassFile), { recursive: true });
    await fs.writeFile(this.#pathToClassFile, contents, { "encoding": "utf-8"});
  }

  protected writeBeforeExportTrap() : string
  {
    return "";
  }

  protected writeAfterExportTrap() : string
  {
    return "";
  }

  // #endregion writing to the file system
}
