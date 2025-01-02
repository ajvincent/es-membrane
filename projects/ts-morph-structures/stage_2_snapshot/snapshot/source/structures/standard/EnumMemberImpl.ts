//#region preamble
import type { EnumMemberStructureClassIfc } from "../../exports.js";
import {
  type CloneableStructure,
  COPY_FIELDS,
  type ExtractStructure,
  type InitializerExpressionableNodeStructureFields,
  InitializerExpressionableNodeStructureMixin,
  type JSDocableNodeStructureFields,
  JSDocableNodeStructureMixin,
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
  type EnumMemberStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const EnumMemberStructureBase = MultiMixinBuilder<
  [
    InitializerExpressionableNodeStructureFields,
    NamedNodeStructureFields,
    JSDocableNodeStructureFields,
    StructureFields,
  ],
  typeof StructureBase
>(
  [
    InitializerExpressionableNodeStructureMixin,
    NamedNodeStructureMixin,
    JSDocableNodeStructureMixin,
    StructureMixin,
  ],
  StructureBase,
);

export default class EnumMemberImpl
  extends EnumMemberStructureBase
  implements EnumMemberStructureClassIfc
{
  readonly kind: StructureKind.EnumMember = StructureKind.EnumMember;
  /** Convenience property for setting the initializer. */
  value?: number | string = undefined;

  constructor(name: string) {
    super();
    this.name = name;
  }

  /** @internal */
  public static [COPY_FIELDS](
    source: OptionalKind<EnumMemberStructure>,
    target: EnumMemberImpl,
  ): void {
    super[COPY_FIELDS](source, target);
    if (source.value) {
      target.value = source.value;
    }
  }

  public static clone(
    source: OptionalKind<EnumMemberStructure>,
  ): EnumMemberImpl {
    const target = new EnumMemberImpl(source.name);
    this[COPY_FIELDS](source, target);
    return target;
  }

  public toJSON(): StructureClassToJSON<EnumMemberImpl> {
    const rv = super.toJSON() as StructureClassToJSON<EnumMemberImpl>;
    rv.kind = this.kind;
    if (this.value) {
      rv.value = this.value;
    } else {
      rv.value = undefined;
    }

    return rv;
  }
}

EnumMemberImpl satisfies CloneableStructure<
  EnumMemberStructure,
  EnumMemberImpl
> &
  Class<ExtractStructure<EnumMemberStructure["kind"]>>;
StructureClassesMap.set(StructureKind.EnumMember, EnumMemberImpl);
