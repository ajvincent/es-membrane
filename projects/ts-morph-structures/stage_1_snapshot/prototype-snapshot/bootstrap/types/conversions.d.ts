import {
  Node,
  type Structures,
} from "ts-morph";

export interface NodeWithStructures extends Node {
  getStructure(): Structures;
}