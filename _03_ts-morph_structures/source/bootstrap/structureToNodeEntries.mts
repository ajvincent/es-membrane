import {
  Structures,
  Node,
  forEachStructureChild,
  SyntaxKind,
  StructureKind,
  ClassDeclaration,
  JSDocableNode,
  JSDoc,
} from "ts-morph";

import { DefaultMap } from "#stage_utilities/source/DefaultMap.mjs";

import StructureKindToSyntaxKindMap from "../generated/structureToSyntax.mjs";
const knownSyntaxKinds = new Set<SyntaxKind>(StructureKindToSyntaxKindMap.values());

export type NodeWithStructures = Node & {
  getStructure(): Structures;
};

export default function structureToNodeMap(
  nodeWithStructures: NodeWithStructures,
): Map<Structures, Node>
{
  return (new StructureAndNodeData(nodeWithStructures)).structureToNodeMap;
}

class StructureAndNodeData
{
  readonly structureToNodeMap = new Map<Structures, Node>;

  #rootNode: NodeWithStructures | null;
  #rootStructure: Structures | null = null;

  readonly #unusedStructures = new Set<Structures>();
  readonly #unusedNodes = new Set<Node>();

  readonly #hashToStructureMap = new Map<string, Structures>;
  readonly #structureToHash = new Map<Structures, string>;
  readonly #structureToParent = new Map<Structures, Structures>;

  readonly #nodeSetsByHash = new DefaultMap<string, Node[]>;
  readonly #nodeToHash = new Map<Node, string>;

  #hashCounter = new DefaultMap<string, number>;
  #appendCounterPostfix(hash: string): string {
    const count = this.#hashCounter.getDefault(hash, () => 0) + 1;
    this.#hashCounter.set(hash, count);
    return hash + "#" + count;
  }

  constructor(
    nodeWithStructures: NodeWithStructures
  )
  {
    this.#rootNode = nodeWithStructures;
    this.#collectDescendantNodes(this.#rootNode, "");

    this.#rootStructure = this.#rootNode.getStructure();
    this.#collectDescendantStructures(this.#rootStructure, "");

    this.#unusedStructures.forEach(value => this.#mapStructureToNodes(value));
    if (this.#unusedStructures.size > 0) {
      throw new Error("assert failure, we should've resolved every structure");
    }

    this.#cleanup();
  }

  #cleanup(): void {
    this.#rootNode = null;
    this.#rootStructure = null;
    this.#unusedNodes.clear();
    this.#unusedStructures.clear();
    this.#hashToStructureMap.clear();
    this.#structureToHash.clear();
    this.#structureToParent.clear();
    this.#nodeSetsByHash.clear();
    this.#nodeToHash.clear();
    this.#hashCounter.clear();
  }

  readonly #collectDescendantNodes = (
    node: Node,
    hash: string,
  ): void =>
  {
    if ((Node.isStatement(node)) && (
      Node.isFunctionLikeDeclaration(node.getParent()) ||
      false
    )) {
      // ts-morph's .getStructures() wil return most statements as strings, since the AST has no structures for most statements.
      // So I'm not going to add a `statementStructures` property at this time... just bail out.
      return;
    }

    const kind: SyntaxKind = node.getKind();
    if (knownSyntaxKinds.has(kind)) {
      hash += "/" + this.#hashNode(node);
      this.#nodeToHash.set(node, hash);

      const nodeSet = this.#nodeSetsByHash.getDefault(hash, () => []);
      nodeSet.push(node);
      this.#unusedNodes.add(node);
      this.#nodeToHash.set(node, hash);
    }

    switch (kind) {
      case SyntaxKind.ClassDeclaration:
        this.#collectClassFields(node.asKindOrThrow(SyntaxKind.ClassDeclaration), hash);
        this.#collectJSDocableNodes(node.asKindOrThrow(SyntaxKind.ClassDeclaration), hash);
        break;

      case SyntaxKind.FunctionDeclaration:
        this.#collectJSDocableNodes(node.asKindOrThrow(SyntaxKind.FunctionDeclaration), hash);
        break;

      case SyntaxKind.MethodSignature:
        this.#collectJSDocableNodes(node.asKindOrThrow(SyntaxKind.MethodSignature), hash);
        break;
    }

    node.forEachChild(child => this.#collectDescendantNodes(child, hash));
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
    this.#unusedStructures.add(structure);

    forEachStructureChild(structure, child => {
      this.#structureToParent.set(child, structure);
      this.#collectDescendantStructures(child, hash);
    });
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

  #collectJSDocableNodes(
    node: JSDocableNode,
    hash: string
  ): void
  {
    const childNodes: JSDoc[] = node.getJsDocs();
    childNodes.forEach(child => this.#collectDescendantNodes(child, hash));
  }

  #mapStructureToNodes(
    structure: Structures
  ): void
  {
    const structureHash = this.#hashStructure(structure);
    const nodeHash = this.#createNodeHashFromStructure(structure);

    let parentStructure: Structures | null = null;
    let parentNode: Node | null = null;
    let parentNodeHash = "";
    if (structure !== this.#rootStructure) {
      parentStructure = this.#structureToParent.get(structure)!;
      if (!parentStructure) {
        throw new Error("assert failure, no parent structure");
      }

      parentNode = this.structureToNodeMap.get(parentStructure) ?? null;
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
      const sourceFile = this.#rootNode!.getSourceFile();
      let parentMsg = "";
      if (parentNode) {
        parentMsg = `, parent at ${
          JSON.stringify(sourceFile.getLineAndColumnAtPos(parentNode.getPos()))
        }`
      }
      throw new Error(
        `Expected candidate node to exist, structureHash = "${
          structureHash
        }", nodeHash = "${
          nodeHash
        }"${parentMsg}`);
    }

    const node = candidateNodes.shift()!;
    this.structureToNodeMap.set(structure, node);
    this.#hashToStructureMap.delete(structureHash);
    this.#unusedStructures.delete(structure);
    this.#unusedNodes.delete(node);
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
      hash = this.#appendCounterPostfix(hash);
    }

    return hash;
  }

  #createNodeHashFromStructure(
    structure: Structures
  ): string
  {
    let parentHash = "";
    if (structure !== this.#rootStructure) {
      const parentStructure = this.#structureToParent.get(structure)!;
      const parentNode = this.structureToNodeMap.get(parentStructure)!;
      const parentHashTemp = this.#nodeToHash.get(parentNode);
      if (parentHashTemp === undefined) {
        throw new Error("assert failure, no parent hash");
      }
      parentHash = parentHashTemp;
    }

    let localKind = SyntaxKind[StructureKindToSyntaxKindMap.get(structure.kind)!];
    if (localKind === "JSDocComment")
      localKind = "JSDoc";
    if (localKind === "FirstStatement")
      localKind = "VariableStatement";

    let hash: string = parentHash + "/" + localKind;
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
      if (
        Node.isNamed(node) ||
        Node.isNameable(node) ||
        Node.isPropertyNamed(node) ||
        Node.isBindingNamed(node) ||
        Node.isImportSpecifier(node) ||
        Node.isExportSpecifier(node) ||
        false
      )
      {
        const name = node.getName();
        if (name)
          hash += ":" + name;
      }
    }

    return hash;
  }
}
