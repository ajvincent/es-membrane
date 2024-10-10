import {
  TSESTree
} from "@typescript-eslint/typescript-estree";

import {
  astToSourcePath
} from "./parseSourceFile.js";

import {
  NodeToProgramMap
} from "./NodeToParentMap.js";

export default class ASTNodeError extends Error {
  constructor(message: string, node: TSESTree.Node) {
    const program: TSESTree.Program = NodeToProgramMap.get(node)!;
    const sourcePath: string = astToSourcePath.get(program)!;
    message += `, ${sourcePath}@${node.loc.start.line}:${node.loc.start.column}`
    super(message);
  }
}
