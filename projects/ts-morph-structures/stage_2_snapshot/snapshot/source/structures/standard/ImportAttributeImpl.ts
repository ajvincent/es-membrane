//#region preamble
import type { ImportAttributeStructureClassIfc } from "../../exports.js";
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
  type ImportAttributeStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const ImportAttributeStructureBase = MultiMixinBuilder<
  [NamedNodeStructureFields, StructureFields],
  typeof StructureBase
>([NamedNodeStructureMixin, StructureMixin], StructureBase);

export default class ImportAttributeImpl
  extends ImportAttributeStructureBase
  implements ImportAttributeStructureClassIfc
{
  readonly kind: StructureKind.ImportAttribute = StructureKind.ImportAttribute;
  /** Expression value. Quote this when providing a string. */
  value: string;

  constructor(name: string, value: string) {
    super();
    this.name = name;
    this.value = value;
  }

  /** @internal */
  public static [COPY_FIELDS](
    source: OptionalKind<ImportAttributeStructure>,
    target: ImportAttributeImpl,
  ): void {
    super[COPY_FIELDS](source, target);
    target.value = source.value;
  }

  public static clone(
    source: OptionalKind<ImportAttributeStructure>,
  ): ImportAttributeImpl {
    const target = new ImportAttributeImpl(source.name, source.value);
    this[COPY_FIELDS](source, target);
    return target;
  }

  public toJSON(): StructureClassToJSON<ImportAttributeImpl> {
    const rv = super.toJSON() as StructureClassToJSON<ImportAttributeImpl>;
    rv.kind = this.kind;
    rv.value = this.value;
    return rv;
  }
}

ImportAttributeImpl satisfies CloneableStructure<
  ImportAttributeStructure,
  ImportAttributeImpl
> &
  Class<ExtractStructure<ImportAttributeStructure["kind"]>>;
StructureClassesMap.set(StructureKind.ImportAttribute, ImportAttributeImpl);
