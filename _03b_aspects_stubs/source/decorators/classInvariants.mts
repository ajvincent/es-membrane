// #region preamble
import {
  CodeBlockWriter,
  WriterFunction
} from "ts-morph";

import getRequiredInitializers from "#stage_utilities/source/RequiredInitializers.mjs";

import type {
  RightExtendsLeft
} from "#stage_utilities/source/types/Utility.mjs";

import type {
  StaticAndInstance
} from "#mixin_decorators/source/types/StaticAndInstance.mjs";

import type {
  AspectsStubDecorator
} from "../types/AspectsStubDecorator.mjs";

import type {
  TS_Method,
  TS_Parameter,
} from "../types/ts-morph-native.mjs";

import type {
  ExtendsAndImplements,
} from "../AspectsStubBase.mjs";

// #endregion preamble

declare const ClassInvariantsSymbolKey: unique symbol;

export type ClassInvariantsFields = RightExtendsLeft<StaticAndInstance<typeof ClassInvariantsSymbolKey>, {
  staticFields: object,
  instanceFields: {
    wrapInClass(
      classArguments: string
    ): void;
  },
  symbolKey: typeof ClassInvariantsSymbolKey,
}>;

const ClassInvariantsDecorator: AspectsStubDecorator<ClassInvariantsFields> = function(
  this: void,
  baseClass
)
{
  return class ClassInvariants extends baseClass {
    static readonly #WRAP_CLASS_KEY = "(wrap class, invariants)";

    constructor(...args: unknown[]) {
      super(...args);
      getRequiredInitializers(this).add(ClassInvariants.#WRAP_CLASS_KEY);
    }

    wrapInClass(
      classArguments: string
    ): void
    {
      getRequiredInitializers(this).mayResolve(ClassInvariants.#WRAP_CLASS_KEY);

      this.addImport(
        "#stage_utilities/source/types/Utility.mjs",
        "type UnshiftableArray",
        false,
        true,
      );

      this.wrapInFunction(
        [],
        [
          {
            name: "baseClass",
            type: `Class<${this.interfaceOrAliasName}${
              classArguments ? ", " + classArguments : ""
            }>`,
          },

          {
            name: "invariantsArray",
            type: `UnshiftableArray<(this: ${this.interfaceOrAliasName}) => void>`,
          }
        ],
        "ClassInvariantsWrapper",
        (classWriter: CodeBlockWriter) => { void(classWriter) },
        (classWriter: CodeBlockWriter, originalWriter: WriterFunction) => {
          originalWriter(classWriter);
        },
      );

      getRequiredInitializers(this).resolve(ClassInvariants.#WRAP_CLASS_KEY);
    }

    protected getExtendsAndImplementsTrap(
      context: Map<symbol, unknown>
    ): ExtendsAndImplements
    {
      return {
        extends: "baseClass",
        implements: super.getExtendsAndImplementsTrap(context).implements
      };
    }

    protected insertAdditionalMethodsTrap(
      existingMethods: ReadonlyArray<TS_Method>
    ): ReadonlyArray<TS_Method>
    {
      return [
        {
          name: "#runInvariants",
          typeParameters: [],
          parameters: [],
          returnType: "void",
        },
        ...existingMethods
      ];
    }

    protected methodTrap(
      methodStructure: TS_Method | null,
      isBefore: boolean
    ): void
    {
      super.methodTrap(methodStructure, isBefore);
      if (!isBefore || methodStructure)
        return;


      this.classWriter.writeLine(
        `static readonly #invariantsArray: ReadonlyArray<(this: ${this.interfaceOrAliasName}) => void> = invariantsArray;`
      );
      this.classWriter.newLine();
    }

    protected buildMethodBodyTrap(
      methodStructure: TS_Method,
      remainingArgs: Set<TS_Parameter>,
    ) : void
    {
      remainingArgs.clear();
      if (methodStructure.name === "#runInvariants") {
        this.classWriter.writeLine(
          `${this.getClassName()}.#invariantsArray.forEach(invariant => invariant.apply(this));`
        );
        return;
      }

      this.classWriter.writeLine(`this.#runInvariants();`);
      this.classWriter.writeLine(`const __rv__ = super.${
        methodStructure.name
      }(${
        (methodStructure.parameters ?? []).map(param => param.name).join(", ")
      });`);
      this.classWriter.writeLine(`this.#runInvariants();`);
      this.classWriter.writeLine(`return __rv__;`);
    }
  }
}

export default ClassInvariantsDecorator;
