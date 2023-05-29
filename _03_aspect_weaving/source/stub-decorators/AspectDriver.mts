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
  instanceFields: object,
}>;

const AspectDriverDecorator: ConfigureStubDecorator<AspectDriverFields> = function(
  this: void,
  baseClass
)
{
  return class AspectDriver extends baseClass {
    protected getExtendsAndImplements(): ExtendsAndImplements {
      const extendsAndImplements = super.getExtendsAndImplements();

      return {
        extends: `AspectsDictionaryBase<${extendsAndImplements.implements.join(" & ")}>`,
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
        "#aspect_weaving/source/AspectsDictionaryBase.mjs",
        "AspectsDictionaryBase",
        true
      );
      this.addImport(
        "#aspect_weaving/source/AspectsDictionaryBase.mjs",
        "ASPECTS_KEY",
        false
      );
      this.addImport(
        "#aspect_weaving/source/AspectsDictionaryBase.mjs",
        "INNER_TARGET_KEY",
        false
      );
    }

    protected buildMethodBody(
      structure: TS_Method,
      remainingArgs: Set<OptionalKind<ParameterDeclarationStructure>>
    ): void
    {
      remainingArgs.clear();
      const params = structure.parameters ?? [];

      this.classWriter.writeLine(`const __innerTarget__ = this[INNER_TARGET_KEY];`);
      this.#writeInvariants(structure);

      this.classWriter.writeLine(`const __rv__ = __innerTarget__.${
        structure.name
      }(${
        params.map(param => param.name).join(", ")
      })`);
      this.classWriter.newLine();

      this.#writeInvariants(structure);
      this.classWriter.writeLine(`return __rv__;`);
    }

    #writeInvariants(structure: TS_Method): void {
      const params = structure.parameters ?? [];

      this.classWriter.write(`for (let i = 0; i < this[ASPECTS_KEY].classInvariants.length; i++)`);
      this.classWriter.block(() => {
        this.classWriter.writeLine(`const __invariant__ = this[ASPECTS_KEY].classInvariants[i];`);
        this.classWriter.writeLine(`__invariant__.${structure.name}.call(__innerTarget__, ${
          params.map(param => param.name).join(", ")
        });`)
      });
      this.classWriter.newLine();
      this.classWriter.newLine();
    }

    #writeRegion(atStart: boolean): void {
      this.classWriter.writeLine(`//#${atStart ? "" : "end"}region generated stubs`);
      this.classWriter.newLine();
    }
  }
}

export default AspectDriverDecorator;
