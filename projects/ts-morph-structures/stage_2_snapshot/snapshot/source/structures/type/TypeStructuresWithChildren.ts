import type { CodeBlockWriter, WriterFunction } from "ts-morph";

import {
  TypeStructureKind,
  type StructureImpls,
  type TypeStructures,
  type TypeStructuresOrNull,
} from "../../exports.js";

import { STRUCTURE_AND_TYPES_CHILDREN } from "../../internal-exports.js";

import TypeStructuresBase from "./TypeStructuresBase.js";

class TypePrinterSettings {
  indentChildren = false;
  newLinesAroundChildren = false;
  oneLinePerChild = false;
}

export default abstract class TypeStructuresWithChildren<
  Kind extends TypeStructureKind,
  Children extends readonly TypeStructures[],
> extends TypeStructuresBase<Kind> {
  abstract readonly kind: Kind;

  /** This lives outside the start and end tokens.  Think of this as a parent type for the children, ie. `Partial`. */
  protected abstract objectType: TypeStructuresOrNull;
  /** The child types we join together, and wrap in the start and end tokens. */
  public abstract readonly childTypes: Children;
  /** A very short string, one or two characters, before all child types. */
  protected abstract readonly startToken: string;
  /** A very short string, between all child types. */
  protected abstract readonly joinChildrenToken: string;
  /** A very short string, one or two characters, after all child types. */
  protected abstract readonly endToken: string;
  /** The maximum number of children to support. */
  protected abstract readonly maxChildCount: number;

  /** For customizing printing of the child types. */
  readonly printerSettings = new TypePrinterSettings();

  #writerFunctionOuter(writer: CodeBlockWriter): void {
    this.objectType?.writerFunction(writer);

    TypeStructuresBase.pairedWrite(
      writer,
      this.startToken,
      this.endToken,
      this.printerSettings.newLinesAroundChildren,
      this.printerSettings.indentChildren,
      () => this.#writerFunctionInner(writer),
    );
  }

  #writerFunctionInner(writer: CodeBlockWriter): void {
    let { childTypes } = this;
    if (childTypes.length === 0) return;
    if (childTypes.length > this.maxChildCount)
      childTypes = childTypes.slice(
        0,
        this.maxChildCount,
      ) as unknown as Children;

    const lastIndex = childTypes.length - 1;
    for (let index = 0; index <= lastIndex; index++) {
      const child = childTypes[index];
      child.writerFunction(writer);
      if (index === lastIndex) break;

      if (this.printerSettings.oneLinePerChild) {
        writer.write(this.joinChildrenToken.trimEnd());
        writer.newLine();
      } else {
        writer.write(this.joinChildrenToken);
      }
    }
  }

  readonly writerFunction: WriterFunction =
    this.#writerFunctionOuter.bind(this);

  /** @internal */
  public *[STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<
    StructureImpls | TypeStructures
  > {
    yield* super[STRUCTURE_AND_TYPES_CHILDREN]();
    if (typeof this.objectType === "object" && this.objectType)
      yield this.objectType;
    for (const child of this.childTypes) {
      if (typeof child === "object") yield child;
    }
  }
}
