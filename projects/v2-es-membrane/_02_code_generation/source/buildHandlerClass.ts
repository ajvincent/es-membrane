import {
  Scope,
} from "ts-morph";

import {
  ClassDeclarationImpl,
  ClassMembersMap,
  type ClassStatementsGetter,
  ClassSupportsStatementsFlags,
  type ClassTailStatementsGetter,
  type InterfaceDeclarationImpl,
  MemberedTypeToClass,
  type MemberedStatementsKey,
  TypeMembersMap,
  type stringWriterOrStatementImpl,
} from "ts-morph-structures";

export default function buildHandlerClass(
  ifc: InterfaceDeclarationImpl,
  getTailStatements: (
    key: MemberedStatementsKey
  ) => readonly stringWriterOrStatementImpl[],
  augmenter?: (classBuilder: MemberedTypeToClass) => void
): ClassDeclarationImpl
{
  const typeMembers = TypeMembersMap.fromMemberedObject(ifc);
  const classBuilder = new MemberedTypeToClass();
  classBuilder.importFromTypeMembersMap(false, typeMembers);
  classBuilder.scopeCallback = {
    getScope(isStatic, kind, memberName) {
      return Scope.Public;
    },
  };
  classBuilder.defineStatementsByPurpose("body", false);

  const mirrorReflectStatements: ClassStatementsGetter & ClassTailStatementsGetter = {
    supportsStatementsFlags: ClassSupportsStatementsFlags.TailStatements,

    keyword: "body",

    filterTailStatements: function (key: MemberedStatementsKey): boolean {
      return true;
    },

    getTailStatements
  };

  classBuilder.addStatementGetters(
    ClassBuilder_Priorities.ProxyTraps, [mirrorReflectStatements]
  );

  if (augmenter) {
    augmenter(classBuilder);
  }

  const classMembers: ClassMembersMap = classBuilder.buildClassMembersMap();

  const classDecl = new ClassDeclarationImpl();
  classMembers.moveMembersToClass(classDecl);
  return classDecl;
}

export enum ClassBuilder_Priorities {
  Initialization = 1,
  ProxyTraps = 20,
}
