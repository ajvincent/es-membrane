import {
  SourceFile,
  Structure,
  Structures,
  Node,
  forEachStructureChild,
  SyntaxKind
} from "ts-morph";

import StructureKindToSyntaxKindMap from "../generated/structureToSyntax.mjs";
const knownSyntaxKinds = new Set<SyntaxKind>(StructureKindToSyntaxKindMap.values());

export default function buildStructureToNodeEntries(
  sourceFile: SourceFile
): [Structure[], Node[]]
{
  const sourceStructure = sourceFile.getStructure();

  const structuresArray: Structures[] = [];
  collectDescendantStructures(structuresArray, sourceStructure);

  let nodesArray: Node[] = [];
  collectDescendantNodes(nodesArray, sourceFile);
  nodesArray = nodesArray.filter(node => knownSyntaxKinds.has(node.getKind()));

  return [structuresArray, nodesArray];
}

function collectDescendantStructures(
  structureArray: Structures[],
  currentStructure: Structures
): void
{
  structureArray.push(currentStructure);
  forEachStructureChild(
    currentStructure,
    (child: Structures): void => collectDescendantStructures(structureArray, child)
  );
}

function collectDescendantNodes(
  nodeArray: Node[],
  currentNode: Node
): void
{
  nodeArray.push(currentNode);
  currentNode.forEachChild(childNode => collectDescendantNodes(nodeArray, childNode));
}
