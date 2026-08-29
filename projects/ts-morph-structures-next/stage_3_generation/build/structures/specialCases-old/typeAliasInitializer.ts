// #region preamble
import {
  ClassSupportsStatementsFlags,
  type MemberedStatementsKey,
  type PropertyInitializerGetter,
} from "#stage_two/snapshot/source/exports.js";

import BaseClassModule from "../../../moduleClasses/BaseClassModule.js";

import StatementGetterBase from "../../fieldStatements/GetterBase.js";

// #endregion preamble

export class TypeAliasDeclarationInitializer extends StatementGetterBase
implements PropertyInitializerGetter
{
  constructor(
    module: BaseClassModule
  )
  {
    super(
      module,
      "TypeAliasDeclarationInitializer",
      ClassSupportsStatementsFlags.PropertyInitializer
    );
  }

  filterPropertyInitializer(key: MemberedStatementsKey): boolean {
    if (this.baseName !== "TypeAliasDeclarationStructure")
      return false;
    if (key.fieldKey !== "type")
      return false;
    return true;
  }

  getPropertyInitializer(key: MemberedStatementsKey): string {
    void key;
    return `""`;
  }
}
