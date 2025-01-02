import type { stringOrWriterFunction } from "../../exports.js";
import type { StructureKind } from "ts-morph";

export interface DecoratorStructureClassIfc {
  readonly kind: StructureKind.Decorator;
  /**
   * Arguments for a decorator factory.
   * @remarks Provide an empty array to make the structure a decorator factory.
   */
  readonly arguments: stringOrWriterFunction[];
  readonly typeArguments: string[];
}
