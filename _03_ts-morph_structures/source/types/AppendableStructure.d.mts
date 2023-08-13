import type {
  Structures,
} from "ts-morph";

import type {
  TypeStructures
} from "../typeStructures/TypeStructures.mjs";

export type AppendContextBase = (
  readonly (Structures | TypeStructures)[] |
  Record<string, readonly (Structures | TypeStructures)[]>
);

export interface AppendableStructure<
  AppendContext extends AppendContextBase
>
{
  appendStructures(structuresContext: AppendContext): this;
}
