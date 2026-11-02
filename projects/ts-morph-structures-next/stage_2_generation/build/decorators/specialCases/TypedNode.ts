//#region preamble
import {
  ClassFieldStatementsMap,
  ClassSupportsStatementsFlags,
  ConstructorHeadStatementsGetter,
  stringWriterOrStatementImpl,
  type MemberedStatementsKey,
  type MemberedTypeToClass,
} from "#stage_one/snapshot/source/exports.js";

import StatementGetterBase from "../../fieldStatements/GetterBase.js";

import type {
  DecoratorModule
} from "../../../moduleClasses/exports.js";

import type {
  DecoratorModuleModifierTraps
} from "../../../types/DecoratorModuleModifierTraps.js";

import {
  StatementsPriority
} from "../../fieldStatements/StatementsPriority.js";
//#endregion preamble

export const TypedNodeSpecialCases: DecoratorModuleModifierTraps = {
  modifyTypeToClassBeforeBuild(
    module: DecoratorModule,
    typeToClass: MemberedTypeToClass
  ): void
  {
    void module;
    typeToClass.addStatementGetters(StatementsPriority.DECORATOR_SPECIFIC, [
      new TypedNodeConstructorStatements(module)
    ]);
  }
};

class TypedNodeConstructorStatements extends StatementGetterBase
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
