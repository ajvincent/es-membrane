//#region preamble
import { StructureBase } from "../../base/StructureBase.js";
import { StructureClassesMap } from "../../base/StructureClassesMap.js";
import { COPY_FIELDS } from "../../base/symbolKeys.js";
import {
  type NamedNodeStructureFields,
  NamedNodeStructureMixin,
} from "../../decorators/standard/NamedNodeStructureMixin.js";
import {
  type StructureFields,
  StructureMixin,
} from "../../decorators/standard/StructureMixin.js";
import type { ImportAttributeStructureClassIfc } from "../../exports.js";
import type {
  CloneableStructure,
  ExtractStructure,
  StructureClassToJSON,
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

export class ImportAttributeImpl
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

  /**
   * Create a `ImportAttributeImpl` from a `ImportAttributeStructure`.
   * @param source - The structure to clone.
   */
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
