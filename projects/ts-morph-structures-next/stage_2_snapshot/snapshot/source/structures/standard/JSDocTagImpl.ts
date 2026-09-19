//#region preamble
import {
  type JSDocTagStructureClassIfc,
  parseLiteralType,
  type stringOrWriterFunction,
  type TypeStructures,
  type TypeStructuresOrNull,
} from "../../exports.js";
import {
  type CloneableStructure,
  COPY_FIELDS,
  type ExtractStructure,
  REPLACE_WRITER_WITH_STRING,
  StructureBase,
  StructureClassesMap,
  type StructureClassToJSON,
  type StructureFields,
  StructureMixin,
  TypeStructureClassesMap,
} from "../../internal-exports.js";
import MultiMixinBuilder from "mixin-decorators";
import {
  type CodeBlockWriter,
  type JSDocTagStructure,
  type OptionalKind,
  StructureKind,
  type WriterFunction,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const JSDocTagStructureBase = MultiMixinBuilder<
  [StructureFields],
  typeof StructureBase
>([StructureMixin], StructureBase);

export class JSDocTagImpl
  extends JSDocTagStructureBase
  implements JSDocTagStructureClassIfc
{
  static readonly #typeRE = /^\{([^}]+)\}\s?(.*)/;
  readonly kind: StructureKind.JSDocTag = StructureKind.JSDocTag;
  readonly #defaultTextWriter: WriterFunction =
    this.#unboundTextWriter.bind(this);
  #description: string;
  #text: WriterFunction = this.#defaultTextWriter;
  #typeStructure: TypeStructuresOrNull = null;
  /** The name for the JS doc tag that comes after the "at" symbol. */
  tagName: string;

  constructor(tagName: string) {
    super();
    this.tagName = tagName;
    this.#description = "";
    this.setTypeAndDescription(null, "");
  }

  /** The text that follows the tag name. */
  public get text(): stringOrWriterFunction | undefined {
    return this.#text;
  }

  public set text(value: stringOrWriterFunction | undefined) {
    if (typeof value === "function") {
      this.#typeStructure = null;
      this.#description = "";
      this.#text = value;
      return;
    }

    if (typeof value === "undefined") {
      value = "";
    }

    const match = JSDocTagImpl.#typeRE.exec(value.trim());
    if (match) {
      try {
        const typeStructure: TypeStructures = parseLiteralType(match[1]);
        this.setTypeAndDescription(typeStructure, match[2]);
        return;
      } catch (ex) {
        void ex;
        // fall through
      }
    }

    this.setTypeAndDescription(null, value);
  }

  /** @internal */
  public static [COPY_FIELDS](
    source: OptionalKind<JSDocTagStructure>,
    target: JSDocTagImpl,
  ): void {
    super[COPY_FIELDS](source, target);
    if (source instanceof JSDocTagImpl) {
      const typeAndDesc = source.getTypeAndDescription();
      if (typeAndDesc) {
        let typeStructure: TypeStructuresOrNull = typeAndDesc[0];
        if (typeStructure)
          typeStructure = TypeStructureClassesMap.clone(typeStructure);
        target.setTypeAndDescription(typeStructure, typeAndDesc[1]);
      } else {
        target.text = source.text;
      }
    } else if (source.text) {
      target.text = source.text;
    }

    target.tagName = source.tagName;
  }

  /**
   * Create a `JSDocTagImpl` from a `JSDocTagStructure`.
   * @param source - The structure to clone.
   */
  public static clone(source: OptionalKind<JSDocTagStructure>): JSDocTagImpl {
    const target = new JSDocTagImpl(source.tagName);
    this[COPY_FIELDS](source, target);
    return target;
  }

  #unboundTextWriter(writer: CodeBlockWriter) {
    if (this.#typeStructure) {
      writer.write("{");
      this.#typeStructure.writerFunction(writer);
      writer.write("} ");
    }

    writer.write(this.#description);
  }

  /** Get the type structure and description of the tag. */
  public getTypeAndDescription(): [TypeStructuresOrNull, string] | undefined {
    if (this.#text === this.#defaultTextWriter)
      return [this.#typeStructure, this.#description];
    return undefined;
  }

  /**
   * Set the type structure and description of the tag.
   * @param type - The type structure to use.
   * @param description - The text to write after the type structure.
   */
  public setTypeAndDescription(
    type: TypeStructuresOrNull,
    description: string,
  ): void {
    this.#text = this.#defaultTextWriter;
    this.#typeStructure = type;
    this.#description = description;
  }

  public toJSON(): StructureClassToJSON<JSDocTagImpl> {
    const rv = super.toJSON() as StructureClassToJSON<JSDocTagImpl>;
    rv.kind = this.kind;
    if (this.text) {
      rv.text = StructureBase[REPLACE_WRITER_WITH_STRING](this.text);
    }

    rv.tagName = this.tagName;
    return rv;
  }
}

JSDocTagImpl satisfies CloneableStructure<JSDocTagStructure, JSDocTagImpl> &
  Class<ExtractStructure<JSDocTagStructure["kind"]>>;
StructureClassesMap.set(StructureKind.JSDocTag, JSDocTagImpl);
