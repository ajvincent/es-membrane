import type {
  StatementStructureImpls,
  stringOrWriterFunction,
} from "../../exports.js";

export interface StatementedNodeStructureClassIfc {
  readonly statements: (StatementStructureImpls | stringOrWriterFunction)[];
}
