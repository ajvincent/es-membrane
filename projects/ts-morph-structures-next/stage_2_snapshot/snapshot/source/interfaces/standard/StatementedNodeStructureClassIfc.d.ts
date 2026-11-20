import type {
  StatementStructureImpls,
  stringOrWriterFunction,
} from "../../exports.js";
import type { AugmentedStatementStructures } from "../../structures/statements/AugmentedStatements.js";

export interface StatementedNodeStructureClassIfc {
  readonly statements: (StatementStructureImpls | stringOrWriterFunction)[];
  readonly statementsSequence: AugmentedStatementStructures[];
}
