// #region preamble
import assert from "node:assert/strict";

import { Node } from "ts-morph";

import type {
  KindedStructure,
  Statement,
  Structure,
  StructureKind,
} from "ts-morph";

import StructureClassesMap from "../../base/StructureClassesMap.js";

import type { AugmentedStatementStructures } from "../../structures/statements/AugmentedStatements.js";

import { isStatementedStructure } from "../../structures/statements/isStatementedStructure.js";

import type {
  StructureImpls,
  StatementStructureImpls,
  TSMorphStatementedStructureImpls,
} from "../../types/StructureImplUnions.js";

import type { stringOrWriterFunction } from "../../types/stringOrWriterFunction.js";

import type { NodeWithStructures } from "../types/conversions.js";

import { BaseStructureAndNodeData } from "./Base.js";
// #endregion preamble

export class AugmentedStructureAndNodeData extends BaseStructureAndNodeData {
  declare protected rootStructure: StructureImpls | null;

  declare readonly structureToNodeMap: Map<StructureImpls, Node>;
  readonly augmentedStructureToNodeMap: Map<
    AugmentedStatementStructures | StructureImpls,
    Node
  >;
  readonly #unresolvedStatementIndices: Map<
    TSMorphStatementedStructureImpls,
    readonly number[]
  > = new Map();

  constructor(nodeWithStructures: NodeWithStructures) {
    super(nodeWithStructures);
    this.augmentedStructureToNodeMap = this.structureToNodeMap;
  }

  public fill(): StructureImpls {
    return super.fill() as StructureImpls;
  }

  protected upgradeRootStructure(rootStructure: Structure): StructureImpls {
    return StructureClassesMap.get(
      (rootStructure as KindedStructure<StructureKind>).kind,
    )!.clone(rootStructure);
  }

  protected collectDescendantStructures(
    structure: StructureImpls,
    hash: string,
  ): void {
    super.collectDescendantStructures(structure, hash);

    if (isStatementedStructure(structure)) {
      const unresolvedIndices: number[] = [];
      for (let index = 0; index < structure.statements.length; index++) {
        const statement: stringOrWriterFunction | StatementStructureImpls =
          structure.statements[index];
        if (typeof statement === "string") {
          unresolvedIndices.push(index);
        }
      }

      if (unresolvedIndices.length) {
        this.#unresolvedStatementIndices.set(structure, unresolvedIndices);
      }
    }
  }

  protected mapStructureToNode(structure: StructureImpls): void {
    super.mapStructureToNode(structure);

    if (isStatementedStructure(structure)) {
      const unresolvedIndices: readonly number[] | undefined =
        this.#unresolvedStatementIndices.get(structure);
      if (!unresolvedIndices) return;

      const { statementsSequence } = structure;

      const statementedNode = this.augmentedStructureToNodeMap.get(structure);
      assert(Node.isStatemented(statementedNode));

      const statementNodes: readonly Statement[] =
        statementedNode.getStatements();

      for (const index of unresolvedIndices) {
        const statementStructure: AugmentedStatementStructures =
          statementsSequence[index];
        const statementNode: Statement = statementNodes[index];
        this.augmentedStructureToNodeMap.set(statementStructure, statementNode);
      }

      this.#unresolvedStatementIndices.delete(structure);
    }
  }
}
