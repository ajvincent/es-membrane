import {
  StructureKind
} from "ts-morph";

import {
  type TypeMembersMap,
  TypeStructureKind,
  PropertySignatureImpl,
  LiteralTypeStructureImpl,
  ArrayTypeStructureImpl,
  UnionTypeStructureImpl,
} from "#stage_two/snapshot/source/exports.js";

import PropertyHashesWithTypes from "./PropertyHashesWithTypes.js";

export default function modifyTypeMembersForTypeStructures(
  baseName: string,
  map: TypeMembersMap
): PropertySignatureImpl[]
{
  if (baseName === "TypeAliasDeclarationStructure") {
    // special case: type can never be undefined
    const typeStructureMember = map.getAsKind(StructureKind.PropertySignature, "typeStructure")!;
    typeStructureMember.typeStructure = LiteralTypeStructureImpl.get("TypeStructures");
  }

  const properties: PropertySignatureImpl[] = [];
  map.arrayOfKind(StructureKind.PropertySignature).forEach(prop => {
    if (defineTypeAccessors(baseName, prop, map))
      properties.push(prop);
  });
  return properties;
}

function defineTypeAccessors(
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
    proxyArray.typeStructure = new ArrayTypeStructureImpl(
      LiteralTypeStructureImpl.get("stringOrWriterFunction")
    );

    map.convertPropertyToAccessors(property.name, true, false);
    map.getAsKind(StructureKind.GetAccessor, property.name)!.leadingTrivia.push(
      "// overridden in constructor"
    );

    map.addMembers([
      shadowArray,
      proxyArray,
    ]);
  }
  else {
    map.convertPropertyToAccessors(property.name + "Structure", true, true);

    const manager = new PropertySignatureImpl(`#${property.name}Accessors`);
    manager.isReadonly = true;
    manager.typeStructure = LiteralTypeStructureImpl.get("TypeAccessors");
    map.addMembers([manager]);

    if (property.hasQuestionToken && property.typeStructure) {
      if (property.typeStructure.kind !== TypeStructureKind.Union) {
        property.typeStructure = new UnionTypeStructureImpl([
          property.typeStructure
        ]);
      }

      const lastType = property.typeStructure.childTypes.at(-1)!;
      if (lastType.kind !== TypeStructureKind.Literal || lastType.stringValue !== "undefined") {
        property.typeStructure.childTypes.push(LiteralTypeStructureImpl.get("undefined"));
      }
    }

    property.leadingTrivia.push("// overridden in constructor");
  }

  return true;
}
