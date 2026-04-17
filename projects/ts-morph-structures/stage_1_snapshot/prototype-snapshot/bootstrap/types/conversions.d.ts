import {
  type KindedStructure,
  Node,
  type Structures,
  type StructureKind,
  TypeNode,
} from "ts-morph";

export interface NodeWithStructures extends Node {
  getStructure(): Structures;
}