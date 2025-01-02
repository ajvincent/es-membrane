//#region preamble
import type {
  JsxAttributeImpl,
  JsxSelfClosingElementStructureClassIfc,
  JsxSpreadAttributeImpl,
} from "../../exports.js";
import {
  type CloneableStructure,
  COPY_FIELDS,
  type ExtractStructure,
  type NamedNodeStructureFields,
  NamedNodeStructureMixin,
  StructureBase,
  StructureClassesMap,
  type StructureClassToJSON,
  type StructureFields,
  StructureMixin,
} from "../../internal-exports.js";
import MultiMixinBuilder from "mixin-decorators";
import {
  type JsxAttributeStructure,
  type JsxSelfClosingElementStructure,
  type JsxSpreadAttributeStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const JsxSelfClosingElementStructureBase = MultiMixinBuilder<
  [NamedNodeStructureFields, StructureFields],
  typeof StructureBase
>([NamedNodeStructureMixin, StructureMixin], StructureBase);

export default class JsxSelfClosingElementImpl
  extends JsxSelfClosingElementStructureBase
  implements JsxSelfClosingElementStructureClassIfc
{
  readonly kind: StructureKind.JsxSelfClosingElement =
    StructureKind.JsxSelfClosingElement;
  readonly attributes: (JsxAttributeImpl | JsxSpreadAttributeImpl)[] = [];

  constructor(name: string) {
    super();
    this.name = name;
  }

  /** @internal */
  public static [COPY_FIELDS](
    source: OptionalKind<JsxSelfClosingElementStructure>,
    target: JsxSelfClosingElementImpl,
  ): void {
    super[COPY_FIELDS](source, target);
    if (source.attributes) {
      target.attributes.push(
        ...StructureClassesMap.cloneRequiredAndOptionalArray<
          JsxSpreadAttributeStructure,
          StructureKind.JsxSpreadAttribute,
          OptionalKind<JsxAttributeStructure>,
          StructureKind.JsxAttribute,
          JsxSpreadAttributeImpl,
          JsxAttributeImpl
        >(
          source.attributes,
          StructureKind.JsxSpreadAttribute,
          StructureKind.JsxAttribute,
        ),
      );
    }
  }

  public static clone(
    source: OptionalKind<JsxSelfClosingElementStructure>,
  ): JsxSelfClosingElementImpl {
    const target = new JsxSelfClosingElementImpl(source.name);
    this[COPY_FIELDS](source, target);
    return target;
  }

  public toJSON(): StructureClassToJSON<JsxSelfClosingElementImpl> {
    const rv =
      super.toJSON() as StructureClassToJSON<JsxSelfClosingElementImpl>;
    rv.attributes = this.attributes;
    rv.kind = this.kind;
    return rv;
  }
}

JsxSelfClosingElementImpl satisfies CloneableStructure<
  JsxSelfClosingElementStructure,
  JsxSelfClosingElementImpl
> &
  Class<ExtractStructure<JsxSelfClosingElementStructure["kind"]>>;
StructureClassesMap.set(
  StructureKind.JsxSelfClosingElement,
  JsxSelfClosingElementImpl,
);
