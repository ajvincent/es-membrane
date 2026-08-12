// #region preamble
import {
  type ClassBodyStatementsGetter,
  ClassSupportsStatementsFlags,
  type ConstructorBodyStatementsGetter,
  LiteralTypeStructureImpl,
  type MemberedStatementsKey,
  ParameterDeclarationImpl,
  type PropertyInitializerGetter,
  type stringWriterOrStatementImpl,
} from "#stage_two/snapshot/source/exports.js";

import type {
  BaseClassModule,
} from "../../../moduleClasses/exports.js";
import StatementGetterBase from "../../fieldStatements/GetterBase.js";
// #endregion preamble

export default class IsStatic_Constructor extends StatementGetterBase
implements ClassBodyStatementsGetter, ConstructorBodyStatementsGetter, PropertyInitializerGetter
{
  readonly #ctorParameters: ParameterDeclarationImpl[];

  constructor(
    module: BaseClassModule,
    ctorParameters: ParameterDeclarationImpl[],
  )
  {
    super(
      module,
      "IsStatic_Constructor",
      ClassSupportsStatementsFlags.BodyStatements |
      ClassSupportsStatementsFlags.ConstructorBodyStatements |
      ClassSupportsStatementsFlags.PropertyInitializer
    );
    this.#ctorParameters = ctorParameters;
  }

  filterBodyStatements(key: MemberedStatementsKey): boolean {
    return this.#isStatic_Key(key) && key.statementGroupKey !== "toJSON";
  }

  getBodyStatements(key: MemberedStatementsKey): readonly stringWriterOrStatementImpl[] {
    void(key);
    return [];
  }

  filterCtorBodyStatements(key: MemberedStatementsKey): boolean {
    return this.#isStatic_Key(key);
  }

  getCtorBodyStatements(key: MemberedStatementsKey): readonly stringWriterOrStatementImpl[] {
    void(key);
    const ctorParam = new ParameterDeclarationImpl("isStatic");
    ctorParam.typeStructure = LiteralTypeStructureImpl.get("boolean");
    this.#ctorParameters.unshift(ctorParam);

    return [`this.isStatic = isStatic;`];
  }

  filterPropertyInitializer(key: MemberedStatementsKey): boolean {
    return this.#isStatic_Key(key);
  }

  getPropertyInitializer(key: MemberedStatementsKey): undefined {
    void(key);
    return undefined;
  }

  #isStatic_Key(key: MemberedStatementsKey): boolean {
    return (!key.isFieldStatic && key.fieldKey === "isStatic");
  }
}
