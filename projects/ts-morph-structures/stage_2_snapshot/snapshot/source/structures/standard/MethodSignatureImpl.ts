//#region preamble
import type { MethodSignatureStructureClassIfc } from "../../exports.js";
import {
  type CloneableStructure,
  COPY_FIELDS,
  type ExtractStructure,
  type JSDocableNodeStructureFields,
  JSDocableNodeStructureMixin,
  type NamedNodeStructureFields,
  NamedNodeStructureMixin,
  type ParameteredNodeStructureFields,
  ParameteredNodeStructureMixin,
  type QuestionTokenableNodeStructureFields,
  QuestionTokenableNodeStructureMixin,
  type ReturnTypedNodeStructureFields,
  ReturnTypedNodeStructureMixin,
  StructureBase,
  StructureClassesMap,
  type StructureClassToJSON,
  type StructureFields,
  StructureMixin,
  type TypeParameteredNodeStructureFields,
  TypeParameteredNodeStructureMixin,
} from "../../internal-exports.js";
import MultiMixinBuilder from "mixin-decorators";
import {
  type MethodSignatureStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const MethodSignatureStructureBase = MultiMixinBuilder<
  [
    QuestionTokenableNodeStructureFields,
    ParameteredNodeStructureFields,
    ReturnTypedNodeStructureFields,
    TypeParameteredNodeStructureFields,
    NamedNodeStructureFields,
    JSDocableNodeStructureFields,
    StructureFields,
  ],
  typeof StructureBase
>(
  [
    QuestionTokenableNodeStructureMixin,
    ParameteredNodeStructureMixin,
    ReturnTypedNodeStructureMixin,
    TypeParameteredNodeStructureMixin,
    NamedNodeStructureMixin,
    JSDocableNodeStructureMixin,
    StructureMixin,
  ],
  StructureBase,
);

export default class MethodSignatureImpl
  extends MethodSignatureStructureBase
  implements MethodSignatureStructureClassIfc
{
  readonly kind: StructureKind.MethodSignature = StructureKind.MethodSignature;

  constructor(name: string) {
    super();
    this.name = name;
  }

  public static clone(
    source: OptionalKind<MethodSignatureStructure>,
  ): MethodSignatureImpl {
    const target = new MethodSignatureImpl(source.name);
    this[COPY_FIELDS](source, target);
    return target;
  }

  public toJSON(): StructureClassToJSON<MethodSignatureImpl> {
    const rv = super.toJSON() as StructureClassToJSON<MethodSignatureImpl>;
    rv.kind = this.kind;
    return rv;
  }
}

MethodSignatureImpl satisfies CloneableStructure<
  MethodSignatureStructure,
  MethodSignatureImpl
> &
  Class<ExtractStructure<MethodSignatureStructure["kind"]>>;
StructureClassesMap.set(StructureKind.MethodSignature, MethodSignatureImpl);
