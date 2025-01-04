// #region preamble
import {
  StructureKind
} from "ts-morph";

import BaseClassModule from "#stage_three/generation/moduleClasses/BaseClassModule.js";
import {
  type AccessorMirrorGetter,
  type ClassHeadStatementsGetter,
  ClassSupportsStatementsFlags,
  type ClassTailStatementsGetter,
  type MemberedStatementsKey,
  type PropertyInitializerGetter,
  type stringWriterOrStatementImpl,
} from "#stage_two/snapshot/source/exports.js";
import StatementGetterBase from "../../fieldStatements/GetterBase.js";

// #endregion preamble

export default class FixKeyType_Filter extends StatementGetterBase
implements AccessorMirrorGetter, ClassHeadStatementsGetter, ClassTailStatementsGetter, PropertyInitializerGetter
{
  constructor(
    module: BaseClassModule
  )
  {
    super(
      module,
      "FixKeyType_Filter",
      ClassSupportsStatementsFlags.AccessorMirror |
      ClassSupportsStatementsFlags.HeadStatements |
      ClassSupportsStatementsFlags.TailStatements |
      ClassSupportsStatementsFlags.PropertyInitializer
    );
  }

  filterAccessorMirror(key: MemberedStatementsKey): boolean {
    if (this.module.baseName !== "IndexSignatureDeclarationStructure")
      return false;
    if (key.fieldType?.kind !== StructureKind.GetAccessor)
      return false;
    return (key.fieldKey === "keyType");
  }

  getAccessorMirror(key: MemberedStatementsKey): undefined {
    void(key);
  }

  filterHeadStatements(key: MemberedStatementsKey): boolean {
    return (
      (this.module.defaultExportName === "IndexSignatureDeclarationImpl") &&
      (key.statementGroupKey === "get keyType")
    );
  }

  getHeadStatements(key: MemberedStatementsKey): readonly stringWriterOrStatementImpl[] {
    void(key);
    return [`const type = this.#keyTypeManager.type;`];
  }

  filterTailStatements(key: MemberedStatementsKey): boolean {
    if (this.module.defaultExportName !== "IndexSignatureDeclarationImpl")
      return false;

    return (
      (key.statementGroupKey === "get keyType") ||
      (key.statementGroupKey === "set keyType")
    );
  }

  getTailStatements(key: MemberedStatementsKey): readonly stringWriterOrStatementImpl[] {
    if (key.statementGroupKey === "get keyType") {
      this.module.addImports("internal", ["REPLACE_WRITER_WITH_STRING"], []);
      return [`return type ? StructureBase[REPLACE_WRITER_WITH_STRING](type) : undefined;`];
    }

    return [`this.#keyTypeManager.type = value;`];
  }

  filterPropertyInitializer(key: MemberedStatementsKey): boolean {
    return(
      (this.module.defaultExportName === "IndexSignatureDeclarationImpl") &&
      (key.fieldKey === "keyType")
    );
  }

  getPropertyInitializer(key: MemberedStatementsKey): stringWriterOrStatementImpl | undefined {
    void(key);
    return undefined;
  }
}
