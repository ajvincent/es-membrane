import StructureDictionaries, {
  type DecoratorParts,
  type StructureParts,
} from "#stage_two/generation/build/StructureDictionaries.js";

import {
  DecoratorImplMeta,
  StructureImplMeta,
} from "#stage_two/generation/build/structureMeta/DataClasses.js";

import type {
  ConstructorDeclarationImpl
} from "#stage_one/prototype-snapshot/exports.js";

import type {
  ClassMemberImpl
} from "../utilities/public/ClassMembersMap.js";

type ClassMemberImplExceptCtor = Exclude<ClassMemberImpl, ConstructorDeclarationImpl>;

export default function sortClassMembers(
  name: string,
  meta: DecoratorImplMeta | StructureImplMeta,
  dictionaries: StructureDictionaries
): void
{
  let parts: DecoratorParts | StructureParts;
  if (meta instanceof DecoratorImplMeta) {
    parts = dictionaries.decoratorParts.get(meta)!;
  } else {
    parts = dictionaries.structureParts.get(meta)!;
  }

  const { classDecl } = parts;
  classDecl.properties.sort(sortMembers);
  classDecl.methods.sort(sortMembers);
  classDecl.getAccessors.sort(sortMembers);
  classDecl.setAccessors.sort(sortMembers);
}

function sortMembers(
  a: Readonly<ClassMemberImplExceptCtor>,
  b: Readonly<ClassMemberImplExceptCtor>
): number
{
  if (a.isStatic && !b.isStatic)
    return -1;
  if (b.isStatic && !a.isStatic)
    return +1;

  if (a.name === "kind")
    return -1;
  if (b.name === "kind")
    return +1;

  return a.name.localeCompare(b.name);
}
