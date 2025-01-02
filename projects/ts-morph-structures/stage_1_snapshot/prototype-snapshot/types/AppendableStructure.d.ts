import type {
  Structures,
} from "ts-morph";

import type {
  TypeStructures
} from "../typeStructures/TypeStructures.js";

export type AppendContextBase = (
  Structures |
  TypeStructures |
  readonly (Structures | TypeStructures)[] |
  Partial<Record<string, AppendContextBase>>
);

export interface AppendableStructure<
  AppendContext extends AppendContextBase
>
{
  appendStructures(structuresContext: AppendContext): this;
}
