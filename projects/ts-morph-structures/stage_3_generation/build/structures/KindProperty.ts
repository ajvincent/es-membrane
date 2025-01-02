import assert from "node:assert/strict";

import {
  StructureKind
} from "ts-morph";

import {
  ClassSupportsStatementsFlags,
  MemberedStatementsKey,
  type PropertyInitializerGetter,
  TypeStructureKind,
  type stringWriterOrStatementImpl,
} from "#stage_two/snapshot/source/exports.js";

import {
  StructureModule
} from "../../moduleClasses/exports.js";
import StatementGetterBase from "../fieldStatements/GetterBase.js";

export default
class KindPropertyInitializer extends StatementGetterBase
implements PropertyInitializerGetter
{
  protected module: StructureModule;

  constructor(module: StructureModule) {
    super(
      module,
      "KindPropertyInitializer",
      ClassSupportsStatementsFlags.PropertyInitializer
    );
    this.module = module;
  }

  filterPropertyInitializer(key: MemberedStatementsKey): boolean {
    return (key.fieldKey === "kind");
  }

  getPropertyInitializer(
    key: MemberedStatementsKey
  ): stringWriterOrStatementImpl
  {
    assert(key.fieldType, "No field type?")
    assert.equal(key.fieldType.kind, StructureKind.PropertySignature, "kind must be a property");
    assert.equal(key.fieldType.typeStructure?.kind, TypeStructureKind.QualifiedName, "Not a qualified name?");
    assert.equal(key.fieldType.typeStructure.childTypes.length, 2);
    assert.equal(key.fieldType.typeStructure.childTypes[0], "StructureKind");

    return `StructureKind.${key.fieldType.typeStructure.childTypes[1]}`;
  }
}
