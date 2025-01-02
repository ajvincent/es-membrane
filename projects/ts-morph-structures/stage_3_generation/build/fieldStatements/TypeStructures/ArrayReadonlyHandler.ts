import assert from "node:assert/strict";

import {
  StructureKind
} from "ts-morph";

import {
  ClassSupportsStatementsFlags,
  type MemberedStatementsKey,
  type PropertyInitializerGetter,
  type stringWriterOrStatementImpl,
} from "#stage_two/snapshot/source/exports.js";

import CallExpressionStatementImpl from "../../../pseudoStatements/CallExpression.js";
import StatementGetterBase from "../GetterBase.js";
import {
  BaseClassModule
} from "#stage_three/generation/moduleClasses/exports.js";

export default
class ArrayReadonlyHandler extends StatementGetterBase
implements PropertyInitializerGetter
{
  static readonly #regexp = /^#(.*)ArrayReadonlyHandler$/;

  constructor(
    module: BaseClassModule,
  )
  {
    super(module, "ArrayReadonlyHandler", ClassSupportsStatementsFlags.PropertyInitializer);
  }

  filterPropertyInitializer(
    key: MemberedStatementsKey
  ): boolean
  {
    if (key.fieldType?.kind !== StructureKind.PropertySignature)
      return false;
    if (key.isFieldStatic === false)
      return false;
    if (!ArrayReadonlyHandler.#regexp.test(key.fieldType.name)) {
      return false;
    }
    return true;
  }

  getPropertyInitializer(
    key: MemberedStatementsKey
  ): stringWriterOrStatementImpl
  {
    assert(key.fieldType?.kind === StructureKind.PropertySignature);
    const propBase: string = ArrayReadonlyHandler.#regexp.exec(key.fieldType.name)![1];

    this.module.addImports("internal", ["ReadonlyArrayProxyHandler"], []);
    return new CallExpressionStatementImpl({
      name: "new ReadonlyArrayProxyHandler",
      parameters: [
        `"The ${propBase} array is read-only.  Please use this.${propBase}Set to set strings and type structures."`
      ]
    }).writerFunction;
  }
}
