import type {
  ClassMemberImpl,
  ClassDeclarationImpl,
  ConstructorDeclarationImpl,
} from "#stage_two/snapshot/source/exports.js";

type ClassMemberImplExceptCtor = Exclude<ClassMemberImpl, ConstructorDeclarationImpl>;

export default function sortClassMembers(
  classDecl: ClassDeclarationImpl
): void
{
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
