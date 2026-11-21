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
  return isTSMorphStatementedStructure(structure);
}
