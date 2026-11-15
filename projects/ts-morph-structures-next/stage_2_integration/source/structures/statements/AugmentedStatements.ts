import type {
  StatementStructureImpls,
  TSMorphStatementedStructureImpls,
} from "../../types/StructureImplUnions.js";

import type { UnknownStringStatementImpl } from "./UnknownStringStatementImpl.js";
import type { UnknownWriterStatementImpl } from "./UnknownWriterStatementImpl.js";

export type AugmentedStatementStructures =
  UnknownStringStatementImpl |
  UnknownWriterStatementImpl |
  StatementStructureImpls;

export type AugmentedStatementedStructures =
  TSMorphStatementedStructureImpls;
