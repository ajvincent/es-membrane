//#region preamble
import type {
  JSDocTagStructureClassIfc,
  stringOrWriterFunction,
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
} from "../../internal-exports.js";
import MultiMixinBuilder from "mixin-decorators";
import {
  type JSDocTagStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const JSDocTagStructureBase = MultiMixinBuilder<
  [StructureFields],
  typeof StructureBase
>([StructureMixin], StructureBase);

export default class JSDocTagImpl
  extends JSDocTagStructureBase
  implements JSDocTagStructureClassIfc
{
  readonly kind: StructureKind.JSDocTag = StructureKind.JSDocTag;
  /** The name for the JS doc tag that comes after the "at" symbol. */
  tagName: string;
  /** The text that follows the tag name. */
  text?: stringOrWriterFunction = undefined;

  constructor(tagName: string) {
    super();
    this.tagName = tagName;
  }

  /** @internal */
  public static [COPY_FIELDS](
    source: OptionalKind<JSDocTagStructure>,
    target: JSDocTagImpl,
  ): void {
    super[COPY_FIELDS](source, target);
    target.tagName = source.tagName;
    if (source.text) {
      target.text = source.text;
    }
  }

  public static clone(source: OptionalKind<JSDocTagStructure>): JSDocTagImpl {
    const target = new JSDocTagImpl(source.tagName);
    this[COPY_FIELDS](source, target);
    return target;
  }

  public toJSON(): StructureClassToJSON<JSDocTagImpl> {
    const rv = super.toJSON() as StructureClassToJSON<JSDocTagImpl>;
    rv.kind = this.kind;
    rv.tagName = this.tagName;
    if (this.text) {
      rv.text = StructureBase[REPLACE_WRITER_WITH_STRING](this.text);
    } else {
      rv.text = undefined;
    }

    return rv;
  }
}

JSDocTagImpl satisfies CloneableStructure<JSDocTagStructure, JSDocTagImpl> &
  Class<ExtractStructure<JSDocTagStructure["kind"]>>;
StructureClassesMap.set(StructureKind.JSDocTag, JSDocTagImpl);
