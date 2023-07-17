import type {
  TypedNodeStructure
} from "ts-morph";

import type {
  TypeStructure
} from "./TypeStructure.mjs";

export interface TypedNodeTypeStructure extends TypedNodeStructure
{
  typeStructure: TypeStructure | undefined;
}
