//#region preamble
import { StructureBase } from "../../base/StructureBase.js";
import { StructureClassesMap } from "../../base/StructureClassesMap.js";
import { COPY_FIELDS } from "../../base/symbolKeys.js";
import {
  type InitializerExpressionableNodeStructureFields,
  InitializerExpressionableNodeStructureMixin,
} from "../../decorators/standard/InitializerExpressionableNodeStructureMixin.js";
import {
  type JSDocableNodeStructureFields,
  JSDocableNodeStructureMixin,
} from "../../decorators/standard/JSDocableNodeStructureMixin.js";
import {
  type NamedNodeStructureFields,
  NamedNodeStructureMixin,
} from "../../decorators/standard/NamedNodeStructureMixin.js";
import {
  type QuestionTokenableNodeStructureFields,
  QuestionTokenableNodeStructureMixin,
} from "../../decorators/standard/QuestionTokenableNodeStructureMixin.js";
import {
  type ReadonlyableNodeStructureFields,
  ReadonlyableNodeStructureMixin,
} from "../../decorators/standard/ReadonlyableNodeStructureMixin.js";
import {
  type StructureFields,
  StructureMixin,
} from "../../decorators/standard/StructureMixin.js";
import {
  type TypedNodeStructureFields,
  TypedNodeStructureMixin,
} from "../../decorators/standard/TypedNodeStructureMixin.js";
import type { PropertySignatureStructureClassIfc } from "../../exports.js";
import type {
  CloneableStructure,
  ExtractStructure,
  StructureClassToJSON,
} from "../../internal-exports.js";
import MultiMixinBuilder from "mixin-decorators";
import {
  type OptionalKind,
  type PropertySignatureStructure,
  StructureKind,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const PropertySignatureStructureBase = MultiMixinBuilder<
  [
    ReadonlyableNodeStructureFields,
    TypedNodeStructureFields,
    InitializerExpressionableNodeStructureFields,
    QuestionTokenableNodeStructureFields,
    NamedNodeStructureFields,
    JSDocableNodeStructureFields,
    StructureFields,
  ],
  typeof StructureBase
>(
  [
    ReadonlyableNodeStructureMixin,
    TypedNodeStructureMixin,
    InitializerExpressionableNodeStructureMixin,
    QuestionTokenableNodeStructureMixin,
    NamedNodeStructureMixin,
    JSDocableNodeStructureMixin,
    StructureMixin,
  ],
  StructureBase,
);

export class PropertySignatureImpl
  extends PropertySignatureStructureBase
  implements PropertySignatureStructureClassIfc
{
  readonly kind: StructureKind.PropertySignature =
    StructureKind.PropertySignature;

  constructor(name: string) {
    super();
    this.name = name;
  }

  /**
   * Create a `PropertySignatureImpl` from a `PropertySignatureStructure`.
   * @param source - The structure to clone.
   */
  public static clone(
    source: OptionalKind<PropertySignatureStructure>,
  ): PropertySignatureImpl {
    const target = new PropertySignatureImpl(source.name);
    this[COPY_FIELDS](source, target);
    return target;
  }

  public toJSON(): StructureClassToJSON<PropertySignatureImpl> {
    const rv = super.toJSON() as StructureClassToJSON<PropertySignatureImpl>;
    rv.kind = this.kind;
    return rv;
  }
}

PropertySignatureImpl satisfies CloneableStructure<
  PropertySignatureStructure,
  PropertySignatureImpl
> &
  Class<ExtractStructure<PropertySignatureStructure["kind"]>>;
StructureClassesMap.set(StructureKind.PropertySignature, PropertySignatureImpl);
