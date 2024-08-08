import {
  TSESTree,
} from '@typescript-eslint/typescript-estree';

import * as Acorn from "acorn";
import * as AcornWalkers from "acorn-walk";

// type.startsWith("TS") is a good test for TypeScript-unique types
const IgnoreTSNodes_Base: AcornWalkers.RecursiveVisitors<any> = {
  ...AcornWalkers.base
};
for (const key in TSESTree.AST_NODE_TYPES) {
  if (key.startsWith("TS"))
    (IgnoreTSNodes_Base as Record<string, any>)[key] = () => {};
}

export default function extractClassesForProgram(
  ast: TSESTree.Program,
): TSESTree.ClassDeclarationWithName[]
{
  const classList: TSESTree.ClassDeclarationWithName[] = [];

  AcornWalkers.simple(ast as unknown as Acorn.Program, {
    ClassDeclaration: function(node: Acorn.ClassDeclaration | Acorn.AnonymousClassDeclaration): void {
      if ((node.type === "ClassDeclaration") && node.id) {
        classList.push(node as unknown as TSESTree.ClassDeclarationWithName);
      }
    }
  }, IgnoreTSNodes_Base)

  return classList;
}
