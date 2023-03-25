// #region preamble

import fs from "fs/promises";
import path from "path";

import type {
  ReadonlyDeep,
} from "type-fest";

import CodeBlockWriter, {
  type Options as CodeBlockWriterOptions
} from "code-block-writer";

import {
  DefaultMap,
} from "../../../_01_stage_utilities/source/DefaultMap.mjs";

// #endregion preamble

// #region method dictionary types

export type ArgParameter = {
  key: string;
  type: string;
};

export type MethodStructure = {
  args: ReadonlyArray<ArgParameter>;
  returnType: string;
};

export type MethodDictionary = {
  [key: string]: MethodStructure;
};

// #endregion method dictionary type

/**
 * A base class for quickly generating class stubs.
 */
export default
abstract class BaseStub
{
  // #region static fields
  static readonly #writerOptions: Partial<CodeBlockWriterOptions> = Object.freeze({
    indentNumberOfSpaces: 2
  });

  /**
   * Clone an existing method dictionary, and use a callback to modify the clone.
   * @param source - the source method dictionary.
   * @param callback - the user's trap for modifying signatures.
   * @returns the new method dictionary.
   */
  static cloneDictionary(
    source: MethodDictionary,
    callback: (fieldName: string, signature: MethodStructure) => void,
  ) : MethodDictionary
  {
    const entries = Object.entries(source).map(([fieldName, signature]) => {
      signature = JSON.parse(JSON.stringify(signature)) as MethodStructure;
      callback(fieldName, signature);
      return [fieldName, signature];
    });

    return Object.fromEntries(entries) as MethodDictionary;
  }

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

  // #endregion static fields

  // #region basic tools and configurations
  /** The absolute path to the class file. */
  readonly #pathToFile: string;

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

  readonly #className: string;
  readonly #extendsAndImplements: string;
  readonly #methods: ReadonlyDeep<MethodDictionary>;
  readonly #interrupts: ReadonlySet<string>;

  /** This handles imports inside the module. */
  readonly #preambleWriter = new CodeBlockWriter(BaseStub.#writerOptions);

  /** This handles the actual class generation code. */
  protected readonly classWriter = new CodeBlockWriter(BaseStub.#writerOptions);
  // #endregion basic tools and configurations

  /**
   * @param pathToFile - the absolute path to the class file.
   * @param className - the class name to use.
   * @param extendsAndImplements - the "extends" and "implements" clauses.
   * @param methods - the dictionary of method structures.
   * @param interrupts - method names to call this.methodTrap() for.  Includes the special "(all)" name.
   */
  constructor(
    pathToFile: string,
    className: string,
    extendsAndImplements: string,
    methods: ReadonlyDeep<MethodDictionary>,
    interrupts: ReadonlyArray<string> = [],
  )
  {
    if (!path.isAbsolute(pathToFile))
      throw new Error("pathToFile must be absolute");
    this.#pathToFile = pathToFile;
    this.#className = className;
    this.#extendsAndImplements = extendsAndImplements;
    this.#methods = methods;
    this.#interrupts = new Set(interrupts);
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
      throw new Error(`File ${this.#pathToFile} has been written!`);

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
    this.#blockImports.forEach((value, location) => locations.add(location));

    this.#preambleWriter.writeLine(`/* This file is generated.  Do not edit. */`);
    BaseStub.pairedWrite(
      this.#preambleWriter,
      "// #region preamble",
      "// #endregion preamble",
      false,
      false,
      () => {
        this.#preambleWriter.blankLine();
        Array.from(locations).forEach(
          location => this.#writeImportBlock(location)
        );
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
      path.relative(path.dirname(this.#pathToFile), importLocation)
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
      throw new Error(`Build has been called for file ${this.#pathToFile}`);
    }
    this.#buildCalled = true;

    this.classWriter.writeLine(`export default class ${this.#className}`);
    this.classWriter.writeLine(this.#extendsAndImplements);

    const methods = Object.entries(this.#methods);
    this.classWriter.block(() => {
      this.#maybeInterrupt("(all)", true);

      methods.forEach(([methodName, signature], index, methodsArray) => {
        this.#maybeInterrupt(methodName, true);

        this.#buildMethod(methodName, signature);
        if (index < methodsArray.length - 1) {
          this.classWriter.newLine();
          this.classWriter.newLine();
        }

        this.#maybeInterrupt(methodName, false);
      });

      this.#maybeInterrupt("(all)", false);
    });
  }

  /**
   * If we hit a defined interrupt, call this.methodTrap().
   * @param methodName - the method name, or "(all)" for all methods.
   * @param isBefore - true if this trap fires before the method definition, false for after.
   */
  #maybeInterrupt(
    methodName: string,
    isBefore: boolean,
  ) : void
  {
    if (this.#interrupts.has(methodName))
      this.methodTrap(methodName, isBefore);
  }

  /**
   * Allow subclasses of this to insert other class fields.
   * @param methodName - the method name, or "(all)" for all methods.
   * @param isBefore - true if this trap fires before the method definition, false for after.
   */
  protected methodTrap(
    methodName: string,
    isBefore: boolean,
  ) : void
  {
    void(methodName);
    void(isBefore);
  }

  /**
   * Build one method.
   * @param methodName - the name of the method.
   * @param structure - the method structure.
   */
  #buildMethod(
    methodName: string,
    structure: MethodStructure,
  ) : void
  {
    // method(arg0: number, arg1: string) : void
    this.classWriter.writeLine(methodName + "(");
    this.classWriter.indent(() => {
      structure.args.forEach(arg => {
        this.classWriter.writeLine(`${arg.key}: ${arg.type},`);
      })
    });
    this.classWriter.writeLine("): " + structure.returnType);

    // call the subclass to write the body.
    this.classWriter.block(() => this.buildMethodBody(methodName, structure));
  }

  /**
   * Build the body of a class method.
   * @param methodName - the name of the method.
   * @param structure - the method structure.
   */
  protected abstract buildMethodBody(
    methodName: string,
    structure: MethodStructure
  ) : void;

  // #endregion class building

  // #region writing to the file system

  #writeCalled = false;

  /** Write the class module to the file system! */
  async write() : Promise<void>
  {
    if (!this.#buildCalled)
      throw new Error(`File ${this.#pathToFile} has not been built!`);
    if (this.#writeCalled)
      throw new Error(`File ${this.#pathToFile} has been written!`);
    this.#writeCalled = true;

    this.#writePreamble();

    const contents = [
      this.#preambleWriter.toString(),
      this.classWriter.toString(),
    ].join("\n\n") + "\n";

    await fs.writeFile(this.#pathToFile, contents, { "encoding": "utf-8"});
  }

  // #endregion writing to the file system
}
