import assert from "node:assert/strict";
import {
  AST_NODE_TYPES,
  TSESTree,
  simpleTraverse,
} from '@typescript-eslint/typescript-estree';

import {
  NodeToParentMap,
  addNodesToMap,
} from "./NodeToParentMap.js";

export default function extractClassesForProgram(
  ast: TSESTree.Program,
  isBuiltIns?: true
): TSESTree.ClassDeclarationWithName[]
{
  const classList: TSESTree.ClassDeclarationWithName[] = [];

  addNodesToMap(ast);

  simpleTraverse(ast, {
    visitors: {
      ClassDeclaration: function(node) {
        assert(node.type === AST_NODE_TYPES.ClassDeclaration);

        if (node.id) {
          classList.push(node as TSESTree.ClassDeclarationWithName);
        }
      },

      ClassExpression: function(node, parent) {
        node.type = AST_NODE_TYPES.ClassDeclaration;
        assert(node.type === AST_NODE_TYPES.ClassDeclaration);

        if (isBuiltIns && !node.id) {
          const property = NodeToParentMap.get(node) as TSESTree.Property;
          const name = (property.key as TSESTree.Literal).value as string;

          const identifier: TSESTree.Identifier = {
            type: AST_NODE_TYPES.Identifier,
            name,
            typeAnnotation: undefined,
            optional: false,
            decorators: [],
            loc: {
              start: {
                line: 0,
                column: 0
              },
              end: {
                line: 0,
                column: 0
              }
            },
            range: [0, 0],
            parent: node
          }

          node.id = identifier;
          Reflect.deleteProperty(node.id, "parent");

          this.ClassDeclaration(node, parent);
        }
      }
    }
  }, false);

  return classList;
}
