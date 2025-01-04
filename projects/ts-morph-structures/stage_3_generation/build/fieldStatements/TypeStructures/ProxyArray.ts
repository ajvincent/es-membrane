import assert from "node:assert/strict";

import {
  StructureKind
} from "ts-morph";

import {
  ArrayTypeStructureImpl,
  ClassSupportsStatementsFlags,
  LiteralTypeStructureImpl,
  type MemberedStatementsKey,
  type PropertyInitializerGetter,
  type stringWriterOrStatementImpl,
} from "#stage_two/snapshot/source/exports.js";

import CallExpressionStatementImpl from "#stage_three/generation/pseudoStatements/CallExpression.js";
import StatementGetterBase from "../GetterBase.js";
import { BaseClassModule } from "#stage_three/generation/moduleClasses/exports.js";

export default
class ProxyArrayStatements extends StatementGetterBase
implements PropertyInitializerGetter
{
  static readonly #regexp = /^#(.*)ProxyArray$/;

  constructor(
    module: BaseClassModule,
  )
  {
    super(module, "ProxyArrayStatements", ClassSupportsStatementsFlags.PropertyInitializer);
  }

  filterPropertyInitializer(
    key: MemberedStatementsKey
  ): boolean
  {
    if (key.fieldType?.kind !== StructureKind.PropertySignature)
      return false;
    if (key.isFieldStatic === true)
      return false;
    if (!ProxyArrayStatements.#regexp.test(key.fieldType.name)) {
      return false;
    }
    return true;
  }

  getPropertyInitializer(
    key: MemberedStatementsKey
  ): stringWriterOrStatementImpl
  {
    assert(key.fieldType?.kind === StructureKind.PropertySignature);
    const propBase: string = ProxyArrayStatements.#regexp.exec(key.fieldType.name)![1];

    return new CallExpressionStatementImpl({
      name: "new Proxy",
      typeParameters: [
        new ArrayTypeStructureImpl(
          LiteralTypeStructureImpl.get("stringOrWriterFunction")
        )
      ],
      parameters: [
        `this.#${propBase}_ShadowArray`,
        `${this.module.exportName}.#${propBase}ArrayReadonlyHandler`
      ]
    }).writerFunction;
  }
}

