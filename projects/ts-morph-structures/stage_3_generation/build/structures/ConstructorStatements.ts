import assert from "node:assert/strict";

import {
  StructureKind
} from "ts-morph";

import {
  ClassSupportsStatementsFlags,
  type ConstructorBodyStatementsGetter,
  type ConstructorHeadStatementsGetter,
  LiteralTypeStructureImpl,
  MemberedStatementsKey,
  ParameterDeclarationImpl,
  TypeStructureKind,
  type stringWriterOrStatementImpl
} from "#stage_two/snapshot/source/exports.js";

import {
  StructureModule
} from "../../moduleClasses/exports.js";

import StatementGetterBase from "../fieldStatements/GetterBase.js";

export default
class ConstructorStatements extends StatementGetterBase
implements ConstructorHeadStatementsGetter, ConstructorBodyStatementsGetter
{
  protected readonly module: StructureModule;
  readonly #constructorParameters: ParameterDeclarationImpl[];

  constructor(
    module: StructureModule,
    constructorParameters: ParameterDeclarationImpl[]
  )
  {
    super(
      module,
      "ConstructorStatements",
      ClassSupportsStatementsFlags.ConstructorHeadStatements |
      ClassSupportsStatementsFlags.ConstructorBodyStatements
    );
    this.module = module;
    this.#constructorParameters = constructorParameters;
  }

  filterCtorHeadStatements(key: MemberedStatementsKey): boolean {
    void(key);
    return true;
  }
  getCtorHeadStatements(key: MemberedStatementsKey): readonly stringWriterOrStatementImpl[] {
    void(key);
    return [`super();`];
  }

  filterCtorBodyStatements(key: MemberedStatementsKey): boolean {
    if (key.isFieldStatic === true)
      return false;
    if (key.fieldKey.startsWith("#") || key.fieldKey === "kind" || key.fieldKey.endsWith("Set"))
      return false;

    if (!key.fieldType)
      return true;

    if (key.fieldType.kind !== StructureKind.PropertySignature)
      return false;
    if (key.fieldType.typeStructure?.kind === TypeStructureKind.Array)
      return false;
    if (key.fieldType.typeStructure === LiteralTypeStructureImpl.get("boolean"))
      return false;
    return key.fieldType.hasQuestionToken === false;
  }

  getCtorBodyStatements(key: MemberedStatementsKey): readonly stringWriterOrStatementImpl[] {
    let { fieldType } = key;
    if (!fieldType) {
      fieldType = this.module.getFlatTypeMembers().getAsKind(
        StructureKind.PropertySignature,
        key.fieldKey
      );
    }

    assert.equal(fieldType?.kind, StructureKind.PropertySignature);
    const param = new ParameterDeclarationImpl(fieldType.name);
    param.typeStructure = fieldType.typeStructure;
    this.#constructorParameters.push(param);

    return [`this.${fieldType.name} = ${fieldType.name};`];
  }
}
