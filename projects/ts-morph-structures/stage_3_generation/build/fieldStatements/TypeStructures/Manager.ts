import {
  ClassSupportsStatementsFlags,
  type MemberedStatementsKey,
  type PropertyInitializerGetter,
  type stringWriterOrStatementImpl,
} from "#stage_two/snapshot/source/exports.js";

import {
  BaseClassModule
} from "#stage_three/generation/moduleClasses/exports.js";

import StatementGetterBase from "../GetterBase.js";

export default
class TypeManagerStatements extends StatementGetterBase
implements PropertyInitializerGetter
{
  static readonly #managerRE = /^#(.*)Manager$/;

  constructor(
    module: BaseClassModule,
  )
  {
    super(module, "TypeManagerStatements", ClassSupportsStatementsFlags.PropertyInitializer);
  }

  filterPropertyInitializer(
    key: MemberedStatementsKey
  ): boolean
  {
    return TypeManagerStatements.#managerRE.test(key.fieldKey);
  }

  getPropertyInitializer(
    key: MemberedStatementsKey
  ): stringWriterOrStatementImpl
  {
    void(key);
    this.module.addImports("internal", ["TypeAccessors"], []);
    return `new TypeAccessors()`;
  }
}
