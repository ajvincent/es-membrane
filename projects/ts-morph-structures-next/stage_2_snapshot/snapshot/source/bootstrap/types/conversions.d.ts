import type {
  KindedStructure,
  Node,
  Structures,
  StructureKind,
  TypeNode,
} from "ts-morph";

import type { StructureImpls, TypeStructuresOrNull } from "../../exports.js";

export type NodeWithStructures = Node & {
  getStructure(): Structures;
};

/** A string message and a type node. */
export interface ConversionFailureMessage {
  message: string;
  failingNode: Node;
}

/**
 * @param message - The failure message.
 * @param failingTypeNode - the type node we failed to resolve.
 */
export type NodeToStructureConsole = (
  message: string,
  failingNode: Node,
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
  _console: NodeToStructureConsole,
  subStructureResolver: SubstructureResolver,
) => TypeStructuresOrNull;

export interface RootStructureWithConvertFailures<
  TKind extends StructureKind = StructureKind,
> {
  rootStructure: Extract<StructureImpls, KindedStructure<TKind>>;
  failures: readonly ConversionFailureMessage[];
}
