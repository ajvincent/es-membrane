// #region preamble
import {
  LiteralTypedStructure,
  LiteralTypedStructureImpl,
  MemberedObjectTypeStructureImpl,
  PrefixOperatorsTypedStructureImpl,
  PropertySignatureImpl,
  TypeArgumentedTypedStructureImpl,
  TypeAliasDeclarationImpl,
} from "#stage_one/prototype-snapshot/exports.js";

import ImportManager from "#stage_two/generation/build/utilities/public/ImportManager.js";
import StructureDictionaries from "#stage_two/generation/build/StructureDictionaries.js";
import {
  getClassInterfaceName
} from "#utilities/source/StructureNameTransforms.js";

import ConstantTypeStructures from "./ConstantTypeStructures.js";

// #endregion preamble

type FieldsTypeAliasContext = {
  fieldType: TypeAliasDeclarationImpl;
  instanceFieldsArgumented: LiteralTypedStructure;
}

export default function defineFieldsType(
  name: string,
  importManager: ImportManager,
  dictionaries: StructureDictionaries,
): FieldsTypeAliasContext
{
  const alias = new TypeAliasDeclarationImpl(name + "Fields");
  alias.isExported = true;

  const staticFields = new PropertySignatureImpl("staticFields");
  staticFields.typeStructure = ConstantTypeStructures.object;

  const instanceFields = new PropertySignatureImpl("instanceFields");

  const className = getClassInterfaceName(name);
  instanceFields.typeStructure = new LiteralTypedStructureImpl(className);
  importManager.addImports({
    pathToImportedModule: dictionaries.publicExports.absolutePathToExportFile,
    isPackageImport: false,
    importNames: [ className ],
    isDefaultImport: false,
    isTypeOnly: true,
  });

  const symbolKey = new PropertySignatureImpl("symbolKey");
  symbolKey.typeStructure = new PrefixOperatorsTypedStructureImpl(
    ["typeof"], new LiteralTypedStructureImpl(name + "Key")
  );

  alias.typeStructure = new TypeArgumentedTypedStructureImpl(
    ConstantTypeStructures.RightExtendsLeft,
    [
      new TypeArgumentedTypedStructureImpl(
        ConstantTypeStructures.StaticAndInstance,
        [symbolKey.typeStructure]
      ),

      new MemberedObjectTypeStructureImpl([
        staticFields,
        instanceFields,
        symbolKey,
      ])
    ]
  );

  return {
    fieldType: alias,
    instanceFieldsArgumented: instanceFields.typeStructure
  }
}
