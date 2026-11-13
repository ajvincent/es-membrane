import type {
  StructureImpls
} from "./StructureImplUnions.d.ts";

import type {
  AugmentedStatementStructures
} from "../structures/statements/AugmentedStatements.ts";

import type {
  TypeStructures
} from "../structures/type/TypeStructures.ts";

export type AugmentedStructures = StructureImpls | TypeStructures | AugmentedStatementStructures;
