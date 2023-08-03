import {
  SourceFile,
  Structures,
  Node,
  forEachStructureChild,
  SyntaxKind,
  StructureKind,
  ClassDeclaration
} from "ts-morph";

import { DefaultMap } from "#stage_utilities/source/DefaultMap.mjs";

import StructureKindToSyntaxKindMap from "../generated/structureToSyntax.mjs";
const knownSyntaxKinds = new Set<SyntaxKind>(StructureKindToSyntaxKindMap.values());

export default class StructureAndNodeData
{
  static #hashCounter = new DefaultMap<string, number>;
  static #appendCounterPostfix(hash: string): string {
    const count = this.#hashCounter.getDefault(hash, () => 0) + 1;
    this.#hashCounter.set(hash, count);
    return hash + "#" + count;
  }

  readonly unusedStructures = new Set<Structures>();
  readonly unusedNodes = new Set<Node>();
  readonly structureToNode = new Map<Structures, Node>;

  readonly #hashToStructureMap = new Map<string, Structures>;
  readonly #structureToHash = new WeakMap<Structures, string>;
  readonly #structureToParent = new WeakMap<Structures, Structures>;

  readonly #nodeSetsByHash = new DefaultMap<string, Node[]>;
  readonly #nodeToHash = new WeakMap<Node, string>;

  constructor(
    sourceFile: SourceFile
  )
  {
    const sourceStructure = sourceFile.getStructure();
    this.#collectDescendantStructures(sourceStructure, "");
    this.#collectDescendantNodes(sourceFile, "");

    this.unusedStructures.forEach(value => this.#mapStructureToNodes(value));

    this.#hashToStructureMap.clear();
    this.#nodeSetsByHash.clear();
  }

  #collectDescendantStructures(
    structure: Structures,
    hash: string,
  ): void
  {
    if (structure.kind === StructureKind.JSDocTag)
      return;

    hash += "/" + this.#hashStructure(structure);
    this.#structureToHash.set(structure, hash);

    this.#hashToStructureMap.set(hash, structure);
    this.unusedStructures.add(structure);

    forEachStructureChild(structure, child => {
      this.#structureToParent.set(child, structure);
      this.#collectDescendantStructures(child, hash);
    });
  }

  readonly #collectDescendantNodes = (
    node: Node,
    hash: string,
  ): void =>
  {
    const kind: SyntaxKind = node.getKind();
    if (knownSyntaxKinds.has(kind)) {
      hash += "/" + this.#hashNode(node);
      this.#nodeToHash.set(node, hash);

      const nodeSet = this.#nodeSetsByHash.getDefault(hash, () => []);
      nodeSet.push(node);
      this.unusedNodes.add(node);
      this.#nodeToHash.set(node, hash);
    }

    switch (kind) {
      case SyntaxKind.ClassDeclaration:
        this.#collectClassFields(node.asKindOrThrow(SyntaxKind.ClassDeclaration), hash);
        break;
    }

    node.forEachChild(child => this.#collectDescendantNodes(child, hash));
  }

  #collectClassFields(
    node: ClassDeclaration,
    hash: string
  ): void
  {
    const childNodes: Node[] = [
      ...node.getProperties(),
    ];
    childNodes.forEach(child => this.#collectDescendantNodes(child, hash));
  }

  #mapStructureToNodes(
    structure: Structures
  ): void
  {
    /*
    switch (structure.kind) {
    }
    */

    return this.#mapStructureToNodes_default(structure);
  }

  #mapStructureToNodes_default(
    structure: Structures
  ): void
  {
    const structureHash = this.#hashStructure(structure);
    const nodeHash = this.#createNodeHashFromStructure(structure);

    let parentStructure: Structures | null = null;
    let parentNode: Node | null = null;
    let parentNodeHash = "";
    if (structure.kind !== StructureKind.SourceFile) {
      parentStructure = this.#structureToParent.get(structure)!;
      if (!parentStructure) {
        throw new Error("assert failure, no parent structure");
      }

      parentNode = this.structureToNode.get(parentStructure) ?? null;
      if (!parentNode)
        throw new Error("assert failure, parent node not found");

      parentNodeHash = this.#nodeToHash.get(parentNode)!;
      if (!parentNodeHash)
        throw new Error("assert failure, parent node hash not found");
    }

    void(parentNode);
    void(parentNodeHash);

    const candidateNodes = this.#nodeSetsByHash.get(nodeHash);
    if (!candidateNodes || candidateNodes.length === 0) {
      throw new Error("Expected candidate node to exist, structureHash = " + structureHash + ", nodeHash = " + nodeHash);
    }

    const node = candidateNodes.shift()!;
    this.structureToNode.set(structure, node);
    this.#hashToStructureMap.delete(structureHash);
    this.unusedStructures.delete(structure);
    this.unusedNodes.delete(node);
  }

  #hashStructure(
    structure: Structures
  ): string
  {
    let hash = this.#structureToHash.get(structure) ?? "";
    if (!hash) {
      hash = StructureKind[structure.kind];
      if ("name" in structure) {
        hash += ":" + structure.name?.toString();
      }
      hash = StructureAndNodeData.#appendCounterPostfix(hash);
    }

    return hash;
  }

  #createNodeHashFromStructure(
    structure: Structures
  ): string
  {
    let parentHash = "";
    if (structure.kind !== StructureKind.SourceFile) {
      const parentStructure = this.#structureToParent.get(structure)!;
      const parentNode = this.structureToNode.get(parentStructure)!;
      parentHash = this.#nodeToHash.get(parentNode)!;
    }

    let hash: string = parentHash + "/" + SyntaxKind[StructureKindToSyntaxKindMap.get(structure.kind)!];
    if ("name" in structure)
      hash += ":" + structure.name?.toString();
    return hash;
  }

  #hashNode(
    node: Node
  ): string {
    let hash = this.#nodeToHash.get(node) ?? "";
    if (!hash) {
      hash = node.getKindName().toString();
      if (Node.isNamed(node) || Node.isNameable(node) || Node.isPropertyNamed(node)) {
        const name = node.getName();
        if (name)
          hash += ":" + name;
      }

      //hash = StructureAndNodeData.#appendCounterPostfix(hash);
    }

    return hash;
  }
}
