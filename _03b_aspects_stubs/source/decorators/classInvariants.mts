// #region preamble
import {
  CodeBlockWriter,
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
    /** Wrap the class in a function, taking a base class and an invariants array for all instances. */
    wrapClass(): void;
  },
  symbolKey: typeof ClassInvariantsSymbolKey,
}>;

/**
 * @remarks
 *
 * This sets up a stub class for running invariant functions on every instance of a class.  The
 * base class we're running invariants for, and the array of invariants, comes from outside the module.
 * The wrapper class treats the invariants array as read-only.  A `@classInvariant()` decorator should
 * prepend to the invariants array.
 */
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

    /** Wrap the class in a function, taking a base class and an invariants array for all instances. */
    public wrapClass(): void
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
            type: `Class<${this.interfaceOrAliasName}>`,
          },

          {
            name: "invariantsArray",
            type: `UnshiftableArray<(this: ${this.interfaceOrAliasName}) => void>`,
          }
        ],
        "ClassInvariantsWrapper",
        (classWriter: CodeBlockWriter) => { void(classWriter) },
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

    protected methodDeclarationTrap(
      methodStructure: TS_Method | null,
      isBefore: boolean
    ): void
    {
      super.methodDeclarationTrap(methodStructure, isBefore);
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

      if (this.getOriginalStructures().has(methodStructure.name)) {
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
}

export default ClassInvariantsDecorator;
