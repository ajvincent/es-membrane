import {
  ClassFieldStatementsMap,
  ClassSupportsStatementsFlags,
  ConstructorHeadStatementsGetter,
  stringWriterOrStatementImpl,
  type MemberedStatementsKey,
} from "#stage_two/snapshot/source/exports.js";

import {
  DecoratorModule
} from "#stage_three/generation/moduleClasses/exports.js";

import StatementGetterBase from "../fieldStatements/GetterBase.js";

export class TypedNodeConstructorStatements extends StatementGetterBase
implements ConstructorHeadStatementsGetter
{
  constructor(module: DecoratorModule) {
    super(
      module,
      "TypedNodeConstructor",
      ClassSupportsStatementsFlags.ConstructorHeadStatements
    );
  }

  filterCtorHeadStatements(key: MemberedStatementsKey): boolean {
    if ((this.baseName === "TypedNodeStructure") && (key.fieldKey === ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL))
      return true;
    if ((this.baseName === "ReturnTypedNodeStructure") && (key.fieldKey === ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL))
      return true;
    return false;
  }

  getCtorHeadStatements(key: MemberedStatementsKey): readonly stringWriterOrStatementImpl[] {
    void key;
    return ["super();"];
  }
}