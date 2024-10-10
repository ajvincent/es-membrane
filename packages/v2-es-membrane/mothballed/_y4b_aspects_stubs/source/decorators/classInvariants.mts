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

import AspectsStubBase, {
  type ExtendsAndImplements,
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
      const rv = super.getExtendsAndImplementsTrap(context);
      return {
        extends: "baseClass",
        implements: rv.implements.concat("SharedAssertionObserver")
      };
    }

    protected insertAdditionalMethodsTrap(
      existingMethods: readonly TS_Method[]
    ): readonly TS_Method[]
    {
      return [
        {
          name: "#runInvariants",
          typeParameters: [],
          parameters: [],
          returnType: "void",
        },

        {
          name: "#abortIfAssertFailed",
          parameters: [],
          returnType: "void",
        },

        {
          name: "observeAssertFailed",
          parameters: [
            {
              name: "forSelf",
              type: "boolean",
            },
          ],

          returnType: "void",
        },

        ...super.insertAdditionalMethodsTrap(existingMethods),
      ];
    }

    protected methodDeclarationTrap(
      methodStructure: TS_Method | null,
      isBefore: boolean
    ): void
    {
      if (!isBefore && (methodStructure?.name === "observeAssertFailed")) {
        return;
      }

      super.methodDeclarationTrap(methodStructure, isBefore);
      if (!isBefore || methodStructure)
        return;

      this.classWriter.writeLine(
        `static readonly #invariantsArray: readonly ((this: ${this.interfaceOrAliasName}) => void)[] = invariantsArray;`
      );
      this.classWriter.newLine();

      this.classWriter.writeLine(`#assertFailed = false;`);
      this.#defineAssertAccessors();
      this.#addAssertImports();

      this.addConstructorWriter({
        parameters: [
          {
            name: "__sharedAssert__",
            type: "SharedAssertSet",
          }
        ],
        writerFunction: (writer: CodeBlockWriter) => {
          writer.writeLine(`__sharedAssert__.buildShared(this);`);
        }
      }, "");
    }

    #defineAssertAccessors(): void {
      this.classWriter.write(`get assert(): AssertFunction `);
      this.classWriter.block(() => {
        this.classWriter.writeLine("return unsharedAssert;");
      });
      this.classWriter.newLine();

      this.classWriter.write(`set assert(newAssert: AssertFunction) `);
      this.classWriter.block(() => {
        AspectsStubBase.pairedWrite(
          this.classWriter,
          `Reflect.defineProperty(this, "assert", `,
          `);`,
          false,
          true,
          () => {
            this.classWriter.block(() => {
              this.classWriter.writeLine(`value: newAssert,`);
              this.classWriter.writeLine(`writable: false,`);
              this.classWriter.writeLine(`enumerable: true,`);
              this.classWriter.writeLine(`configurable: false`);
            });
          }
        );
      });
      this.classWriter.newLine();
      this.classWriter.newLine();
    }

    #addAssertImports(): void {
      this.addImport(
        "#stage_utilities/source/SharedAssertSet.mjs",
        "SharedAssertSet",
        true,
        true
      );

      this.addImport(
        "#stage_utilities/source/SharedAssertSet.mjs",
        "unsharedAssert",
        false,
        true
      );

      this.addImport(
        "#stage_utilities/source/types/assert.mjs",
        "type AssertFunction",
        false,
        true
      );

      this.addImport(
        "#stage_utilities/source/types/assert.mjs",
        "type SharedAssertionObserver",
        false,
        true
      );
    }

    protected buildMethodBodyTrap(
      methodStructure: TS_Method,
      remainingArgs: Set<TS_Parameter>,
    ) : void
    {
      if (methodStructure.name === "#runInvariants") {
        return this.#build_runInvariants();
      }

      if (methodStructure.name === "#abortIfAssertFailed") {
        return this.#build_abortIfAssertFailed();
      }

      if (methodStructure.name === "observeAssertFailed") {
        this.voidArguments(remainingArgs);
        this.classWriter.writeLine(`this.#assertFailed = true;`);
        return;
      }

      remainingArgs.clear();
      if (this.getOriginalStructures().has(methodStructure.name)) {
        this.classWriter.writeLine(`this.#abortIfAssertFailed();`);
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

    #build_runInvariants(): void {
      this.classWriter.writeLine(
        `${this.getClassName()}.#invariantsArray.forEach(invariant => invariant.apply(this));`
      );
    }

    #build_abortIfAssertFailed(): void {
      this.classWriter.write(`if (this.#assertFailed) `);
      this.classWriter.block(() => {
        this.classWriter.writeLine(
          `throw new Error("An assertion has already failed.  This object is dead.");`
        );
      });
    }
  }
}

export default ClassInvariantsDecorator;
