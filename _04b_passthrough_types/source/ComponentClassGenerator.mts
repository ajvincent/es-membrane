import ts from "ts-morph";
import {
  SingletonPromise,
  PromiseAllParallel,
} from "../../_01_stage_utilities/source/PromiseTypes.mjs";

import TypeToClass from "../../_04a_ts-morph_utilities/source/TypeToClass.mjs";

import type { KeysAsProperties } from "./ProjectJSON.mjs";

import path from "path";
import url from "url";
import fs from "fs/promises";

const parentDir = path.normalize(path.resolve(url.fileURLToPath(import.meta.url), "../.."));

//type InterfaceOrTypeAlias = ts.InterfaceDeclaration | ts.TypeAliasDeclaration;
export type FieldDeclaration = ts.MethodDeclaration | ts.PropertyDeclaration;

export default class ComponentClassGenerator
{
  readonly #sourceFile: ts.SourceFile;
  readonly #sourceTypeAlias: string;
  readonly #entryTypeAlias: string;

  readonly #targetDir: ts.Directory;
  readonly #internalDir: ts.Directory;
  readonly #baseClassName: string;

  #completedInitialRun = false;
  #hasStartComponent = false;
  #hasFinalized = false;

  /**
   * @param sourceFile      - The source file containing the type alias.
   * @param sourceTypeAlias - The type alias to implement.
   * @param targetDir       - The directory to generate code into.
   * @param baseClassName   - The base class name for generated code.
   * @param entryTypeAlias  - The type alias of the entry point.  Extends sourceTypeAlias.
   */
  constructor(
    sourceFile: ts.SourceFile,
    sourceTypeAlias: string,
    targetDir: ts.Directory,
    baseClassName: string,
    entryTypeAlias: string = sourceTypeAlias,
  )
  {
    this.#sourceFile = sourceFile;
    this.#sourceTypeAlias = sourceTypeAlias;
    this.#baseClassName = baseClassName;
    this.#targetDir = targetDir;
    this.#internalDir = targetDir.createDirectory("internal");
    this.#entryTypeAlias = entryTypeAlias
  }

  #runPromise = new SingletonPromise(() => this.#start());
  #finalizePromise = new SingletonPromise(() => this.#finalize());

  async start(): Promise<void>
  {
    await this.#runPromise.run();
  }

  /**
   * Add component and sequence keys.
   *
   * @param keys - The keys to add.
   * @internal
   */
  async addKeys(keys: KeysAsProperties) : Promise<void>
  {
    if (!this.#completedInitialRun)
      throw new Error("Call `await this.run();` first!");
    if (this.#hasFinalized)
      throw new Error("This component class generator has finalized!");

    const passThroughTypeFile = this.#internalDir.getSourceFileOrThrow("PassThroughClassType.mts");

    const importStatements: string[] = [];
    const defineComponentMapLines: string[] = [];

    Object.entries(keys).forEach(([key, componentOrSequence]) => {
      if (componentOrSequence.type === "sequence") {
        defineComponentMapLines.push(`
ComponentMapInternal.addDefaultSequence("${key}", ${JSON.stringify(componentOrSequence.subkeys)});
        `.trim());
        return;
      }

      importStatements.push(`
import ${key}_Class from "${path.normalize(path.join("..", componentOrSequence.file))}";
      `.trim());
      defineComponentMapLines.push(`
ComponentMapInternal.addDefaultComponent("${key}", new ${key}_Class);
      `.trim());
    });

    passThroughTypeFile.addStatements(importStatements.join("\n"));
    passThroughTypeFile.addStatements(defineComponentMapLines.join("\n"));

    await passThroughTypeFile.save();
  }

  /**
   * Set the start component.
   *
   * @param startComponent - the starting component.
   * @internal
   */
  async setStartComponent(startComponent: string) : Promise<void>
  {
    if (!this.#completedInitialRun)
      throw new Error("Call `await this.run();` first!");
    if (this.#hasFinalized)
      throw new Error("This component class generator has finalized!");
    if (this.#hasStartComponent)
      throw new Error("You have already called this.setStartComponent()!");
    this.#hasStartComponent = true;

    const passThroughTypeFile = this.#internalDir.getSourceFileOrThrow("PassThroughClassType.mts");
    passThroughTypeFile.addStatements(`
      ComponentMapInternal.defaultStart = "${startComponent}";
    `.trim());

    await passThroughTypeFile.save();
  }

  get hasFinalized() : boolean
  {
    return this.#hasFinalized;
  }

  async finalize() : Promise<void> {
    await this.#finalizePromise.run();
  }

  async #start() : Promise<void>
  {
    await fs.mkdir(path.join(this.#targetDir.getPath(), "internal"));

    await PromiseAllParallel([
      "internal/Common.mts",
      "KeyToComponentMap_Base.mts",
      "internal/PassThroughSupport.mts",
    ], leafName => this.#copyExport(leafName));

    const baseClassFile = await this.#createBaseClass();

    await this.#createPassThroughType();
    const extendedNIClassFile = await this.#createExtendedNIClass(baseClassFile);
    await this.#createExtendedContinueClass(extendedNIClassFile);

    await this.#createEntryClass(baseClassFile);

    this.#completedInitialRun = true;
  }

  async #copyExport(
    leafName: string
  ) : Promise<void>
  {
    await fs.copyFile(
      path.join(parentDir, "source/exports", leafName),
      path.join(this.#targetDir.getPath(), leafName)
    );

    this.#targetDir.addSourceFileAtPath(leafName);
  }

  /**
   * Create the base class, with not-implemented methods and no pass-through extensions.
   * @returns The BaseClass.mts source file
   */
  async #createBaseClass() : Promise<ts.SourceFile>
  {
    const baseClassFile = this.#targetDir.createSourceFile("BaseClass.mts");
    const TTC = new TypeToClass(
      baseClassFile,
      this.#baseClassName,
      TypeToClass.notImplementedCallback
    );

    TTC.addTypeAliasOrInterface(
      this.#sourceFile,
      this.#entryTypeAlias
    );

    await baseClassFile.save();
    return baseClassFile;
  }

  /**
   * Create the pass-through type.  Note this file may be deleted in the future.
   */
  async #createPassThroughType() : Promise<void>
  {
    const passThroughTypeFile = this.#internalDir.createSourceFile("PassThroughClassType.mts");
    passThroughTypeFile.addStatements(`
export type PassThroughClassType = ComponentPassThroughClass<${
  this.#sourceTypeAlias
}, ${
  this.#entryTypeAlias
}>;

export type PassThroughArgumentType<MethodType extends AnyFunction> = PassThroughType<${
  this.#sourceTypeAlias
}, MethodType, ${
  this.#entryTypeAlias
}>;

const ComponentMapInternal = new InstanceToComponentMap<${
  this.#sourceTypeAlias
}, ${
  this.#entryTypeAlias
}>;
    `.trim() + "\n");

    passThroughTypeFile.fixMissingImports();
    await passThroughTypeFile.save();
  }

  /**
   * Copy the base class, prepend the pass-through argument and set the return type on a "not-implemented" component class.
   *
   * @param baseClassFile - the promised file from this.#createBaseClass()
   * @returns the generated class file.
   */
  async #createExtendedNIClass(
    baseClassFile: ts.SourceFile
  ) : Promise<ts.SourceFile>
  {
    const extendedClassFile = baseClassFile.copy("PassThrough_NotImplemented.mts");

    const extendedClass = extendedClassFile.getClassOrThrow(this.#baseClassName);
    extendedClass.rename(this.#baseClassName + "_PassThroughNI");
    extendedClass.removeImplements(0);
    extendedClass.addImplements("PassThroughClassType");

    const methods = extendedClass.getMethods();
    methods.forEach(method => {
      const name = method.getName();
      const revisedType = `PassThroughArgumentType<${this.#sourceTypeAlias}["${name}"]>`;
      method.insertParameter(0, {
        name: "__passThrough__",
        type: revisedType
      });

      method.setReturnType("void");
    });

    extendedClassFile.fixMissingImports();

    extendedClassFile.formatText({
      ensureNewLineAtEndOfFile: true,
      placeOpenBraceOnNewLineForFunctions: true,
      indentSize: 2,
    });

    await extendedClassFile.save();
    return extendedClassFile;
  }

  /**
   * Copy the "not-implemented" class, and transform the copy into a "pass-through-continue" class.
   *
   * @param niClassFile - the promised file from this.#createExtendedNIClass()
   * @returns the generated class file.
   */
  async #createExtendedContinueClass(
    niClassFile: ts.SourceFile
  ) : Promise<void>
  {
    const continueFile = niClassFile.copy("PassThrough_Continue.mts");
    const extendedClass = continueFile.getClassOrThrow(
      this.#baseClassName + "_PassThroughNI"
    );
    extendedClass.rename(this.#baseClassName + "_PassThroughContinue");

    const methods = extendedClass.getMethods();
    methods.forEach(method => {
      const throwLine = method.getStatementByKindOrThrow(ts.SyntaxKind.ThrowStatement);
      method.removeStatement(throwLine.getChildIndex());
    });

    continueFile.formatText({
      ensureNewLineAtEndOfFile: true,
      placeOpenBraceOnNewLineForFunctions: true,
      indentSize: 2,
    });

    await continueFile.save();
  }

  /**
   * Copy the base class, and transform the copy to create pass-through arguments and call the start component.
   * @param baseClassFile - the promised file from this.#createBaseClass()
   */
  async #createEntryClass(
    baseClassFile: ts.SourceFile
  ) : Promise<void>
  {
    const entryClassFile = baseClassFile.copy("EntryClass.mts");
    const entryClass = entryClassFile.getClassOrThrow(this.#baseClassName);

    const methods = entryClass.getMethods();
    methods.forEach(method => {
      const name = method.getName();
      const throwLine = method.getStatementByKindOrThrow(ts.SyntaxKind.ThrowStatement);
      method.removeStatements([0, throwLine.getChildIndex()]);
      method.addStatements(
        `return this.#INVOKE_SYMBOL<${
          this.#sourceTypeAlias
        }["${
          name
        }"]>("${
          name
        }", [${
          method.getParameters().map(p => p.getName()).join(", ")
        }]);`
      );
    });

    {
      const invokeSymbolMethod = await fs.readFile(
        path.join(parentDir, "source/exports/EntryClass.mts.in"),
        {
          encoding: "utf-8"
        }
      );

      entryClass.addMember(invokeSymbolMethod);
    }

    entryClassFile.addImportDeclaration({
      defaultImport: "ComponentMap",
      moduleSpecifier: "./internal/PassThroughClassType.mjs"
    });

    entryClassFile.fixMissingImports();
    await entryClassFile.save();
  }

  async #finalize() : Promise<void>
  {
    this.#hasFinalized = true;

    const passThroughTypeFile = this.#internalDir.getSourceFileOrThrow("PassThroughClassType.mts");
    passThroughTypeFile.addStatements(
`
const ComponentMap: InstanceToComponentMap_Type<${
  this.#sourceTypeAlias
}, ${
  this.#entryTypeAlias
}> = ComponentMapInternal;
export default ComponentMap;
`.trim()
    );

    passThroughTypeFile.fixMissingImports();
    await passThroughTypeFile.save();
  }
}
