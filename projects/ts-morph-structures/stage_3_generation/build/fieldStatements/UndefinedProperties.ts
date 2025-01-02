import assert from "node:assert/strict";

import {
  StructureKind
} from "ts-morph";

import {
  MemberedStatementsKey,
  type PropertyInitializerGetter,
  TypeStructureKind,
  type stringWriterOrStatementImpl,
  ClassSupportsStatementsFlags
} from "#stage_two/snapshot/source/exports.js";

import StatementGetterBase from "./GetterBase.js";
import BaseClassModule from "#stage_three/generation/moduleClasses/BaseClassModule.js";

export default
class UndefinedProperties extends StatementGetterBase
implements PropertyInitializerGetter
{
  constructor(
    module: BaseClassModule
  )
  {
    super(
      module,
      "UndefinedProperties",
      ClassSupportsStatementsFlags.PropertyInitializer
    );
  }

  filterPropertyInitializer(
    key: MemberedStatementsKey
  ): boolean
  {
    assert(key.fieldType?.kind === StructureKind.PropertySignature);
    if (key.fieldType.typeStructure?.kind === TypeStructureKind.Array)
      return false;
    return key.fieldType.hasQuestionToken;
  }

  getPropertyInitializer(
    key: MemberedStatementsKey
  ): stringWriterOrStatementImpl {
    void(key);
    return `undefined`;
  }
}
