import type {
  WriterFunction,
} from "ts-morph";

import type {
  TypeStructure
} from "./TypeStructure.mjs";

export interface TypedNodeTypeStructure
{
  typeStructure: TypeStructure | undefined;
  type: string | WriterFunction | undefined;
}
