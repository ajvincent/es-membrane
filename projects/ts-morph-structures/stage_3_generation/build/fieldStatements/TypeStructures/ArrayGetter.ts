import assert from "node:assert/strict";

import {
  StructureKind
} from "ts-morph";

import {
  type AccessorMirrorGetter,
  ClassSupportsStatementsFlags,
  TypeStructureKind,
  type MemberedStatementsKey,
  type stringWriterOrStatementImpl,
} from "#stage_two/snapshot/source/exports.js";

import {
  BaseClassModule
} from "#stage_three/generation/moduleClasses/exports.js";

import PropertyHashesWithTypes from "../../classTools/PropertyHashesWithTypes.js";
import StatementGetterBase from "../GetterBase.js";

export default
class TypeArrayStatements extends StatementGetterBase
implements AccessorMirrorGetter
{
  constructor(
    module: BaseClassModule,
  )
  {
    super(module, "TypeArrayStatements", ClassSupportsStatementsFlags.AccessorMirror);
  }

  filterAccessorMirror(
    key: MemberedStatementsKey
  ): boolean
  {
    if (key.fieldType?.kind !== StructureKind.GetAccessor)
      return false;
    if (key.fieldType.returnTypeStructure?.kind !== TypeStructureKind.Array)
      return false;
    return PropertyHashesWithTypes.has(this.module.baseName, key.fieldType.name);
  }

  getAccessorMirror(
    key: MemberedStatementsKey
  ): stringWriterOrStatementImpl
  {
    assert.equal(key.fieldType?.kind, StructureKind.GetAccessor);
    return `this.#${key.fieldType.name}ProxyArray`;
  }
}
