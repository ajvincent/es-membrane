import assert from "node:assert/strict";

import {
  StructureKind
} from "ts-morph";

import {
  ClassSupportsStatementsFlags,
  ConstructorBodyStatementsGetter,
  stringOrWriterFunction,
  type MemberedStatementsKey,
} from "#stage_two/snapshot/source/exports.js";

import {
  BaseClassModule
} from "#stage_three/generation/moduleClasses/exports.js";

import StatementGetterBase from "../GetterBase.js";
import CallExpressionStatementImpl from "#stage_three/generation/pseudoExpressions/statements/CallExpression.js";

export default
class TypeManagerStatements extends StatementGetterBase
implements ConstructorBodyStatementsGetter
{
  static readonly #managerRE = /^#(.*)Accessors$/;

  constructor(
    module: BaseClassModule,
  )
  {
    super(
      module,
      "TypeManagerStatements",
      ClassSupportsStatementsFlags.ConstructorBodyStatements
    );
  }

  filterCtorBodyStatements(
    key: MemberedStatementsKey
  ): boolean
  {
    return TypeManagerStatements.#managerRE.test(key.fieldKey);
  }

  getCtorBodyStatements(
    key: MemberedStatementsKey
  ): readonly stringOrWriterFunction[]
  {
    assert(key.fieldType?.kind === StructureKind.PropertySignature);

    const fieldKey = key.fieldKey.match(/^#(.*)Accessors$/)![1];
    this.module.addImports("internal", ["TypeAccessors"], []);

    const callExpression = new CallExpressionStatementImpl({
      name: "TypeAccessors.buildTypeAccessors",
      parameters: [
        "this",
        `"${fieldKey}"`
      ]
    });

    if (this.baseName.startsWith("TypeAliasDeclaration"))
      callExpression.parameters.push(`""`);

    return [
      `// ${fieldKey} is getting lost in ts-morph clone operations\n`,
      `this.#${fieldKey}Accessors = `,
      callExpression.writerFunction
    ];
  }
}
