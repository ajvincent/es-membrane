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

import PropertyHashesWithTypes from "../../classTools/PropertyHashesWithTypes.js";
import StatementGetterBase from "../GetterBase.js";
import BaseClassModule from "#stage_three/generation/moduleClasses/BaseClassModule.js";

export default
class TypeStructureSetStatements extends StatementGetterBase
implements PropertyInitializerGetter
{
  constructor(
    module: BaseClassModule,
  )
  {
    super(module, "TypeArrayStatements", ClassSupportsStatementsFlags.PropertyInitializer);
  }

  filterPropertyInitializer(
    key: MemberedStatementsKey
  ): boolean
  {
    if (key.fieldType?.kind !== StructureKind.PropertySignature)
      return false;
    if (key.isFieldStatic === true)
      return false;
    if (!key.fieldType.name.endsWith("Set")) {
      return false;
    }
    const propName = key.fieldType.name.replace(/Set$/, "");
    return PropertyHashesWithTypes.has(this.module.baseName, propName);
  }

  getPropertyInitializer(
    key: MemberedStatementsKey
  ): stringWriterOrStatementImpl
  {
    assert(key.fieldType?.kind === StructureKind.PropertySignature);
    const propBase: string = key.fieldType.name.replace(/Set$/, "");

    this.module.addImports("public", [], ["TypeStructureSet"]);
    this.module.addImports("internal", ["TypeStructureSetInternal"], []);
    return new CallExpressionStatementImpl({
      name: "new TypeStructureSetInternal",
      parameters: [
        `this.#${propBase}_ShadowArray`
      ]
    }).writerFunction;
  }
}
