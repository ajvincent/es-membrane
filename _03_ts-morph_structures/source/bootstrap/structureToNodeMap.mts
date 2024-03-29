// #region preamble
import {
  Structures,
  Node,
  forEachStructureChild,
  SyntaxKind,
  StructureKind,
  ClassDeclaration,
  JSDocableNode,
  JSDoc,
  FunctionDeclarationOverloadStructure,
} from "ts-morph";

import StructureKindToSyntaxKindMap from "../generated/structureToSyntax.mjs";

import {
  StructuresClassesMap
} from "../../exports.mjs"
// #endregion preamble

const knownSyntaxKinds = new Set<SyntaxKind>(StructureKindToSyntaxKindMap.values());

export interface NodeWithStructures extends Node {
  getStructure(): Structures;
}

/**
 * Get structures for a node and its descendants.
 * @param nodeWithStructures - The node.
 * @returns a map of structures to their original nodes.
 */
export default function structureToNodeMap(
  nodeWithStructures: NodeWithStructures,
  useTypeAwareStructures: boolean,
): Map<Structures, Node>
{
  return (new StructureAndNodeData(
    nodeWithStructures,
    useTypeAwareStructures
  )).structureToNodeMap;
}

/**
 * @internal
 *
 * Iterate over descendant nodes, then over descendant structures, and finally map each structure to a node.
 *
 * @remarks
 *
 * Here's how this works:
 *
 * 1. Each node gets an almost unique hash.  I store the node and hash in `#nodeSetsByHash`.
 * 2. Each structure gets an unique hash.  I store the structure's has in `#structureToHash`.
 * 3. From each structure, I compute an equivalent node hash.  Then I look up the hash in `#nodeSetsByHash`
 *    and pull the first node from the resulting set, as a match.
 *
 * That said, this code is fragile.  There are nuances to structure and node traversals which I
 * have had to find via debugging, and I only have my tests to make sure it is correct.  Changes to either
 * TypeScript or ts-morph could break this easily.
 *
 * Hashes I generate are internal to this class, so if I need to change the hash, I can.
 */
class StructureAndNodeData
{
  readonly structureToNodeMap = new Map<Structures, Node>;

  // #region private fields, and life-cycle.

  #rootNode: NodeWithStructures | null;
  #rootStructure: Structures | null = null;

  /** The structures we haven't matched yet,  This must be empty at the end of the run. */
  readonly #unusedStructures = new Set<Structures>;

  /** The root node and its descendants. */
  readonly #unusedNodes = new Set<Node>;

  readonly #hashToStructureMap = new Map<string, Structures>;
  readonly #structureToHash = new Map<Structures, string>;
  readonly #structureToParent = new Map<Structures, Structures>;

  readonly #nodeSetsByHash = new Map<string, Set<Node>>;
  readonly #nodeToHash = new Map<Node, string>;

  #hashCounter = new Map<string, number>;

  #appendCounterPostfix(hash: string): string {
    let count = this.#hashCounter.get(hash) ?? 0;
    this.#hashCounter.set(hash, ++count);
    return hash + "#" + count;
  }

  constructor(
    nodeWithStructures: NodeWithStructures,
    useTypeAwareStructures: boolean
  )
  {
    this.#rootNode = nodeWithStructures;
    this.#collectDescendantNodes(this.#rootNode, "");

    this.#rootStructure = this.#rootNode.getStructure();
    if (useTypeAwareStructures)
      this.#rootStructure = StructuresClassesMap.get(this.#rootStructure.kind)!.clone(this.#rootStructure);

    this.#collectDescendantStructures(this.#rootStructure, "");

    this.#unusedStructures.forEach(value => this.#mapStructureToNode(value));
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

  // #endregion private fields, and life-cycle.

  // #region node traversal

  /**
   * Generate a hash for each child, and call this function for each child node.
   * @param node - the node we are visiting.
   * @param hash - the parent node's hash.
   *
   * @remarks
   * Each node's hash will be the parent hash, then a slash, then the return from `this.#hashNodeLocal()`.
   */
  readonly #collectDescendantNodes = (
    node: Node,
    hash: string,
  ): void =>
  {
    const kind: SyntaxKind = node.getKind();

    // Build the node hash, and register the node.
    if (knownSyntaxKinds.has(kind)) {
      hash += "/" + this.#hashNodeLocal(node);
      this.#nodeToHash.set(node, hash);

      if (!this.#nodeSetsByHash.has(hash)) {
        this.#nodeSetsByHash.set(hash, new Set);
      }
      const nodeSet = this.#nodeSetsByHash.get(hash)!;

      nodeSet.add(node);
      this.#unusedNodes.add(node);
      this.#nodeToHash.set(node, hash);
    }

    // Visit child nodes, recursively, with the resolved hash.
    if (Node.isJSDocable(node)) {
      this.#collectJSDocableNodes(node, hash);
    }

    switch (kind) {
      case SyntaxKind.ClassDeclaration: {
        const nodeAsClass = node.asKindOrThrow(SyntaxKind.ClassDeclaration);
        this.#collectClassFields(nodeAsClass, hash);
        break;
      }
    }

    node.forEachChild(child => this.#collectDescendantNodes(child, hash));
  }

  /**
   * Get the hash for a node's local part (meaning without parent hashing).
   *
   * @param node - the node to hash.
   * @returns the hash part for this node.
   *
   * @remarks
   * The current format is `${node.getKindName}:${node.getName()}(/overload)?`
   */
  #hashNodeLocal(
    node: Node
  ): string
  {
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
        Node.isDecorator(node) ||
        Node.isModuleDeclaration(node) ||
        false
      )
      {
        const name = node.getName();
        if (name)
          hash += ":" + name;
      }

      /* TypeScript has every overloadable as sibling nodes, and instances of the same class.
       * ConstructorDeclaration (overload 1),
       * ConstructorDeclaration (overload 2),
       * ConstructorDeclaration (not an overload)
       *
       * ts-morph structures have the overloads as child structures of the non-overload structure.
       * ConstructorDeclarationStructure (not an overload)
       *   ConstructorDeclarationOverloadStructure (overload 1)
       *   ConstructorDeclarationOverloadStructure (overload 2)
       *
       * The hashes have to reflect this pattern.
       */
      if (hash && Node.isOverloadable(node) && node.isOverload()) {
        hash += "/overload";
      }
    }

    return hash;
  }

  #collectClassFields(
    node: ClassDeclaration,
    hash: string
  ): void
  {
    const childNodes: Node[] = [
      // .getMembers() visits nodes we will otherwise visit later.
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

  // #endregion node traversal

  // #region structure traversal

  /**
   * Generate a hash for each structure, and call this function for each child structure.
   *
   * @param structure - the structure we are visiting.
   * @param hash - the parent structure's hash.
   *
   * @remarks
   * Each structure's hash will be the parent hash, then a slash, then the return from `this.#hashStructureLocal()`.
   * Structure hashes are unique.
   */
  #collectDescendantStructures(
    structure: Structures,
    hash: string,
  ): void
  {
    if (structure.kind === StructureKind.JSDocTag)
      return;

    hash += "/" + this.#hashStructureLocal(structure);
    this.#structureToHash.set(structure, hash);

    this.#hashToStructureMap.set(hash, structure);
    this.#unusedStructures.add(structure);

    /* forEachStructureChild hits function overloads before the function implementation.
     * The overloads appear on the function structure's overloads property.
     * So, I defer them to a later recursion loop.
     */
    forEachStructureChild(structure, child => {
      if (child.kind === StructureKind.FunctionOverload)
        return;
      this.#structureToParent.set(child, structure);
      this.#collectDescendantStructures(child, hash);
    });

    if ((structure.kind === StructureKind.Function) && (structure.overloads?.length)) {
      structure.overloads.forEach(child => {
        const overloadStructure = child as FunctionDeclarationOverloadStructure;
        overloadStructure.kind = StructureKind.FunctionOverload;

        this.#structureToParent.set(overloadStructure, structure);
        this.#collectDescendantStructures(overloadStructure, hash);
      });
    }
  }

  /**
   * Get the hash for a structure.
   * @param structure - the structure to hash.
   * @returns the hash part for this structure.
   *
   * @remarks
   * The current format is `${StructureKind[structure.kind]}:${structure.name}#${number}}`.
   */
  #hashStructureLocal(
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

  // #endregion structure traversal

  // #region structure-to-node

  #mapStructureToNode(
    structure: Structures
  ): void
  {
    const structureHash = this.#hashStructureLocal(structure);
    const nodeHash = this.#createNodeHashFromStructure(structure);

    let parentStructure: Structures | null = null;

    // these are outside the statement block for debugging purposes.
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
    if (!candidateNodes || candidateNodes.size === 0) {
      /* We didn't match the structure to an existing node.  Probable causes of failure:
      1. iterating over the nodes, we hit the target node with a different parent node than we expected.  `#collectDescendantNodes()`
      2. Iterating over the structures, we hit the target structure with a different parent structure. `#collectDescendantStructures()`.
      3. The node hash from the structure is wrong.  `#createNodeHashFromStructure()`.
      */

      let parentMsg = "";
      if (parentNode) {
        const sourceFile = this.#rootNode!.getSourceFile();

        parentMsg = `, parent at ${
          JSON.stringify(sourceFile.getLineAndColumnAtPos(parentNode.getPos()))
        }`;
      }
      throw new Error(
        `Expected candidate node to exist, structureHash = "${
          structureHash
        }", nodeHash = "${
          nodeHash
        }"${parentMsg}`);
    }

    // First-in, first-out set, so map the first node and exit.
    for (const node of candidateNodes) {
      this.structureToNodeMap.set(structure, node);
      this.#hashToStructureMap.delete(structureHash);
      this.#unusedStructures.delete(structure);
      this.#unusedNodes.delete(node);
      candidateNodes.delete(node);
      break;
    }
  }

  /**
   * Create a node hash for a structure, equivalent to the original node's hash.
   *
   * @param structure - the structure to hash
   * @returns a candidate node hash.
   */
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
    // Sometimes TypeScript assigned the same syntax kind number to multiple strings ihe SyntaxKind enum...
    if (localKind === "JSDocComment")
      localKind = "JSDoc";
    if (localKind === "FirstStatement")
      localKind = "VariableStatement";

    if (StructureKind[structure.kind].endsWith("Overload")) {
      localKind = "overload";
    }

    let hash: string = parentHash + "/" + localKind;
    if ("name" in structure)
      hash += ":" + structure.name?.toString();
    return hash;
  }

  // #endregion structure-to-node
}
