// #region preamble
import BaseClassModule from "#stage_three/generation/moduleClasses/BaseClassModule.js";
import {
  ClassSupportsStatementsFlags,
  ConstructorBodyStatementsGetter,
  type MemberedStatementsKey,
  type PropertyInitializerGetter,
  type stringWriterOrStatementImpl,
} from "#stage_two/snapshot/source/exports.js";
import StatementGetterBase from "../../fieldStatements/GetterBase.js";

// #endregion preamble

export default class FixKeyType_Filter extends StatementGetterBase
implements PropertyInitializerGetter, ConstructorBodyStatementsGetter
{
  constructor(
    module: BaseClassModule
  )
  {
    super(
      module,
      "FixKeyType_Filter",
      ClassSupportsStatementsFlags.ConstructorBodyStatements |
      ClassSupportsStatementsFlags.PropertyInitializer
    );
  }

  filterCtorBodyStatements(
    key: MemberedStatementsKey
  ): boolean
  {
    return(
      (this.module.defaultExportName === "IndexSignatureDeclarationImpl") &&
      (key.fieldKey === "#keyTypeAccessors")
    );
  }

  getCtorBodyStatements(
    key: MemberedStatementsKey
  ): readonly stringWriterOrStatementImpl[]
  {
    void key;
    this.module.addImports(
      "internal", [`REPLACE_WRITER_WITH_STRING`, `TypeAccessors`], []
    );
    return [
      `// keyType is getting lost in ts-morph clone operations`,
      `const keyTypeAccessors = new TypeAccessors;`,
      `this.#keyTypeAccessors = keyTypeAccessors`,
      `
      Reflect.defineProperty(this, "keyType", {
        configurable: false,
        enumerable: true,

        get: function(): string | undefined {
          const type = keyTypeAccessors.type;
          return type !== undefined ? StructureBase[REPLACE_WRITER_WITH_STRING](type) : undefined;
        },

        set: function(value: string | undefined): void {
          keyTypeAccessors.type = value;
        }
      });
      `
    ];
  }

  filterPropertyInitializer(key: MemberedStatementsKey): boolean {
    return(
      (this.module.defaultExportName === "IndexSignatureDeclarationImpl") &&
      (key.fieldKey === "keyType")
    );
  }

  getPropertyInitializer(key: MemberedStatementsKey): stringWriterOrStatementImpl | undefined {
    void(key);
    return "undefined";
  }
}
