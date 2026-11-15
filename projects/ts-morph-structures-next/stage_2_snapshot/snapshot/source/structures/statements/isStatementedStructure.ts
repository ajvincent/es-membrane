import type { AugmentedStatementedStructures } from "./AugmentedStatements.js";
import { isTSMorphStatementedStructure } from "../standard/isStructureOfType.js";
/*
import {
  StatementStructureKind
} from "../../base/StatementStructureKind.js";
*/
import type { AugmentedStructures } from "../../types/AugmentedStructures.js";

export function isStatementedStructure(
  structure: AugmentedStructures,
): structure is AugmentedStatementedStructures {
  /*
  switch (structure.kind) {
    case StatementStructureKind.UnknownString:
    case StatementStructureKind.UnknownWriter:
      return true;
  }
  */

  return isTSMorphStatementedStructure(structure);
}
