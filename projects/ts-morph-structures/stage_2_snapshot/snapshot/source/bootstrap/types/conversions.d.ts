import {
  type KindedStructure,
  Node,
  Structures,
  type StructureKind,
  TypeNode,
} from "ts-morph";

import type { StructureImpls, TypeStructuresOrNull } from "../../exports.js";

export interface NodeWithStructures extends Node {
  getStructure(): Structures;
}

/** A string message and a type node. */
export interface BuildTypesForStructureFailures {
  message: string;
  failingTypeNode: TypeNode;
}

/**
 * @param message - The failure message.
 * @param failingTypeNode - the type node we failed to resolve.
 */
export type TypeNodeToTypeStructureConsole = (
  message: string,
  failingTypeNode: TypeNode,
) => void;

export type SubstructureResolver = (node: NodeWithStructures) => StructureImpls;

/**
 * @param typeNode - the type node we are examining.
 * @param _console - a callback for when we fail to resolve a type node.
 * @param subStructureResolver - when we discover a node with its own structures to investigate.
 * @returns a type structure, or null if we failed to resolve the type node.
 */
export type TypeNodeToTypeStructure = (
  typeNode: TypeNode,
  _console: TypeNodeToTypeStructureConsole,
  subStructureResolver: SubstructureResolver,
) => TypeStructuresOrNull;

export interface RootStructureWithConvertFailures<
  TKind extends StructureKind = StructureKind,
> {
  rootStructure: Extract<StructureImpls, KindedStructure<TKind>>;
  failures: readonly BuildTypesForStructureFailures[];
}
