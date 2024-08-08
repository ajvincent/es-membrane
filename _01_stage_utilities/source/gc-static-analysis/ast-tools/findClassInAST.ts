import {
  TSESTree,
  simpleTraverse,
} from "@typescript-eslint/typescript-estree";

import assert from "node:assert/strict";

export default function findClassInAST(
  ast: TSESTree.Program,
  className: string,
): TSESTree.ClassDeclaration | undefined
{
  let classAST: TSESTree.ClassDeclarationWithName | undefined;
  simpleTraverse(ast, {
    visitors: {
      ClassDeclaration: function(node) {
        assert.equal(node.type, "ClassDeclaration", "Should've gotten a class declaration");
        if (node.id?.name === className) {
          classAST = node as TSESTree.ClassDeclarationWithName;
        }
      }
    }
  }, false);

  return classAST;
}
