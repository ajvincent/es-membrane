// #region preamble
import type {
  Node,
} from "ts-morph";

import type {
  StructureImpls,
} from "../../snapshot/source/exports.js";

import type {
  NodeWithStructures,
} from "./types/conversions.js";

import {
  AugmentedStructureAndNodeData,
  type StatementResolver,
} from "./StructureToNodeData/Augmented.js";

import {
  AugmentedStructures,
} from "../types/AugmentedStructures.js";
// #endregion preamble

interface MapAndRootStructure {
  readonly map: ReadonlyMap<AugmentedStructures, Node>;
  readonly rootStructure: StructureImpls;
}

/**
 * Get structures for a node and its descendants.
 * @param nodeWithStructures - The node.
 * @returns a map of structures to their original nodes.
 * @internal
 */
export function structureImplToNodeMap(
  nodeWithStructures: NodeWithStructures,
  statementResolver: StatementResolver,
): MapAndRootStructure
{
  const data = new AugmentedStructureAndNodeData(nodeWithStructures, statementResolver);
  const rootStructure = data.fill();
  return {
    map: data.augmentedStructureToNodeMap,
    rootStructure
  };
}
