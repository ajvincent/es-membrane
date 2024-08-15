import assert from "node:assert/strict";

import {
  TSESTree,
} from '@typescript-eslint/typescript-estree';

import {
  DefaultMap
} from '#stage_utilities/source/collections/DefaultMap.js';
import getDefinedClassAST from './getDefinedClassAST.js';

export interface AST_ClassMembers {
  PropertyDefinitions: Map<string | symbol, TSESTree.PropertyDefinition>,
  GetterDefinitions: Map<string | symbol, TSESTree.MethodDefinition>,
  SetterDefinitions: Map<string | symbol, TSESTree.MethodDefinition>,
  MethodDefinitions: Map<string | symbol, TSESTree.MethodDefinition>,
  ConstructorDefinition?: TSESTree.MethodDefinition,
  StaticBlocks: Set<TSESTree.StaticBlock>,

  superMethod: Map<TSESTree.MethodDefinition, TSESTree.MethodDefinition>,
  superProperty: Map<TSESTree.PropertyDefinition, TSESTree.PropertyDefinition>,
};

const extendsClassDependencies = new DefaultMap<string, Promise<AST_ClassMembers>>;

export default
function organizeClassMembers(
  classAST: TSESTree.ClassDeclarationWithName
): Promise<AST_ClassMembers>
{
  return extendsClassDependencies.getDefault(
    classAST.id.name,
    () => organizeClassMembers_Internal(classAST)
  );
}

async function organizeClassMembers_Internal(
  classAST: TSESTree.ClassDeclaration
): Promise<AST_ClassMembers>
{
  const members: AST_ClassMembers = {
    PropertyDefinitions: new Map,
    GetterDefinitions: new Map,
    SetterDefinitions: new Map,
    MethodDefinitions: new Map,
    ConstructorDefinition: undefined,
    StaticBlocks: new Set,

    superMethod: new Map,
    superProperty: new Map,
  }

  for (const member of classAST.body.body) {
    switch (member.type) {
      case "PropertyDefinition": {
        let name = (member.key as TSESTree.Identifier).name;
        if ((member.key as TSESTree.Identifier | TSESTree.PrivateIdentifier).type === "PrivateIdentifier")
          name = "#" + name;
        members.PropertyDefinitions.set(name, member);
        continue;
      }
      case "MethodDefinition": {
        let name = (member.key as TSESTree.Identifier).name;
        if ((member.key as TSESTree.Identifier | TSESTree.PrivateIdentifier).type === "PrivateIdentifier")
          name = "#" + name;
        members.MethodDefinitions.set(name, member);
        continue;
      }
      case "StaticBlock":
        members.StaticBlocks.add(member);
        continue;
    }
  }

  if (classAST.superClass) {
    assert(classAST.superClass.type === "Identifier");
    const superMembers: AST_ClassMembers = await organizeClassMembers(
      getDefinedClassAST(classAST.superClass.name)
    );

    superMembers.MethodDefinitions.forEach(superMethod => {
      let name = (superMethod.key as TSESTree.Identifier).name;
      const selfMethod = members.MethodDefinitions.get(name);
      if (selfMethod) {
        members.superMethod.set(selfMethod, superMethod);
      }
      else {
        members.MethodDefinitions.set(name, superMethod);
      }
    });

    superMembers.PropertyDefinitions.forEach(superProperty => {
      let name = (superProperty.key as TSESTree.Identifier).name;
      const selfProperty = members.PropertyDefinitions.get(name);
      if (selfProperty) {
        members.superProperty.set(selfProperty, superProperty);
      } else {
        members.PropertyDefinitions.set(name, superProperty);
      }
    });
  }

  return members;
}
