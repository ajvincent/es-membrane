import {
  TSESTree,
  simpleTraverse,
} from '@typescript-eslint/typescript-estree';

export default function extractClassesForProgram(
  ast: TSESTree.Program,
): TSESTree.ClassDeclarationWithName[]
{
  const classList: TSESTree.ClassDeclarationWithName[] = [];

  simpleTraverse(ast, {
    visitors: {
      ClassDeclaration: function(node) {
        if ((node.type === "ClassDeclaration") && node.id) {
          classList.push(node as TSESTree.ClassDeclarationWithName);
        }
      }
    }
  }, false);

  return classList;
}
