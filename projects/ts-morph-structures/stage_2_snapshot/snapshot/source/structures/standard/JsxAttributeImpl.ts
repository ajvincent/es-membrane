//#region preamble
import type { JsxAttributeStructureClassIfc } from "../../exports.js";
import {
  type CloneableStructure,
  COPY_FIELDS,
  type ExtractStructure,
  StructureBase,
  StructureClassesMap,
  type StructureClassToJSON,
  type StructureFields,
  StructureMixin,
} from "../../internal-exports.js";
import MultiMixinBuilder from "mixin-decorators";
import {
  type JsxAttributeStructure,
  type JsxNamespacedNameStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const JsxAttributeStructureBase = MultiMixinBuilder<
  [StructureFields],
  typeof StructureBase
>([StructureMixin], StructureBase);

export default class JsxAttributeImpl
  extends JsxAttributeStructureBase
  implements JsxAttributeStructureClassIfc
{
  readonly kind: StructureKind.JsxAttribute = StructureKind.JsxAttribute;
  initializer?: string = undefined;
  name: JsxNamespacedNameStructure | string;

  constructor(name: JsxNamespacedNameStructure | string) {
    super();
    this.name = name;
  }

  /** @internal */
  public static [COPY_FIELDS](
    source: OptionalKind<JsxAttributeStructure>,
    target: JsxAttributeImpl,
  ): void {
    super[COPY_FIELDS](source, target);
    if (source.initializer) {
      target.initializer = source.initializer;
    }

    target.name = source.name;
  }

  public static clone(
    source: OptionalKind<JsxAttributeStructure>,
  ): JsxAttributeImpl {
    const target = new JsxAttributeImpl(source.name);
    this[COPY_FIELDS](source, target);
    return target;
  }

  public toJSON(): StructureClassToJSON<JsxAttributeImpl> {
    const rv = super.toJSON() as StructureClassToJSON<JsxAttributeImpl>;
    if (this.initializer) {
      rv.initializer = this.initializer;
    } else {
      rv.initializer = undefined;
    }

    rv.kind = this.kind;
    rv.name = this.name;
    return rv;
  }
}

JsxAttributeImpl satisfies CloneableStructure<
  JsxAttributeStructure,
  JsxAttributeImpl
> &
  Class<ExtractStructure<JsxAttributeStructure["kind"]>>;
StructureClassesMap.set(StructureKind.JsxAttribute, JsxAttributeImpl);
