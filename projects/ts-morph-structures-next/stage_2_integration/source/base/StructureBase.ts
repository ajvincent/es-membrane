import {
  CodeBlockWriter,
  type OptionalKind,
  Structures,
  type WriterFunction
} from "ts-morph";

import {
  COPY_FIELDS,
  REPLACE_WRITER_WITH_STRING,
  STRUCTURE_CHILDREN,
} from "./symbolKeys.js";

import type {
  AugmentedStructures
} from "../types/AugmentedStructures.js";

export default class StructureBase
{
  /** @internal */
  public static [COPY_FIELDS](
    source: OptionalKind<Structures>,
    target: Structures
  ): void
  {
    void(source);
    void(target);
  }

  /** @internal */
  public static [REPLACE_WRITER_WITH_STRING]
  (
    value: string | WriterFunction,
  ): string
  {
    if (typeof value === "function") {
      const writer = new CodeBlockWriter();
      value(writer);
      return writer.toString();
    }

    return value;
  }

  public toJSON(): object
  {
    return {};
  }

  /** @internal */
  public * [STRUCTURE_CHILDREN](): IterableIterator<AugmentedStructures> {
  }
}
