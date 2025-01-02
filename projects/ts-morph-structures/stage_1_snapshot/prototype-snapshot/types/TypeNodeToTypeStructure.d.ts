import type {
  Structures,
  TypeNode
} from "ts-morph";

import type {
  TypeStructures
} from "../typeStructures/TypeStructures.js";

import type {
  NodeWithStructures
} from "../bootstrap/structureToNodeMap.js";

/**
 * @param message - The failure message.
 * @param failingTypeNode - the type node we failed to resolve.
 */
export type TypeNodeToTypeStructureConsole = (
  message: string,
  failingTypeNode: TypeNode,
) => void

/**
 * @param typeNode - the type node we are examining.
 * @param _console - a callback for when we fail to resolve a type node.
 * @param subStructureResolver - when we discover a node with its own structures to investigate.
 * @returns a type structure, or null if we failed to resolve the type node.
 */
export type TypeNodeToTypeStructure = (
  typeNode: TypeNode,
  _console: TypeNodeToTypeStructureConsole,
  subStructureResolver: (node: NodeWithStructures) => Structures,
) => TypeStructures | null;
