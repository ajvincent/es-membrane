// #region preamble

import type {
  RightExtendsLeft
} from "#stage_utilities/source/types/Utility.mjs";

import type {
  StaticAndInstance
} from "#stage_utilities/source/types/StaticAndInstance.mjs";

import type {
  ConfigureStubDecorator,
  TS_Method,
} from "#stub_classes/source/base/types/export-types.mjs";
import { OptionalKind, ParameterDeclarationStructure } from "ts-morph";

// #endregion preamble

export type AspectDriverFields = RightExtendsLeft<StaticAndInstance, {
  staticFields: object,
  instanceFields: {
    defineDefaultBaseClass(
      className: string
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

    constructor(...args: unknown[]) {
      super(...args);
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
        this.#addAspectsDictionary();
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
        "#aspect_weaving/source/generated/AspectsDictionary.mjs",
        "AspectsDictionary",
        false
      );

      this.addImport(
        "#aspect_weaving/source/generated/AspectsDictionary.mjs",
        "AspectsBuilder",
        false
      );

      this.addImport(
        "#aspect_weaving/source/generated/AspectsDictionary.mjs",
        "type AspectBuilderField",
        false
      )

      this.addImport(
        "#aspect_weaving/source/generated/AspectsDictionary.mjs",
        "buildAspectDictionary",
        false
      );

      this.addImport(
        "#aspect_weaving/source/stubs/symbol-keys.mjs",
        "ASPECTS_BUILDER",
        false
      );

      this.addImport(
        "#aspect_weaving/source/stubs/symbol-keys.mjs",
        "ASPECTS_DICTIONARY",
        false
      );

      this.addImport(
        "#aspect_weaving/source/stubs/symbol-keys.mjs",
        "INDETERMINATE",
        false
      );

      this.addImport(
        "#aspect_weaving/source/stubs/symbol-keys.mjs",
        "WRAPPED_FOR_ASPECTS",
        false
      );
    }

    #addAspectsDictionary(): void {
      this.classWriter.writeLine(
        `public static readonly [ASPECTS_BUILDER] = new AspectsBuilder<${this.interfaceOrAliasName}>(null);`
      );
      this.classWriter.newLine();

      this.classWriter.write(
        `public get [ASPECTS_BUILDER](): AspectsBuilder<${this.interfaceOrAliasName}> `
      );
      this.classWriter.block(() => {
        this.classWriter.writeLine(`return ${this.getClassName()}[ASPECTS_BUILDER];`)
      });
      this.classWriter.newLine();

      this.classWriter.writeLine(
        `public readonly [ASPECTS_DICTIONARY]: AspectsDictionary<${this.interfaceOrAliasName}>;`
      );

      this.classWriter.writeLine(
        `private readonly [WRAPPED_FOR_ASPECTS]: ${this.interfaceOrAliasName};`
      );
    }

    #addConstructor(): void {
      this.classWriter.write(`constructor(wrapped: ${this.interfaceOrAliasName}) `);
      this.classWriter.block(() => {
        this.classWriter.writeLine(`this[WRAPPED_FOR_ASPECTS] = wrapped;`);
        this.classWriter.writeLine(`this[ASPECTS_DICTIONARY] = buildAspectDictionary<`);
        this.classWriter.indent(() => {
          this.classWriter.writeLine(this.interfaceOrAliasName + ",");
          this.classWriter.writeLine(`
            ${this.getClassName()} & AspectBuilderField<${this.interfaceOrAliasName}>
          `.trim());
        });
        this.classWriter.writeLine(">");
        this.classWriter.writeLine("(wrapped, this);")
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

      this.classWriter.writeLine(`const __aspects__ = this[ASPECTS_DICTIONARY];`);
      this.classWriter.newLine();

      this.classWriter.write(`for (let i = 0; i < __aspects__.bodyComponents.length; i++)`);
      this.classWriter.block(() => {
        this.classWriter.writeLine(`const __bodyComponent__ = __aspects__.bodyComponents[i];`);
        this.classWriter.writeLine(`const __rv__ = __bodyComponent__.${superName}(${
          params.map(param => param.name).join(", ")
        });`);
        this.classWriter.write(`if (__rv__ !== INDETERMINATE)`);
        this.classWriter.block(() => {
          this.classWriter.writeLine("return __rv__;");
        })
      });
      this.classWriter.newLine();

      this.classWriter.writeLine(`return this[WRAPPED_FOR_ASPECTS].${superName}(${
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

      this.classWriter.writeLine(`const __aspects__ = this[ASPECTS_DICTIONARY];`);
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

      this.classWriter.write(`for (let i = 0; i < __aspects__.classInvariants.length; i++)`);
      this.classWriter.block(() => {
        this.classWriter.writeLine(`const __invariant__ = __aspects__.classInvariants[i];`);
        this.classWriter.writeLine(`__invariant__.${structure.name}(${
          params.map(param => param.name).join(", ")
        });`);
      });
      this.classWriter.newLine();
      this.classWriter.newLine();
    }
    //#endregion buildMethodBodyTrap and supporting methods
  }
}

export default AspectDriverDecorator;
