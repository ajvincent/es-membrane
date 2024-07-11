import assert from "node:assert/strict";
import path from "path";

import {
  Scope,
  StructureKind,
} from "ts-morph";

import {
  ClassDeclarationImpl,
  ClassMembersMap,
  type ClassStatementsGetter,
  ClassSupportsStatementsFlags,
  type ClassTailStatementsGetter,
  InterfaceDeclarationImpl,
  LiteralTypeStructureImpl,
  SourceFileImpl,
  MemberedTypeToClass,
  MemberedStatementsKey,
  TypeArgumentedTypeStructureImpl,
  TypeMembersMap,
  TypeParameterDeclarationImpl,
  stringWriterOrStatementImpl,
} from "ts-morph-structures";

import {
  createSourceFileFromStructure,
} from "#stage_utilities/source/getTS_SourceFile.mjs";

import {
  stageDir
} from "./constants.js";

import getProxyHandlerInterface from "./getInterfaces/proxy.js";

export default async function forwardToReflect(): Promise<void> {
  const pathToForwardModule = path.join(stageDir, "generated/ForwardToReflect.ts");

  const proxyInterface: InterfaceDeclarationImpl = getProxyHandlerInterface();
  for (const method of proxyInterface.methods) {
    method.hasQuestionToken = false;
  }

  const typeMembers = TypeMembersMap.fromMemberedObject(proxyInterface);
  const classBuilder = new MemberedTypeToClass();
  classBuilder.importFromTypeMembersMap(false, typeMembers);
  classBuilder.scopeCallback = {
    getScope(isStatic, kind, memberName) {
      return Scope.Public;
    },
  };
  classBuilder.defineStatementsByPurpose("Reflect body", false);

  const mirrorReflectStatements: ClassStatementsGetter & ClassTailStatementsGetter = {
    supportsStatementsFlags: ClassSupportsStatementsFlags.TailStatements,

    keyword: "Forward traps to Reflect",

    filterTailStatements: function (key: MemberedStatementsKey): boolean {
      return true;
    },

    getTailStatements: function (key: MemberedStatementsKey): readonly stringWriterOrStatementImpl[] {
      assert.equal(key.groupType?.kind, StructureKind.MethodSignature, "expected a method");
      const methodArguments: string[] = []
      for (const param of key.groupType.parameters) {
        let arg: string = param.name;
        if (arg === "target") {
          if (key.statementGroupKey === "apply") {
            arg += " as CallableFunction";
          } else if (key.statementGroupKey === "construct") {
            arg += " as NewableFunction";
          }
        }
        methodArguments.push(arg);
      }

      return [
        `return Reflect.${key.statementGroupKey}(${methodArguments.join(", ")});`
      ];
    }
  };
  classBuilder.addStatementGetters(1, [mirrorReflectStatements]);

  const classMembers: ClassMembersMap = classBuilder.buildClassMembersMap();

  const classDecl = new ClassDeclarationImpl();
  classDecl.name = "ForwardToReflect";
  classDecl.isDefaultExport = true;

  {
    const typeParam = new TypeParameterDeclarationImpl("T");
    typeParam.constraintStructure = LiteralTypeStructureImpl.get("object");
    classDecl.typeParameters.push(typeParam);
  }
  classDecl.implementsSet.add(new TypeArgumentedTypeStructureImpl(
    LiteralTypeStructureImpl.get(proxyInterface.name),
    [
      LiteralTypeStructureImpl.get("T")
    ]
  ));

  classMembers.moveMembersToClass(classDecl);

  const sourceStructure = new SourceFileImpl();
  sourceStructure.statements.push(
    classDecl
  );

  await createSourceFileFromStructure(
    pathToForwardModule,
    sourceStructure
  );
}
