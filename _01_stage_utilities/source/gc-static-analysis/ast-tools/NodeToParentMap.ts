import {
  TSESTree,
  simpleTraverse,
} from '@typescript-eslint/typescript-estree';

const NodeToParentMap_Internal = new WeakMap<TSESTree.Node, TSESTree.Node>;

export const NodeToParentMap: Pick<WeakMap<TSESTree.Node, TSESTree.Node>, "get"> = NodeToParentMap_Internal;

export function addNodesToMap(ast: TSESTree.Program): void {
  simpleTraverse(ast, {
    enter: function(node, parent): void {
      if (parent) {
        NodeToParentMap_Internal.set(node, parent);
      }
    }
  });
}
