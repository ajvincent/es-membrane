import type {
  DecoratorModuleModifierTraps
} from "../../../types/DecoratorModuleModifierTraps.js";

import { StatementedNodeSpecialCases } from "./StatementedNode.js";
import { TypedNodeSpecialCases } from "./TypedNode.js";

export const DecoratorModifiersMap: ReadonlyMap<string, DecoratorModuleModifierTraps> = new Map([
  ["StatementedNodeStructureMixin", StatementedNodeSpecialCases],
  ["ReturnTypedNodeStructureMixin", TypedNodeSpecialCases],
  ["TypedNodeStructureMixin", TypedNodeSpecialCases],
]);
