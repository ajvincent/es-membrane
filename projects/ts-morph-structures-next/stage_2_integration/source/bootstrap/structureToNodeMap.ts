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
  AugmentedStructureAndNodeData
} from "./StructureToNodeData/Augmented.js";
// #endregion preamble

/**
 * Get structures for a node and its descendants.
 * @param nodeWithStructures - The node.
 * @returns a map of structures to their original nodes.
 * @internal
 */
export function structureImplToNodeMap(
  nodeWithStructures: NodeWithStructures,
): ReadonlyMap<StructureImpls, Node>
{
  return (new AugmentedStructureAndNodeData(
    nodeWithStructures,
  )).structureToNodeMap;
}
