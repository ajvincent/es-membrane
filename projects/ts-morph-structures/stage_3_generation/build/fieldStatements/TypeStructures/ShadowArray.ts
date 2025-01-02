import {
  StructureKind
} from "ts-morph";

import {
  ClassSupportsStatementsFlags,
  type MemberedStatementsKey,
  type PropertyInitializerGetter,
  type stringWriterOrStatementImpl,
} from "#stage_two/snapshot/source/exports.js";

import StatementGetterBase from "../GetterBase.js";
import { BaseClassModule } from "#stage_three/generation/moduleClasses/exports.js";

export default
class ShadowArrayStatements extends StatementGetterBase
implements PropertyInitializerGetter
{
  static readonly #regexp = /^#(.*)_ShadowArray$/;

  constructor(
    module: BaseClassModule,
  )
  {
    super(module, "ShadowArrayStatements", ClassSupportsStatementsFlags.PropertyInitializer);
  }

  filterPropertyInitializer(
    key: MemberedStatementsKey
  ): boolean
  {
    if (key.fieldType?.kind !== StructureKind.PropertySignature)
      return false;
    if (key.isFieldStatic === true)
      return false;
    if (!ShadowArrayStatements.#regexp.test(key.fieldType.name)) {
      return false;
    }
    return true;
  }

  getPropertyInitializer(
    key: MemberedStatementsKey
  ): stringWriterOrStatementImpl
  {
    void(key);
    return "[]";
  }
}

