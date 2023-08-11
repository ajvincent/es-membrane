import type {
  TypeNode
} from "ts-morph";

import type {
  TypeStructure
} from "../typeStructures/TypeStructure.mjs";

export type TypeNodeToTypeStructureConsole = (
  message: string, failingTypeNode: TypeNode
) => void

export type TypeNodeToTypeStructure = (
  typeNode: TypeNode,
  _console: TypeNodeToTypeStructureConsole
) => TypeStructure | null;
