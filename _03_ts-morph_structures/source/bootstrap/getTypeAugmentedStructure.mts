// #region preamble
import {
  Structures
} from "ts-morph";

import structureToNodeMap, {
  type NodeWithStructures
} from "./structureToNodeMap.mjs";

import buildTypesForStructures, {
  type BuildTypesForStructureFailures
} from "./buildTypesForStructures.mjs";

import convertTypeNode from "./convertTypeNode.mjs";

import type {
  TypeNodeToTypeStructureConsole
} from "../types/TypeNodeToTypeStructure.mjs";
// #endregion preamble

export interface RootStructureWithConvertFailures {
  rootStructure: Structures;
  rootNode: NodeWithStructures;
  failures: readonly BuildTypesForStructureFailures[];
}

export type { TypeNodeToTypeStructureConsole };

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

  const failures = buildTypesForStructures(
    map,
    userConsole,
    nodeWithStructure => {
      const subStructureResults = getTypeAugmentedStructure(nodeWithStructure, userConsole);
      failures.push(...subStructureResults.failures);
      return subStructureResults.rootStructure;
    },
    convertTypeNode
  );

  return {
    rootStructure,
    rootNode,
    failures,
  }
}
