import {
  StructureKind
} from "ts-morph";

import {
  type AccessorMirrorGetter,
  ClassSupportsStatementsFlags,
  type MemberedStatementsKey,
} from "#stage_two/snapshot/source/exports.js";

import PropertyHashesWithTypes from "../../classTools/PropertyHashesWithTypes.js";
import StatementGetterBase from "../GetterBase.js";
import { BaseClassModule } from "#stage_three/generation/moduleClasses/exports.js";

export default
class TypeStructureGetterStatements extends StatementGetterBase
implements AccessorMirrorGetter
{
  constructor(
    module: BaseClassModule,
  )
  {
    super(module, "TypeStructureGetterStatements", ClassSupportsStatementsFlags.AccessorMirror);
  }

  filterAccessorMirror(
    key: MemberedStatementsKey
  ): boolean
  {
    if (key.fieldType?.kind !== StructureKind.GetAccessor)
      return false;
    if (key.fieldKey.endsWith("Structure") === false)
      return false;
    return PropertyHashesWithTypes.has(this.module.baseName, key.fieldKey.replace("Structure", ""));
  }

  getAccessorMirror(
    key: MemberedStatementsKey
  ): string
  {
    this.module.addImports("public", [], ["TypeStructures"]);
    let value = `this.#${key.fieldKey.replace("Structure", "Accessors")}.typeStructure`;
    if (this.module.baseName.startsWith("TypeAliasDeclaration")) {
      // special case: type can never be undefined
      value += "!";
    }
    return value;
  }
}
