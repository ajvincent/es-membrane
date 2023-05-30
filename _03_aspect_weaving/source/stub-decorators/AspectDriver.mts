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
import { ExtendsAndImplements } from "#stub_classes/source/base/baseStub.mjs";

// #endregion preamble

export type AspectDriverFields = RightExtendsLeft<StaticAndInstance, {
  staticFields: object,
  instanceFields: {
    defineDefaultBaseClass(
      className: string
    ): void;
  },
}>;

const AspectDriverDecorator: ConfigureStubDecorator<AspectDriverFields> = function(
  this: void,
  baseClass
)
{
  return class AspectDriver extends baseClass {
    static readonly #INIT_BASE_CLASS_KEY = "(base class defined)";

    #baseClassName = "";

    constructor(...args: unknown[]) {
      super(...args);
      this.requiredInitializers.add(AspectDriver.#INIT_BASE_CLASS_KEY);
    }

    public defineDefaultBaseClass(
      className: string
    ): void {
      this.requiredInitializers.mayResolve(AspectDriver.#INIT_BASE_CLASS_KEY);

      this.#baseClassName = className;

      this.requiredInitializers.resolve(AspectDriver.#INIT_BASE_CLASS_KEY);
    }

    protected getExtendsAndImplements(): ExtendsAndImplements {
      const extendsAndImplements = super.getExtendsAndImplements();

      return {
        extends: this.#baseClassName,
        implements: extendsAndImplements.implements,
      };
    }

    protected methodTrap(
      methodStructure: TS_Method | null,
      isBefore: boolean
    ): void
    {
      super.methodTrap(methodStructure, isBefore);

      if (isBefore && !methodStructure) {
        this.#addBaseImports();
        this.#addAspectsDictionary();
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
        "#aspect_weaving/source/AspectsDictionary.mjs",
        "AspectsDictionary",
        true
      );
      this.addImport(
        "#aspect_weaving/source/symbol-keys.mjs",
        "ASPECTS_KEY",
        false
      );
    }

    #addAspectsDictionary(): void {
      this.classWriter.writeLine(`static readonly [ASPECTS_KEY] = new AspectsDictionary<NumberStringType>;`);
      this.classWriter.newLine();
    }

    protected buildMethodBody(
      structure: TS_Method,
      remainingArgs: Set<OptionalKind<ParameterDeclarationStructure>>
    ): void
    {
      remainingArgs.clear();
      const params = structure.parameters ?? [];

      this.classWriter.writeLine(`const __aspects__ = ${this.getClassName()}[ASPECTS_KEY];`);
      this.#writeInvariants(structure);

      this.classWriter.writeLine(`const __rv__ = super.${
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
        this.classWriter.writeLine(`__invariant__.${structure.name}(this, [${
          params.map(param => param.name).join(", ")
        }]);`)
      });
      this.classWriter.newLine();
      this.classWriter.newLine();
    }

    #writeRegion(atStart: boolean): void {
      this.classWriter.writeLine(`//#${atStart ? "" : "end"}region aspect stubs`);
      this.classWriter.newLine();
    }
  }
}

export default AspectDriverDecorator;
