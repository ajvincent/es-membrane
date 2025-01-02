// #region preamble
import {
  Structures
} from "ts-morph";

import structureToNodeMap, {
  type NodeWithStructures
} from "./structureToNodeMap.js";

import buildTypesForStructures, {
  type BuildTypesForStructureFailures
} from "./buildTypesForStructures.js";

import convertTypeNode from "./convertTypeNode.js";

import type {
  TypeNodeToTypeStructureConsole
} from "../types/TypeNodeToTypeStructure.js";
// #endregion preamble

export interface RootStructureWithConvertFailures {
  rootStructure: Structures;
  rootNode: NodeWithStructures;
  failures: readonly BuildTypesForStructureFailures[];
}

export type { TypeNodeToTypeStructureConsole };

/**
 * Get a structure for a node, with type structures installed throughout its descendants.
 * @param rootNode - The node to start from.
 * @param userConsole - a callback for conversion failures.
 * @returns the root structure, the root node, and any failures during recursion.
 */
export default function getTypeAugmentedStructure(
  rootNode: NodeWithStructures,
  userConsole: TypeNodeToTypeStructureConsole,
): RootStructureWithConvertFailures
{
  const map = structureToNodeMap(rootNode, true);
  if (map.size === 0)
    throw new Error("assertion failure, we should have some structures");

  let rootStructure: Structures | undefined;
  for (const [structure, node] of map.entries()) {
    if (node === rootNode) {
      rootStructure = structure;
      break;
    }
  }
  if (!rootStructure) {
    throw new Error("assertion failure, we should have a root structure");
  }

  const subFailures: BuildTypesForStructureFailures[] = [];

  const failures = buildTypesForStructures(
    map,
    userConsole,
    nodeWithStructure => {
      const subStructureResults = getTypeAugmentedStructure(nodeWithStructure, userConsole);
      subFailures.push(...subStructureResults.failures);
      return subStructureResults.rootStructure;
    },
    convertTypeNode
  ).concat(subFailures);

  return {
    rootStructure,
    rootNode,
    failures,
  }
}
