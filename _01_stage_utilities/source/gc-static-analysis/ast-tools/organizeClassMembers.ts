import {
  TSESTree,
} from '@typescript-eslint/typescript-estree';

export interface AST_ClassMembers {
  PropertyDefinitions: Map<string | symbol, TSESTree.PropertyDefinition>,
  GetterDefinitions: Map<string | symbol, TSESTree.MethodDefinition>,
  SetterDefinitions: Map<string | symbol, TSESTree.MethodDefinition>,
  MethodDefinitions: Map<string | symbol, TSESTree.MethodDefinition>,
  ConstructorDefinition?: TSESTree.MethodDefinition,
  StaticBlocks: Set<TSESTree.StaticBlock>,

  superMethod: WeakMap<TSESTree.MethodDefinition, TSESTree.MethodDefinition>,
  superProperty: WeakMap<TSESTree.PropertyDefinition, TSESTree.PropertyDefinition>,
};

export default function organizeClassMembers(
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

    superMethod: new WeakMap,
    superProperty: new WeakMap,
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

  return Promise.resolve(members);
}
