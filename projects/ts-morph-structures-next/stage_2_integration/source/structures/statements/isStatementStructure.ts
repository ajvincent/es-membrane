import type { AugmentedStatementStructures } from "./AugmentedStatements.js";
import { isTSMorphStatementStructure } from "../standard/isStructureOfType.js";
import {
  StatementStructureKind
} from "../../base/StatementStructureKind.js";
import type {
  AugmentedStructures
} from "../../types/AugmentedStructures.js";

export function isStatementStructure(
  structure: AugmentedStructures,
): structure is AugmentedStatementStructures
{
  switch (structure.kind) {
    case StatementStructureKind.UnknownString:
    case StatementStructureKind.UnknownWriter:
      return true;
  }

  return isTSMorphStatementStructure(structure);
}
