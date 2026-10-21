import {
  StructureKind,
} from "ts-morph";

import {
  ArrayTypeStructureImpl,
  LiteralTypeStructureImpl,
  PropertySignatureImpl,
  UnionTypeStructureImpl,
  TypeStructureKind,
} from "#stage_one/snapshot/source/exports.js";

import {
  getStructureNameFromModified
} from "#utilities/source/StructureNameTransforms.js";

import InterfaceModule from "../../moduleClasses/InterfaceModule.js";
import PropertyHashesWithTypes from "../classTools/PropertyHashesWithTypes.js";

export default function addTypeStructures(
  module: InterfaceModule,
): void
{
  const moduleName = getStructureNameFromModified(module.defaultExportName);

  const properties = module.typeMembers.arrayOfKind(StructureKind.PropertySignature);
  for (const property of properties) {
    if (PropertyHashesWithTypes.has(moduleName, property.name) === false)
      continue;

    if (property.typeStructure!.kind === TypeStructureKind.Array) {
      const newProp = new PropertySignatureImpl(property.name + "Sequence");
      newProp.isReadonly = true;
      newProp.typeStructure = new ArrayTypeStructureImpl(LiteralTypeStructureImpl.get("TypeStructures"));
      module.typeMembers.addMembers([newProp]);
      module.addImports("public", [], ["TypeStructures"]);
    }
    else {
      const newProp = new PropertySignatureImpl(property.name + "Structure");
      newProp.typeStructure = new UnionTypeStructureImpl([
        LiteralTypeStructureImpl.get("TypeStructures"),
        LiteralTypeStructureImpl.get("undefined")
      ]);
      module.typeMembers.addMembers([newProp]);
      module.addImports("public", [], ["TypeStructures"]);
    }
  }
}
