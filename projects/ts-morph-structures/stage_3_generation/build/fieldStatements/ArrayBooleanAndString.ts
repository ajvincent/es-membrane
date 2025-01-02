import assert from "node:assert/strict";

import {
  ClassSupportsStatementsFlags,
  LiteralTypeStructureImpl,
  type MemberedStatementsKey,
  type PropertyInitializerGetter,
  type stringWriterOrStatementImpl,
  TypeStructureKind,
} from "#stage_two/snapshot/source/exports.js";
import { StructureKind } from "ts-morph";

import {
  BaseClassModule,
} from "../../moduleClasses/exports.js";

import StatementGetterBase from "./GetterBase.js";

const booleanType = LiteralTypeStructureImpl.get("boolean");
const stringType = LiteralTypeStructureImpl.get("string");

export default
class ArrayBooleanAndString
extends StatementGetterBase
implements PropertyInitializerGetter
{
  readonly #isStructureModule: boolean;
  constructor(
    module: BaseClassModule,
    isStructureModule: boolean
  )
  {
    super(module, "ArrayBooleanAndString", ClassSupportsStatementsFlags.PropertyInitializer);
    this.#isStructureModule = isStructureModule;
  }

  filterPropertyInitializer(key: MemberedStatementsKey): boolean {
    if (key.fieldType?.kind !== StructureKind.PropertySignature)
      return false;
    if (key.fieldType.hasQuestionToken)
      return false;

    const { typeStructure } = key.fieldType;
    return (
      typeStructure === booleanType ||
      typeStructure === stringType ||
      typeStructure?.kind === TypeStructureKind.Array
    );
  }

  getPropertyInitializer(
    key: MemberedStatementsKey
  ): stringWriterOrStatementImpl | undefined
  {
    assert(key.fieldType?.kind === StructureKind.PropertySignature);
    if (key.fieldType.typeStructure === booleanType)
      return "false";

    if (key.fieldType.typeStructure === stringType) {
      return this.#isStructureModule ? undefined : `""`;
    }

    return "[]";
  }
}
