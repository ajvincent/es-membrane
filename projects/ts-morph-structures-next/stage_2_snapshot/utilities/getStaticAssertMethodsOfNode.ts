import {
  type ClassDeclaration,
  StructureKind,
} from "ts-morph";

import {
  ClassDeclarationImpl,
  TypeStructureKind,
  type TypeStructures,
  VoidTypeNodeToTypeStructureConsole,
  getTypeAugmentedStructure,
} from "../../dist/exports.js";

import {
  TS_MORPH_D,
} from "#utilities/source/ts-morph-d-file.js";

export function getStaticAssertMethodsOfNode(
  filterMap: ReadonlyMap<string, ClassDeclaration>
): ReadonlyMap<string, string>
{
  // Get the list of methods returning type nodes.
  /* key: name of static method of Node.  value: class name in tS_MORPH_D */
  const staticAssertMethods = new Map<string, string>;
  const nodeClass: ClassDeclarationImpl = getTypeAugmentedStructure(
    TS_MORPH_D.getClassOrThrow("Node"), VoidTypeNodeToTypeStructureConsole, true, StructureKind.Class
  ).rootStructure;

  for (const prop of nodeClass.properties) {
    if (!prop.name.startsWith("is"))
      continue;
    if (!prop.isStatic)
      continue;
    if (prop.typeStructure?.kind !== TypeStructureKind.Function)
      continue;
    const returnType: TypeStructures | undefined = prop.typeStructure.returnType;
    if (!returnType)
      continue;
    if (returnType.kind !== TypeStructureKind.TypePredicate)
      continue;
    const isType = returnType.isType;
    if (isType?.kind !== TypeStructureKind.Literal)
      continue;

    if (!filterMap.has(isType.stringValue))
      continue;
    staticAssertMethods.set(prop.name, isType.stringValue);
  }

  for (const method of nodeClass.methods) {
    if (!method.name.startsWith("is"))
      continue;
    if (!method.isStatic)
      continue;
    const returnType: TypeStructures | undefined = method.returnTypeStructure;
    if (!returnType)
      continue;
    if (returnType.kind !== TypeStructureKind.TypePredicate)
      continue;
    const isType = returnType.isType;
    if (isType?.kind !== TypeStructureKind.Literal)
      continue;

    if (!filterMap.has(isType.stringValue))
      continue;
    staticAssertMethods.set(method.name, isType.stringValue);
  }

  return staticAssertMethods;
}
