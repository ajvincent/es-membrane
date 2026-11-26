//#region preamble
import { StructureBase } from "../../base/StructureBase.js";
import { StructureClassesMap } from "../../base/StructureClassesMap.js";
import { COPY_FIELDS } from "../../base/symbolKeys.js";
import { TypeStructureClassesMap } from "../../base/TypeStructureClassesMap.js";
import {
  type AbstractableNodeStructureFields,
  AbstractableNodeStructureMixin,
} from "../../decorators/standard/AbstractableNodeStructureMixin.js";
import {
  type AmbientableNodeStructureFields,
  AmbientableNodeStructureMixin,
} from "../../decorators/standard/AmbientableNodeStructureMixin.js";
import {
  type DecoratableNodeStructureFields,
  DecoratableNodeStructureMixin,
} from "../../decorators/standard/DecoratableNodeStructureMixin.js";
import {
  type ExclamationTokenableNodeStructureFields,
  ExclamationTokenableNodeStructureMixin,
} from "../../decorators/standard/ExclamationTokenableNodeStructureMixin.js";
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
  type OverrideableNodeStructureFields,
  OverrideableNodeStructureMixin,
} from "../../decorators/standard/OverrideableNodeStructureMixin.js";
import {
  type QuestionTokenableNodeStructureFields,
  QuestionTokenableNodeStructureMixin,
} from "../../decorators/standard/QuestionTokenableNodeStructureMixin.js";
import {
  type ReadonlyableNodeStructureFields,
  ReadonlyableNodeStructureMixin,
} from "../../decorators/standard/ReadonlyableNodeStructureMixin.js";
import {
  type ScopedNodeStructureFields,
  ScopedNodeStructureMixin,
} from "../../decorators/standard/ScopedNodeStructureMixin.js";
import {
  type StructureFields,
  StructureMixin,
} from "../../decorators/standard/StructureMixin.js";
import {
  type TypedNodeStructureFields,
  TypedNodeStructureMixin,
} from "../../decorators/standard/TypedNodeStructureMixin.js";
import type {
  JSDocImpl,
  PropertyDeclarationStructureClassIfc,
  PropertySignatureImpl,
} from "../../exports.js";
import type {
  CloneableStructure,
  ExtractStructure,
  StructureClassToJSON,
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
    OverrideableNodeStructureFields,
    ReadonlyableNodeStructureFields,
    TypedNodeStructureFields,
    InitializerExpressionableNodeStructureFields,
    AbstractableNodeStructureFields,
    DecoratableNodeStructureFields,
    QuestionTokenableNodeStructureFields,
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
    OverrideableNodeStructureMixin,
    ReadonlyableNodeStructureMixin,
    TypedNodeStructureMixin,
    InitializerExpressionableNodeStructureMixin,
    AbstractableNodeStructureMixin,
    DecoratableNodeStructureMixin,
    QuestionTokenableNodeStructureMixin,
    ScopedNodeStructureMixin,
    AmbientableNodeStructureMixin,
    NamedNodeStructureMixin,
    JSDocableNodeStructureMixin,
    StructureMixin,
  ],
  StructureBase,
);

export class PropertyDeclarationImpl
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

  /**
   * Create a `PropertyDeclarationImpl` from a `PropertyDeclarationStructure`.
   * @param source - The structure to clone.
   */
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
