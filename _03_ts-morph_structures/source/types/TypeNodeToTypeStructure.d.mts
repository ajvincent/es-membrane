import type {
  TypeNode
} from "ts-morph";

import type {
  TypeStructure
} from "../typeStructures/TypeStructure.mjs";

export type TypeNodeToTypeStructure = (
  typeNode: TypeNode,
  _console: ((message: string) => void) | undefined = undefined
) => TypeStructure | null;
