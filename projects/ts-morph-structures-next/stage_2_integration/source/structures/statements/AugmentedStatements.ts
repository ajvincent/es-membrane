import type {
  StatementStructureImpls
} from "../../types/StructureImplUnions.js";

import type { UnknownStringStatementImpl } from "./UnknownStringStatementImpl.js";
import type { UnknownWriterStatementImpl } from "./UnknownWriterStatementImpl.js";

export type AugmentedStatementStructures = StatementStructureImpls |
  UnknownStringStatementImpl |
  UnknownWriterStatementImpl |
  never;
