// #region preamble

import {
  type ModuleSourceDirectory,
  pathToModule
} from "#stage_utilities/source/AsyncSpecModules.mjs";

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

/*
import type {
  ExtendsAndImplements
} from "#stub_classes/source/base/baseStub.mjs";

import ConfigureStub from "#stub_classes/source/base/baseStub.mjs";
*/

// #endregion preamble

const aspectTypesSource: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../../types",
};

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
    protected methodTrap(
      methodStructure: TS_Method | null,
      isBefore: boolean
    ): void
    {
      super.methodTrap(methodStructure, isBefore);

      if (isBefore && !methodStructure) {
        this.#defineAspectsBuilder();
        this.#defineConstructor();
      }
    }

    #defineAspectsBuilder(): void {
      this.addImport(
        pathToModule(aspectTypesSource, "AspectsDictionary.mjs"),
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

    #defineConstructor(): void {
      this.classWriter.writeLine(`readonly #innerTarget: ${this.interfaceOrAliasName};`);
      this.classWriter.writeLine(`readonly #aspects: AspectsDictionary<${this.interfaceOrAliasName}>;`);
      this.classWriter.newLine();

      this.classWriter.write(`constructor(innerTarget: ${this.interfaceOrAliasName})`);
      this.classWriter.block(() => {
        this.classWriter.writeLine(`this.#innerTarget = innerTarget;`);
        this.classWriter.writeLine(`this.#aspects = ${this.getClassName()}.#aspectsBuilder();`);
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
        this.classWriter.writeLine(`__invariant__.${structure.name}.call(this, ${
          params.map(param => param.name).join(", ")
        })`)
      });
      this.classWriter.newLine();
      this.classWriter.newLine();
    }
  }
}

export default AspectDriverDecorator;
