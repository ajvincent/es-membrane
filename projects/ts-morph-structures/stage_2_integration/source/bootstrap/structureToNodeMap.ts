// #region preamble
import assert from "node:assert/strict";

import {
  type ClassDeclaration,
  type FunctionDeclarationOverloadStructure,
  type JSDocableNode,
  type JSDoc,
  type Structures,
  Node,
  StructureKind,
  SyntaxKind,
  forEachStructureChild,
} from "ts-morph";

import {
  type StructureImpls,
} from "../../snapshot/source/exports.js";

import {
  StructureClassesMap,
  StructureKindToSyntaxKindMap,
} from "../../snapshot/source/internal-exports.js";

import type {
  NodeWithStructures,
} from "./types/conversions.js";

import {
  fixFunctionOverloads,
  getOverloadIndex,
} from "./adjustForOverloads.js";
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
  return structureToNodeMap(nodeWithStructures, true) as ReadonlyMap<StructureImpls, Node>;
}

/**
 * Get structures for a node and its descendants.
 * @param nodeWithStructures - The node.
 * @param useTypeAwareStructures - true if we should use the StructureImpls.
 * @param hashNeedle - A string to search for among hashes for nodes and structures.  Generates console logs.
 * @returns a map of structures to their original nodes.
 * @internal
 */
export function structureToNodeMap(
  nodeWithStructures: NodeWithStructures,
  useTypeAwareStructures: boolean,
  hashNeedle?: string
): ReadonlyMap<Structures, Node>
{
  return (new StructureAndNodeData(
    nodeWithStructures,
    useTypeAwareStructures,
    hashNeedle
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
 * 2. Each structure gets an unique hash.  I store the structure's hash in `#structureToHash`.
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
  static #knownSyntaxKinds?: ReadonlySet<SyntaxKind>;

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
    useTypeAwareStructures: boolean,
    hashNeedle?: string,
  )
  {
    this.#rootNode = nodeWithStructures;
    if (!StructureAndNodeData.#knownSyntaxKinds) {
      StructureAndNodeData.#knownSyntaxKinds = new Set<SyntaxKind>(StructureKindToSyntaxKindMap.values());
    }

    this.#collectDescendantNodes(this.#rootNode, "");

    if (hashNeedle) {
      this.#nodeSetsByHash.forEach((nodeSet, hash) => {
        if (hash.includes(hashNeedle))
          console.log("nodeSet: ", hash, Array.from(nodeSet));
      });
    }

    this.#rootStructure = this.#rootNode.getStructure();
    fixFunctionOverloads(this.#rootStructure);

    if (useTypeAwareStructures)
      this.#rootStructure = StructureClassesMap.get(this.#rootStructure.kind)!.clone(this.#rootStructure);

    this.#collectDescendantStructures(this.#rootStructure, "");
    if (hashNeedle) {
      this.#structureToHash.forEach((hash, structure) => {
        if (hash.includes(hashNeedle)) {
          console.log("structure hash: ", hash, structure);
        }
      })
    }

    this.#unusedStructures.forEach(value => this.#mapStructureToNode(value));
    assert(this.#unusedStructures.size === 0, "we should've resolved every structure");

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
    if (StructureAndNodeData.#knownSyntaxKinds!.has(kind) && (this.#nodeToHash.has(node) === false)) {
      const localHash = this.#hashNodeLocal(node);
      assert(localHash, "this.#hashNodeLocal() must return a non-empty string");

      hash += "/" + localHash;
      assert.doesNotMatch(localHash, /^\//, "local hash part must not start with a slash: " + localHash);
      this.#nodeToHash.set(node, hash);

      if (!this.#nodeSetsByHash.has(hash)) {
        this.#nodeSetsByHash.set(hash, new Set);
      }
      const nodeSet = this.#nodeSetsByHash.get(hash)!;

      nodeSet.add(node);
      this.#unusedNodes.add(node);
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
   * The current format is `${node.getKindName}:${node.getName()}(/overload:1)?`
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
       *
       * node.isOverload() lies to us for type definition files.
       */
      if (hash && Node.isOverloadable(node)) {
        let overloadIndex = NaN;
        if (Node.isConstructorDeclaration(node) || Node.isMethodDeclaration(node) || Node.isFunctionDeclaration(node)) {
          overloadIndex = getOverloadIndex(node);
        } else {
          assert(false, "what kind of node is this? " + node.getStartLineNumber() + ":" + node.getStartLinePos());
        }
        if (overloadIndex > -1) {
          hash += "/overload:" + overloadIndex;
        }
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
    assert(
      nodeHash.includes("//") === false,
      "node hash must not contain two consecutive slashes: " + nodeHash
    );

    let parentStructure: Structures | null = null;

    // these are outside the statement block for debugging purposes.
    let parentNode: Node | null = null;
    let parentNodeHash = "";
    if (structure !== this.#rootStructure) {
      parentStructure = this.#structureToParent.get(structure)!;
      assert(parentStructure, "must have a parent structure");

      parentNode = this.structureToNodeMap.get(parentStructure) ?? null;
      assert(parentNode, "must find a parent node");

      parentNodeHash = this.#nodeToHash.get(parentNode)!;
      assert(parentNodeHash, "must find a hash for a parent node");
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
      const sourceFile = this.#rootNode!.getSourceFile();
      if (parentNode) {
        const { line, column } = sourceFile.getLineAndColumnAtPos(parentNode.getPos());
        parentMsg = `, parent at ${sourceFile.getFilePath()} line ${line} column ${column}`;
      } else {
        parentMsg = `, at ${sourceFile.getFilePath()}`;
      }
      assert(false,
        `Expected candidate node to exist, structureHash = "${
          structureHash
        }", nodeHash = "${
          nodeHash
        }"${parentMsg}`
      );
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
    let parentStructure: Structures | undefined;
    if (structure !== this.#rootStructure) {
      parentStructure = this.#structureToParent.get(structure)!;
      const parentNode = this.structureToNodeMap.get(parentStructure)!;
      const parentHashTemp = this.#nodeToHash.get(parentNode);
      assert(parentHashTemp !== undefined, "must have a parent hash");
      parentHash = parentHashTemp;
    }

    let localKind = SyntaxKind[StructureKindToSyntaxKindMap.get(structure.kind)!];
    // Sometimes TypeScript assigned the same syntax kind number to multiple strings in the SyntaxKind enum...
    if (localKind === "JSDocComment")
      localKind = "JSDoc";
    if (localKind === "FirstStatement")
      localKind = "VariableStatement";

    if (StructureKind[structure.kind].endsWith("Overload")) {
      assert(
        parentStructure && "overloads" in parentStructure && Array.isArray(parentStructure.overloads),
        "must find the overload index in the parent structure"
      );
      localKind = "overload:" + (parentStructure.overloads as Structures[]).indexOf(structure);
    }

    let hash: string = parentHash + "/" + localKind;
    if ("name" in structure)
      hash += ":" + structure.name?.toString();
    return hash;
  }

  // #endregion structure-to-node
}
