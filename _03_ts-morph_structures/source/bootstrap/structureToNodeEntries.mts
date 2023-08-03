import {
  SourceFile,
  Structures,
  Node,
  forEachStructureChild,
  SyntaxKind,
  StructureKind
} from "ts-morph";

import { DefaultMap } from "#stage_utilities/source/DefaultMap.mjs";

import StructureKindToSyntaxKindMap from "../generated/structureToSyntax.mjs";
const knownSyntaxKinds = new Set<SyntaxKind>(StructureKindToSyntaxKindMap.values());

export default class StructureAndNodeData
{
  readonly unusedStructures = new Set<Structures>();
  readonly unusedNodes = new Set<Node>();
  readonly structureToNode = new Map<Structures, Node>;

  readonly #structureSetsByHash = new DefaultMap<string, Structures[]>;
  readonly #nodeSetsByHash = new DefaultMap<string, Node[]>;

  constructor(
    sourceFile: SourceFile
  )
  {
    const sourceStructure = sourceFile.getStructure();
    this.#collectDescendantStructures(sourceStructure);
    this.#collectDescendantNodes(sourceFile);

    this.unusedStructures.forEach(value => this.#mapStructureToNodes(value));

    this.#structureSetsByHash.clear();
    this.#nodeSetsByHash.clear();
  }

  #mapStructureToNodes(
    value: Structures
  ): void
  {
    const structureHash = this.#hashStructure(value);
    const nodeHash = this.#createNodeHashFromStructure(value);
    const candidateStructures = this.#structureSetsByHash.get(structureHash);

    if (!candidateStructures || candidateStructures[0] !== value) {
      return;
    }

    const candidateNodes = this.#nodeSetsByHash.get(nodeHash);
    if (!candidateNodes || candidateNodes.length === 0) {
      return;
    }

    candidateStructures.shift();
    const node = candidateNodes.shift()!;
    this.structureToNode.set(value, node);
    this.unusedStructures.delete(value);
    this.unusedNodes.delete(node);
  }

  readonly #collectDescendantStructures = (
    currentStructure: Structures
  ): void =>
  {
    if (currentStructure.kind !== StructureKind.JSDocTag) {
      const hash = this.#hashStructure(currentStructure);
      const structureSet = this.#structureSetsByHash.getDefault(hash, () => []);
      structureSet.push(currentStructure);
      this.unusedStructures.add(currentStructure);
    }

    forEachStructureChild(currentStructure, this.#collectDescendantStructures);
  }

  readonly #collectDescendantNodes = (
    currentNode: Node
  ): void =>
  {
    if (knownSyntaxKinds.has(currentNode.getKind())) {
      const hash = this.#hashNode(currentNode);
      const nodeSet = this.#nodeSetsByHash.getDefault(hash, () => []);
      nodeSet.push(currentNode);
      this.unusedNodes.add(currentNode);
    }

    currentNode.forEachChild(this.#collectDescendantNodes);
  }

  #hashStructure(
    structure: Structures
  ): string
  {
    let rv: string = structure.kind.toString();
    if ("name" in structure) {
      rv += ":" + structure.name?.toString();
    }
    return rv;
  }

  #createNodeHashFromStructure(
    structure: Structures
  ): string
  {
    let rv: string = StructureKindToSyntaxKindMap.get(structure.kind)!.toString();
    if ("name" in structure)
      rv += ":" + structure.name?.toString();
    return rv;
  }

  #hashNode(
    node: Node
  ): string {
    let rv: string = node.getKind().toString();
    if (Node.isNamed(node) || Node.isNameable(node)) {
      const name = node.getName();
      if (name)
        rv += ":" + name;
    }
    return rv;
  }
}
