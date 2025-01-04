//#region preamble
import type {
  JSDocImpl,
  PropertyDeclarationStructureClassIfc,
  PropertySignatureImpl,
} from "../../exports.js";
import {
  type AbstractableNodeStructureFields,
  AbstractableNodeStructureMixin,
  type AmbientableNodeStructureFields,
  AmbientableNodeStructureMixin,
  type CloneableStructure,
  COPY_FIELDS,
  type DecoratableNodeStructureFields,
  DecoratableNodeStructureMixin,
  type ExclamationTokenableNodeStructureFields,
  ExclamationTokenableNodeStructureMixin,
  type ExtractStructure,
  type InitializerExpressionableNodeStructureFields,
  InitializerExpressionableNodeStructureMixin,
  type JSDocableNodeStructureFields,
  JSDocableNodeStructureMixin,
  type NamedNodeStructureFields,
  NamedNodeStructureMixin,
  type OverrideableNodeStructureFields,
  OverrideableNodeStructureMixin,
  type QuestionTokenableNodeStructureFields,
  QuestionTokenableNodeStructureMixin,
  type ReadonlyableNodeStructureFields,
  ReadonlyableNodeStructureMixin,
  type ScopedNodeStructureFields,
  ScopedNodeStructureMixin,
  StructureBase,
  StructureClassesMap,
  type StructureClassToJSON,
  type StructureFields,
  StructureMixin,
  type TypedNodeStructureFields,
  TypedNodeStructureMixin,
  TypeStructureClassesMap,
} from "../../internal-exports.js";
import MultiMixinBuilder from "mixin-decorators";
import {
  type OptionalKind,
  type PropertyDeclarationStructure,
  StructureKind,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const PropertyDeclarationStructureBase = MultiMixinBuilder<
  [
    ExclamationTokenableNodeStructureFields,
    ReadonlyableNodeStructureFields,
    OverrideableNodeStructureFields,
    TypedNodeStructureFields,
    InitializerExpressionableNodeStructureFields,
    QuestionTokenableNodeStructureFields,
    DecoratableNodeStructureFields,
    AbstractableNodeStructureFields,
    ScopedNodeStructureFields,
    AmbientableNodeStructureFields,
    NamedNodeStructureFields,
    JSDocableNodeStructureFields,
    StructureFields,
  ],
  typeof StructureBase
>(
  [
    ExclamationTokenableNodeStructureMixin,
    ReadonlyableNodeStructureMixin,
    OverrideableNodeStructureMixin,
    TypedNodeStructureMixin,
    InitializerExpressionableNodeStructureMixin,
    QuestionTokenableNodeStructureMixin,
    DecoratableNodeStructureMixin,
    AbstractableNodeStructureMixin,
    ScopedNodeStructureMixin,
    AmbientableNodeStructureMixin,
    NamedNodeStructureMixin,
    JSDocableNodeStructureMixin,
    StructureMixin,
  ],
  StructureBase,
);

export default class PropertyDeclarationImpl
  extends PropertyDeclarationStructureBase
  implements PropertyDeclarationStructureClassIfc
{
  readonly kind: StructureKind.Property = StructureKind.Property;
  hasAccessorKeyword = false;
  isStatic: boolean;

  constructor(isStatic: boolean, name: string) {
    super();
    this.isStatic = isStatic;
    this.name = name;
  }

  /** @internal */
  public static [COPY_FIELDS](
    source: OptionalKind<PropertyDeclarationStructure>,
    target: PropertyDeclarationImpl,
  ): void {
    super[COPY_FIELDS](source, target);
    target.hasAccessorKeyword = source.hasAccessorKeyword ?? false;
  }

  public static clone(
    source: OptionalKind<PropertyDeclarationStructure>,
  ): PropertyDeclarationImpl {
    const target = new PropertyDeclarationImpl(
      source.isStatic ?? false,
      source.name,
    );
    this[COPY_FIELDS](source, target);
    return target;
  }

  public static fromSignature(
    isStatic: boolean,
    signature: PropertySignatureImpl,
  ): PropertyDeclarationImpl {
    const declaration = new PropertyDeclarationImpl(isStatic, signature.name);
    declaration.docs.push(
      ...StructureClassesMap.cloneArray<JSDocImpl | string, JSDocImpl | string>(
        signature.docs,
      ),
    );
    declaration.hasQuestionToken = signature.hasQuestionToken;
    declaration.isReadonly = signature.isReadonly;
    declaration.leadingTrivia.push(...signature.leadingTrivia);
    declaration.trailingTrivia.push(...signature.trailingTrivia);
    if (signature.typeStructure) {
      declaration.typeStructure = TypeStructureClassesMap.clone(
        signature.typeStructure,
      );
    }

    return declaration;
  }

  public toJSON(): StructureClassToJSON<PropertyDeclarationImpl> {
    const rv = super.toJSON() as StructureClassToJSON<PropertyDeclarationImpl>;
    rv.hasAccessorKeyword = this.hasAccessorKeyword;
    rv.isStatic = this.isStatic;
    rv.kind = this.kind;
    return rv;
  }
}

PropertyDeclarationImpl satisfies CloneableStructure<
  PropertyDeclarationStructure,
  PropertyDeclarationImpl
> &
  Class<ExtractStructure<PropertyDeclarationStructure["kind"]>>;
StructureClassesMap.set(StructureKind.Property, PropertyDeclarationImpl);
