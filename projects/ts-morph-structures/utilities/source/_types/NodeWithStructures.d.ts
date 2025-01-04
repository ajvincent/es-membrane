import type {
  Node,
  Structures,
} from "ts-morph";

export interface NodeWithStructures extends Node {
  getStructure(): Structures;
}
