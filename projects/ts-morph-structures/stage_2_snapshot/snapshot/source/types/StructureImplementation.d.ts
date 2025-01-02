import type { Class } from "type-fest";

import type {
  KindedStructure,
  Node,
  OptionalKind,
  StructureKind,
} from "ts-morph";

/*
import type {
  stringOrWriterFunction
} from "./stringOrWriterFunction.js";
*/

export interface StructureImplementation<
  Kind extends StructureKind,
  StructureBase extends KindedStructure<Kind>,
> {
  /*
  readonly kind: Kind;

  leadingTrivia: stringOrWriterFunction[];
  trailingTrivia: stringOrWriterFunction[];
  */

  /** This is more for debugging purposes than actual code usage. */
  toJSON(): StructureBase;
}

export interface NodeWithStructure<Kind extends StructureKind> extends Node {
  getStructure(): KindedStructure<Kind>;
}

export interface StructureImplementationStatic<
  Kind extends StructureKind,
  StructureBase extends KindedStructure<Kind>,
  NodeBase extends NodeWithStructure<Kind>,
> extends Class<StructureImplementation<Kind, StructureBase>> {
  fromStructure(
    source: OptionalKind<StructureBase>,
  ): StructureImplementation<Kind, StructureBase>;

  fromNode(source: NodeBase): StructureImplementation<Kind, StructureBase>;
}
