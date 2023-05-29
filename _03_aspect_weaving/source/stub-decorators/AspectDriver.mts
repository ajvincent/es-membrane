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
        extends: extendsAndImplements.extends,
        implements: extendsAndImplements.implements.map(_implements => `WrapWithInnerTargetKey<${_implements}>`),
      };
    }

    protected methodTrap(
      methodStructure: TS_Method | null,
      isBefore: boolean
    ): void
    {
      super.methodTrap(methodStructure, isBefore);

      if (isBefore && !methodStructure) {
        this.#defineAspectsBuilder();
        this.#defineInnerTargetSetter();
        this.#writeRegion(true);
      }

      if (!isBefore && !methodStructure) {
        this.classWriter.newLine();
        this.classWriter.newLine();
        this.#writeRegion(false);
      }
    }

    #defineAspectsBuilder(): void {
      this.addImport(
        "#aspect_weaving/source/types/AspectsDictionary.mjs",
        `type AspectsDictionary`,
        false
      );

      this.classWriter.writeLine(`static #aspectsBuilder(): AspectsDictionary<${this.interfaceOrAliasName}> `);
      this.classWriter.block(() => {
        this.classWriter.write("return ");
        this.classWriter.block(() => {
          this.classWriter.write("classInvariant: [],");
        });
      });
      this.classWriter.newLine();
      this.classWriter.newLine();
    }

    #defineInnerTargetSetter(): void {
      this.addImport(
        "#aspect_weaving/source/innerTargetSymbol.mjs",
        "INNER_TARGET_KEY",
        true
      );
      this.addImport(
        "#aspect_weaving/source/innerTargetSymbol.mjs",
        "type WrapWithInnerTargetKey",
        false
      );

      this.classWriter.writeLine(`#innerTarget: ${this.interfaceOrAliasName} = this;`);
      this.classWriter.writeLine(`readonly #aspects: AspectsDictionary<${this.interfaceOrAliasName}> = ${this.getClassName()}.#aspectsBuilder();`);
      this.classWriter.newLine();

      this.classWriter.write(`[INNER_TARGET_KEY](innerTarget: ${this.interfaceOrAliasName}): void`);
      this.classWriter.block(() => {
        this.classWriter.writeLine(`this.#innerTarget = innerTarget;`);
        //this.classWriter.writeLine(`this.#aspects = ${this.getClassName()}.#aspectsBuilder();`);
      });

      this.classWriter.newLine();
      this.classWriter.newLine();
    }

    protected buildMethodBody(
      structure: TS_Method,
      remainingArgs: Set<OptionalKind<ParameterDeclarationStructure>>
    ): void
    {
      remainingArgs.clear();
      const params = structure.parameters ?? [];

      this.#writeInvariants(structure);

      this.classWriter.writeLine(`const __rv__ = this.#innerTarget.${
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

      this.classWriter.write(`for (let i = 0; i < this.#aspects.classInvariant.length; i++) `);
      this.classWriter.block(() => {
        this.classWriter.writeLine(`const __invariant__ = this.#aspects.classInvariant[i];`);
        this.classWriter.writeLine(`__invariant__.${structure.name}.call(this.#innerTarget, ${
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
