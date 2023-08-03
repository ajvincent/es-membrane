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

export default function buildStructureToNodeEntries(
  sourceFile: SourceFile
): StructureAndNodeData
{
  const sourceStructure = sourceFile.getStructure();
  const data = new StructureAndNodeData;

  collectDescendantStructures(data, sourceStructure);
  collectDescendantNodes(data, sourceFile);

  data.unusedStructures.forEach((value: Structures) => {
    const structureHash = hashStructure(value);
    const nodeHash = createNodeHashFromStructure(value);
    const candidateStructures = data.structureSetsByHash.get(structureHash);

    if (!candidateStructures || candidateStructures[0] !== value) {
      return;
    }

    const candidateNodes = data.nodeSetsByHash.get(nodeHash);
    if (!candidateNodes || candidateNodes.length === 0) {
      return;
    }

    candidateStructures.shift();
    const node = candidateNodes.shift()!;
    data.structureToNode.set(value, node);
    data.unusedStructures.delete(value);
    data.unusedNodes.delete(node);
  });

  return data;
}

class StructureAndNodeData {
  readonly unusedStructures = new Set<Structures>();
  readonly unusedNodes = new Set<Node>();

  readonly structureSetsByHash = new DefaultMap<string, Structures[]>;
  readonly nodeSetsByHash = new DefaultMap<string, Node[]>;

  readonly structureToNode = new Map<Structures, Node>;
}

function collectDescendantStructures(
  data: StructureAndNodeData,
  currentStructure: Structures
): void
{
  if (currentStructure.kind !== StructureKind.JSDocTag) {
    const hash = hashStructure(currentStructure);
    const structureSet = data.structureSetsByHash.getDefault(hash, () => []);
    structureSet.push(currentStructure);
    data.unusedStructures.add(currentStructure);
  }

  forEachStructureChild(
    currentStructure,
    (child: Structures): void => collectDescendantStructures(data, child)
  );
}

function collectDescendantNodes(
  data: StructureAndNodeData,
  currentNode: Node
): void
{
  if (knownSyntaxKinds.has(currentNode.getKind())) {
    const hash = hashNode(currentNode);
    const nodeSet = data.nodeSetsByHash.getDefault(hash, () => []);
    nodeSet.push(currentNode);
    data.unusedNodes.add(currentNode);
  }

  currentNode.forEachChild(childNode => collectDescendantNodes(data, childNode));
}

function hashStructure(
  structure: Structures
): string {
  let rv: string = structure.kind.toString();
  if ("name" in structure) {
    rv += ":" + structure.name?.toString();
  }
  return rv;
}

function createNodeHashFromStructure(
  structure: Structures
): string
{
  let rv: string = StructureKindToSyntaxKindMap.get(structure.kind)!.toString();
  if ("name" in structure)
    rv += ":" + structure.name?.toString();
  return rv;
}

function hashNode(
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
