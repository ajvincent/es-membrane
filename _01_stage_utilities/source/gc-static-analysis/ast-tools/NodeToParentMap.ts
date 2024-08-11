import {
  TSESTree,
  simpleTraverse,
} from '@typescript-eslint/typescript-estree';

const NodeToParentMap_Internal = new WeakMap<TSESTree.Node, TSESTree.Node>;
const NodeToProgramMap_Internal = new WeakMap<TSESTree.Node, TSESTree.Program>;

export const NodeToParentMap: Pick<WeakMap<TSESTree.Node, TSESTree.Node>, "get"> = NodeToParentMap_Internal;
export const NodeToProgramMap: Pick<WeakMap<TSESTree.Node, TSESTree.Program>, "get"> = NodeToProgramMap_Internal;

export function addNodesToMap(ast: TSESTree.Program): void {
  simpleTraverse(ast, {
    enter: function(node, parent): void {
      NodeToProgramMap_Internal.set(node, ast);
      if (parent) {
        NodeToParentMap_Internal.set(node, parent);
      }
    }
  });
}
