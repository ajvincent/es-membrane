import type { TypeNode } from "ts-morph";

import type { TypeNodeToTypeStructureConsole } from "../exports.js";

export function VoidTypeNodeToTypeStructureConsole(
  message: string,
  failingTypeNode: TypeNode,
): void {
  void message;
  void failingTypeNode;
}
VoidTypeNodeToTypeStructureConsole satisfies TypeNodeToTypeStructureConsole;
