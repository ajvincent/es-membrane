import {
  StructureKind
} from "ts-morph";

import {
  type AccessorMirrorGetter,
  type MemberedStatementsKey,
  type stringWriterOrStatementImpl,
  ClassSupportsStatementsFlags,
} from "#stage_two/snapshot/source/exports.js";

import PropertyHashesWithTypes from "../../classTools/PropertyHashesWithTypes.js";
import StatementGetterBase from "../GetterBase.js";
import { BaseClassModule } from "#stage_three/generation/moduleClasses/exports.js";

export default
class TypeGetterStatements extends StatementGetterBase
implements AccessorMirrorGetter
{
  constructor(
    module: BaseClassModule,
  )
  {
    super(module, "TypeGetterStatements", ClassSupportsStatementsFlags.AccessorMirror);
  }

  filterAccessorMirror(
    key: MemberedStatementsKey
  ): boolean
  {
    if (key.fieldType?.kind !== StructureKind.GetAccessor)
      return false;
    return PropertyHashesWithTypes.has(this.module.baseName, key.fieldKey);
  }

  getAccessorMirror(
    key: MemberedStatementsKey
  ): stringWriterOrStatementImpl
  {
    return `this.#${key.fieldKey}Manager.type`;
  }
}
