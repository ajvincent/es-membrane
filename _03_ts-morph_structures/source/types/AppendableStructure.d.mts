import type {
  Structures,
} from "ts-morph";

import type {
  TypeStructure
} from "../typeStructures/TypeStructure.mjs";

export type AppendContextBase = (
  readonly (Structures | TypeStructure)[] |
  Record<string, readonly (Structures | TypeStructure)[]>
);

export interface AppendableStructure<
  AppendContext extends AppendContextBase
>
{
  appendStructures(structuresContext: AppendContext): this;
}
