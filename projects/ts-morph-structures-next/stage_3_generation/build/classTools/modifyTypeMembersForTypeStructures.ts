import {
  StructureKind
} from "ts-morph";

import {
  type TypeMembersMap,
  TypeStructureKind,
  PropertySignatureImpl,
  LiteralTypeStructureImpl,
  UnionTypeStructureImpl,
} from "#stage_two/snapshot/source/exports.js";

import {
  StructureModule
} from "#stage_three/generation/moduleClasses/StructureModule.js";

import type DecoratorModule from "#stage_three/generation/moduleClasses/DecoratorModule.js";

import PropertyHashesWithTypes from "./PropertyHashesWithTypes.js";

export default function modifyTypeMembersForTypeStructures(
  module: StructureModule | DecoratorModule,
  baseName: string,
  map: TypeMembersMap
): PropertySignatureImpl[]
{
  if (module instanceof StructureModule && module.modifiers?.modifyTypeMembersForTypeStructures) {
    module.modifiers.modifyTypeMembersForTypeStructures(module, baseName, map);
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

  // arrays we take care of in addTypeStructureSequence
  if (property.typeStructure!.kind === TypeStructureKind.Array) {
    return false;
  }
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

  return true;
}
