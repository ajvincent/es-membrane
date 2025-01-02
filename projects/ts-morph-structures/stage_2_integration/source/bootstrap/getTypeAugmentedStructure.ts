// #region preamble
import assert from "node:assert/strict";

import {
  Node,
  type StructureKind
} from "ts-morph";

import type {
  StructureImpls,
} from "../../snapshot/source/exports.js";

import {
  StructureKindToSyntaxKindMap
} from "../../snapshot/source/internal-exports.js";

import {
  structureImplToNodeMap
} from "./structureToNodeMap.js";

import buildTypesForStructures from "./buildTypesForStructures.js";

import convertTypeNode from "./convertTypeNode.js";

import type {
  BuildTypesForStructureFailures,
  NodeWithStructures,
  RootStructureWithConvertFailures,
  TypeNodeToTypeStructureConsole,
} from "./types/conversions.js";
// #endregion preamble

export type {
  TypeNodeToTypeStructureConsole
};

/**
 * Get a structure for a node, with type structures installed throughout its descendants.
 * @param rootNode - The node to start from.
 * @param userConsole - a callback for conversion failures.
 * @param assertNoFailures - if true, assert there are no conversion failures.
 * @returns the root structure, the root node, and any failures during recursion.
 */
function getTypeAugmentedStructure(
  rootNode: NodeWithStructures,
  userConsole: TypeNodeToTypeStructureConsole,
  assertNoFailures: boolean,
): RootStructureWithConvertFailures;

/**
 * Get a structure for a node, with type structures installed throughout its descendants.
 * @param rootNode - The node to start from.
 * @param userConsole - a callback for conversion failures.
 * @param assertNoFailures - if true, assert there are no conversion failures.
 * @param kind - the expected structure kind to retrieve.
 * @returns the root structure, the root node, and any failures during recursion.
 */
function getTypeAugmentedStructure<TKind extends StructureKind>(
  rootNode: NodeWithStructures,
  userConsole: TypeNodeToTypeStructureConsole,
  assertNoFailures: boolean,
  kind: TKind
): RootStructureWithConvertFailures<TKind>;
function getTypeAugmentedStructure(
  rootNode: NodeWithStructures,
  userConsole: TypeNodeToTypeStructureConsole,
  assertNoFailures: boolean,
  kind?: StructureKind
): RootStructureWithConvertFailures
{
  if ((kind !== undefined) && (StructureKindToSyntaxKindMap.get(kind) !== rootNode.getKind())) {
    throw new Error("Root node kind does not match!");
  }

  const map: ReadonlyMap<StructureImpls, Node> = structureImplToNodeMap(rootNode);
  assert(map.size > 0, "we should have some structures");

  let rootStructure: StructureImpls | undefined;
  for (const [structure, node] of map.entries()) {
    if (node === rootNode) {
      rootStructure = structure;
      break;
    }
  }
  assert(rootStructure, "we should have a root structure");

  const subFailures: BuildTypesForStructureFailures[] = [];

  const failures = buildTypesForStructures(
    map,
    userConsole,
    (nodeWithStructure: NodeWithStructures): StructureImpls => {
      const subStructureResults: RootStructureWithConvertFailures = getTypeAugmentedStructure(
        nodeWithStructure, userConsole, false
      );
      subFailures.push(...subStructureResults.failures);
      return subStructureResults.rootStructure;
    },
    convertTypeNode
  );
  failures.push(...subFailures);

  if (assertNoFailures) {
    assert(failures.length === 0, "caller required no failures, but we did fail");
  }

  if (kind !== undefined) {
    assert.equal(rootStructure.kind, kind, "we didn't return the structure kind we were supposed to?");
  }

  return {
    rootStructure,
    failures,
  }
}

export default getTypeAugmentedStructure;
