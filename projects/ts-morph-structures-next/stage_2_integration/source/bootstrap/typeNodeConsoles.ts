import type {
  Node
} from "ts-morph";

import type {
  NodeToStructureConsole
} from "../../snapshot/source/exports.js";

export function VoidNodeToStructureConsole(
  message: string,
  failingNode: Node,
): void
{
  void message;
  void failingNode;
}
VoidNodeToStructureConsole satisfies NodeToStructureConsole;
