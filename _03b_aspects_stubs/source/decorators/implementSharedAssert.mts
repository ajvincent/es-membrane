// #region preamble
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
import AspectsStubBase from "../AspectsStubBase.mjs";

// #endregion preamble

declare const ImplementSharedAssertsKey: unique symbol;

export type ImplementSharedAssertsFields = RightExtendsLeft<StaticAndInstance<typeof ImplementSharedAssertsKey>, {
  staticFields: object,
  instanceFields: object,
  symbolKey: typeof ImplementSharedAssertsKey
}>;

/**
 * @remarks
 *
 * Classes which this generates support shared assertions.
 */
const ImplementSharedAssertsDecorator: AspectsStubDecorator<ImplementSharedAssertsFields> = function(
  this: void,
  baseClass
)
{
  return class ImplementSharedAsserts extends baseClass {
    protected getExtendsAndImplementsTrap(
      context: Map<symbol, unknown>
    ): ExtendsAndImplements
    {
      const rv = super.getExtendsAndImplementsTrap(context);
      return {
        ...rv,
        implements: rv.implements.concat("SharedAssertionObserver"),
      }
    }

    protected insertAdditionalMethodsTrap(
      existingMethods: readonly TS_Method[]
    ): readonly TS_Method[]
    {
      return [
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
        writer: (writer) => {
          writer.writeLine(`__sharedAssert__.buildShared(this);`);
        }
      }, "");
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

    protected buildMethodBodyTrap(
      structure: TS_Method,
      remainingArgs: Set<TS_Parameter>
    ): void
    {
      if (structure.name === "#abortIfAssertFailed") {
        this.classWriter.write(`if (this.#assertFailed) `);
        this.classWriter.block(() => {
          this.classWriter.writeLine(
            `throw new Error("An assertion has already failed.  This object is dead.");`
          );
        });

        return;
      }

      if (structure.name === "observeAssertFailed") {
        this.voidArguments(remainingArgs);
        this.classWriter.writeLine(`this.#assertFailed = true;`);
        return;
      }

      if (this.getOriginalStructures().has(structure.name)) {
        this.classWriter.writeLine(`this.#abortIfAssertFailed();`);
      }

      return super.buildMethodBodyTrap(structure, remainingArgs);
    }
  }
}

export default ImplementSharedAssertsDecorator;
