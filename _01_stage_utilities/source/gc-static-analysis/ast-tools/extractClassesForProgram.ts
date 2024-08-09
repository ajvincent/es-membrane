import {
  TSESTree,
  simpleTraverse,
} from '@typescript-eslint/typescript-estree';

export default function extractClassesForProgram(
  ast: TSESTree.Program,
): TSESTree.ClassDeclarationWithName[]
{
  const classList: TSESTree.ClassDeclarationWithName[] = [];

  // setParentPointers: true will pay off later in finding where nodes have references.
  simpleTraverse(ast, {
    visitors: {
      ClassDeclaration: function(node) {
        if ((node.type === "ClassDeclaration") && node.id) {
          classList.push(node as TSESTree.ClassDeclarationWithName);
        }
      }
    }
  }, true);

  return classList;
}
