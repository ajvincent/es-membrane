import type {
  StructureImpls
} from "./StructureImplUnions.d.ts";

import type {
  TypeStructures
} from "../structures/type/TypeStructures.ts";

export type AugmentedStructures = StructureImpls | TypeStructures;
