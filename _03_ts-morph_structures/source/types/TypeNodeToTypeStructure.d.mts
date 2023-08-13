import type {
  Structures,
  TypeNode
} from "ts-morph";

import type {
  TypeStructure
} from "../typeStructures/TypeStructure.mjs";

import type {
  NodeWithStructures
} from "../bootstrap/structureToNodeMap.mts";

export type TypeNodeToTypeStructureConsole = (
  message: string, failingTypeNode: TypeNode
) => void

export type TypeNodeToTypeStructure = (
  typeNode: TypeNode,
  _console: TypeNodeToTypeStructureConsole,
  subStructureResolver: (node: NodeWithStructures) => Structures,
) => TypeStructure | null;
