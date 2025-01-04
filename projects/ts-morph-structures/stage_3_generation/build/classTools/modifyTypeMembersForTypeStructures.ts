import {
  StructureKind
} from "ts-morph";

import {
  type TypeMembersMap,
  TypeStructureKind,
  PropertySignatureImpl,
} from "#stage_two/snapshot/source/exports.js";

import PropertyHashesWithTypes from "./PropertyHashesWithTypes.js";

export default function modifyTypeMembersForTypeStructures(
  baseName: string,
  map: TypeMembersMap
): PropertySignatureImpl[]
{
  const properties: PropertySignatureImpl[] = [];
  map.arrayOfKind(StructureKind.PropertySignature).forEach(prop => {
    if (convertTypeToAccessors(baseName, prop, map))
      properties.push(prop);
  });
  return properties;
}

function convertTypeToAccessors(
  baseName: string,
  property: PropertySignatureImpl,
  map: TypeMembersMap
): boolean
{
  if (!PropertyHashesWithTypes.has(baseName, property.name))
    return false;

  if (property.typeStructure!.kind === TypeStructureKind.Array) {
    const shadowArray = PropertySignatureImpl.clone(property);
    shadowArray.docs.splice(0);
    shadowArray.name = `#${property.name}_ShadowArray`;

    const proxyArray = PropertySignatureImpl.clone(property);
    proxyArray.name = `#${property.name}ProxyArray`;
    proxyArray.docs.splice(0);
    proxyArray.typeStructure = undefined;

    map.convertPropertyToAccessors(property.name, true, false);

    map.addMembers([
      shadowArray,
      proxyArray,
    ]);
  }
  else {
    map.convertPropertyToAccessors(property.name, true, true);
    map.convertPropertyToAccessors(property.name + "Structure", true, true);

    const manager = new PropertySignatureImpl(`#${property.name}Manager`);
    manager.isReadonly = true;
    map.addMembers([manager]);
  }

  return true;
}
