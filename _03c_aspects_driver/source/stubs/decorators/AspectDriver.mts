// #region preamble

import getRequiredInitializers from "#stage_utilities/source/RequiredInitializers.mjs";

import type {
  RightExtendsLeft
} from "#stage_utilities/source/types/Utility.mjs";

import type {
  StaticAndInstance
} from "#stage_utilities/source/types/StaticAndInstance.mjs";

import type {
  ConfigureStubDecorator,
  TS_Method,
} from "#stub_classes/source/types/export-types.mjs";
import { OptionalKind, ParameterDeclarationStructure } from "ts-morph";

// #endregion preamble

export type AspectDriverFields = RightExtendsLeft<StaticAndInstance, {
  staticFields: object,
  instanceFields: {
    defineDefaultBaseClass(
      pathToBaseClassFile: string,
      baseClassName: string,
      isDefaultImport: boolean,
    ): void;
  },
}>;

const AspectDriverDecorator: ConfigureStubDecorator<AspectDriverFields, false> = function(
  this: void,
  baseClass
)
{
  return class AspectDriver extends baseClass {
    static readonly #INIT_BASE_CLASS_KEY = "(base class defined)";

    #pathToBaseClassFile = "";
    #baseClassName = "";
    #isDefaultImportForBaseClass = false;

    constructor(...args: unknown[]) {
      super(...args);
      getRequiredInitializers(this).add(AspectDriver.#INIT_BASE_CLASS_KEY);
    }

    defineDefaultBaseClass(
      pathToBaseClassFile: string,
      baseClassName: string,
      isDefaultImport: boolean,
    ): void
    {
      getRequiredInitializers(this).mayResolve(AspectDriver.#INIT_BASE_CLASS_KEY);
      this.#pathToBaseClassFile = pathToBaseClassFile;
      this.#baseClassName = baseClassName;
      this.#isDefaultImportForBaseClass = isDefaultImport;
      getRequiredInitializers(this).resolve(AspectDriver.#INIT_BASE_CLASS_KEY);
    }

    protected insertAdditionalMethodsTrap(existingMethods: ReadonlyArray<TS_Method>): ReadonlyArray<TS_Method> {
      return super.insertAdditionalMethodsTrap(existingMethods).flatMap(method => {
        return [method, {
          ...method,
          name: "#" + method.name
        }];
      });
    }

    //#region methodTrap and supporting methods

    protected methodTrap(
      methodStructure: TS_Method | null,
      isBefore: boolean
    ): void
    {
      super.methodTrap(methodStructure, isBefore);

      if (isBefore && !methodStructure) {
        this.#addBaseImports();
        this.#addConstructor();
        this.#writeRegion(true);
      }

      if (!isBefore && !methodStructure) {
        this.classWriter.newLine();
        this.classWriter.newLine();
        this.#writeRegion(false);
      }
    }

    #addBaseImports(): void {
      this.addImport(
        this.#pathToBaseClassFile,
        this.#baseClassName,
        this.#isDefaultImportForBaseClass
      );

      this.addImport(
        "#stub_classes/source/symbol-keys.mjs",
        "INDETERMINATE",
        false
      );

      this.addImport(
        "#aspects/dictionary/source/generated/AspectsDictionary.mjs",
        "getAspectBuilderForClass",
        false
      );

      this.addImport(
        "#aspects/dictionary/source/generated/AspectsDictionary.mjs",
        "buildAspectDictionaryForDriver",
        false
      );

      this.addImport(
        "#aspects/dictionary/source/generated/AspectsDictionary.mjs",
        "AspectsDictionary",
        false
      );
    }

    #addConstructor(): void {
      this.classWriter.writeLine(
        `static readonly #__baseClass__ = ${this.#baseClassName};`
      );

      this.classWriter.writeLine(
        `readonly #__target__: ${this.interfaceOrAliasName};`
      );
      this.classWriter.writeLine(
        `readonly #__aspects__: AspectsDictionary<${this.interfaceOrAliasName}>;`
      )
      this.classWriter.newLine();

      this.classWriter.write(`constructor(...params: ConstructorParameters<typeof ${this.#baseClassName}>) `);
      this.classWriter.block(() => {
        this.classWriter.writeLine(`this.#__target__ = new ${this.getClassName()}.#__baseClass__(...params);`);
        this.classWriter.write(`this.#__aspects__ = buildAspectDictionaryForDriver<${this.interfaceOrAliasName}>(this, this.#__target__);`);
      });
    }

    #writeRegion(atStart: boolean): void {
      this.classWriter.writeLine(`//#${atStart ? "" : "end"}region aspect stubs`);
      this.classWriter.newLine();
    }

    //#endregion methodTrap and supporting methods

    //#region buildMethodBodyTrap and supporting methods
    protected buildMethodBodyTrap(
      structure: TS_Method,
      remainingArgs: Set<OptionalKind<ParameterDeclarationStructure>>
    ): void
    {
      if (structure.name.startsWith("#")) {
        this.#buildPrivateMethod(structure, remainingArgs);
      }
      else {
        this.#buildPublicMethod(structure, remainingArgs);
      }
    }

    /**
     * Build a trap for all body components, which may return a value before the super class invocation.
     * @param structure - the method structure.
     * @param remainingArgs - arguments we haven't used yet.
     */
    #buildPrivateMethod(
      structure: TS_Method,
      remainingArgs: Set<OptionalKind<ParameterDeclarationStructure>>
    ): void
    {
      remainingArgs.clear();

      const params = structure.parameters ?? [];
      const superName = structure.name.substring(1);

      this.classWriter.newLine();

      this.classWriter.write(`for (let i = 0; i < this.#__aspects__.bodyComponents.length; i++)`);
      this.classWriter.block(() => {
        this.classWriter.writeLine(`const __bodyComponent__ = this.#__aspects__.bodyComponents[i];`);
        this.classWriter.writeLine(`const __rv__ = __bodyComponent__.${superName}(${
          params.map(param => param.name).join(", ")
        });`);
        this.classWriter.write(`if (__rv__ !== INDETERMINATE)`);
        this.classWriter.block(() => {
          this.classWriter.writeLine("return __rv__;");
        })
      });
      this.classWriter.newLine();

      this.classWriter.writeLine(`return this.#__target__.${superName}(${
        params.map(param => param.name).join(", ")
      });`);
    }

    /**
     * Build a trap for all aspects (except body components).
     * @param structure - the method structure.
     * @param remainingArgs - arguments we haven't used yet.
     */
    #buildPublicMethod(
      structure: TS_Method,
      remainingArgs: Set<OptionalKind<ParameterDeclarationStructure>>
    ): void
    {
      remainingArgs.clear();
      const params = structure.parameters ?? [];

      this.#writeInvariants(structure);

      this.classWriter.writeLine(`const __rv__ = this.#${
        structure.name
      }(${
        params.map(param => param.name).join(", ")
      });`);
      this.classWriter.newLine();

      this.#writeInvariants(structure);
      this.classWriter.writeLine(`return __rv__;`);
    }

    #writeInvariants(structure: TS_Method): void {
      const params = structure.parameters ?? [];

      this.classWriter.write(`for (let i = 0; i < this.#__aspects__.classInvariants.length; i++)`);
      this.classWriter.block(() => {
        this.classWriter.writeLine(`const __invariant__ = this.#__aspects__.classInvariants[i];`);
        this.classWriter.writeLine(`__invariant__.${structure.name}(${
          params.map(param => param.name).join(", ")
        });`);
      });
      this.classWriter.newLine();
      this.classWriter.newLine();
    }
    //#endregion buildMethodBodyTrap and supporting methods

    protected writeAfterExportTrap() : string
    {
      return `getAspectBuilderForClass<${this.interfaceOrAliasName}>(${this.getClassName()});\n`;
    }
  }
}

export default AspectDriverDecorator;
