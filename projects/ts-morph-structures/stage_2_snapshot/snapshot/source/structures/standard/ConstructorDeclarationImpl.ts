//#region preamble
import type {
  ConstructorDeclarationOverloadImpl,
  ConstructorDeclarationStructureClassIfc,
  ConstructSignatureDeclarationImpl,
  JSDocImpl,
  ParameterDeclarationImpl,
  TypeParameterDeclarationImpl,
} from "../../exports.js";
import {
  type CloneableStructure,
  COPY_FIELDS,
  type ExtractStructure,
  type JSDocableNodeStructureFields,
  JSDocableNodeStructureMixin,
  type ParameteredNodeStructureFields,
  ParameteredNodeStructureMixin,
  type ReturnTypedNodeStructureFields,
  ReturnTypedNodeStructureMixin,
  type ScopedNodeStructureFields,
  ScopedNodeStructureMixin,
  type StatementedNodeStructureFields,
  StatementedNodeStructureMixin,
  StructureBase,
  StructureClassesMap,
  type StructureClassToJSON,
  type StructureFields,
  StructureMixin,
  type TypeParameteredNodeStructureFields,
  TypeParameteredNodeStructureMixin,
  TypeStructureClassesMap,
} from "../../internal-exports.js";
import MultiMixinBuilder from "mixin-decorators";
import {
  type ConstructorDeclarationOverloadStructure,
  type ConstructorDeclarationStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const ConstructorDeclarationStructureBase = MultiMixinBuilder<
  [
    ScopedNodeStructureFields,
    StatementedNodeStructureFields,
    ParameteredNodeStructureFields,
    ReturnTypedNodeStructureFields,
    TypeParameteredNodeStructureFields,
    JSDocableNodeStructureFields,
    StructureFields,
  ],
  typeof StructureBase
>(
  [
    ScopedNodeStructureMixin,
    StatementedNodeStructureMixin,
    ParameteredNodeStructureMixin,
    ReturnTypedNodeStructureMixin,
    TypeParameteredNodeStructureMixin,
    JSDocableNodeStructureMixin,
    StructureMixin,
  ],
  StructureBase,
);

export default class ConstructorDeclarationImpl
  extends ConstructorDeclarationStructureBase
  implements ConstructorDeclarationStructureClassIfc
{
  readonly kind: StructureKind.Constructor = StructureKind.Constructor;
  readonly overloads: ConstructorDeclarationOverloadImpl[] = [];

  /** @internal */
  public static [COPY_FIELDS](
    source: OptionalKind<ConstructorDeclarationStructure>,
    target: ConstructorDeclarationImpl,
  ): void {
    super[COPY_FIELDS](source, target);
    if (source.overloads) {
      target.overloads.push(
        ...StructureClassesMap.cloneArrayWithKind<
          ConstructorDeclarationOverloadStructure,
          StructureKind.ConstructorOverload,
          ConstructorDeclarationOverloadImpl
        >(
          StructureKind.ConstructorOverload,
          StructureClassesMap.forceArray(source.overloads),
        ),
      );
    }
  }

  public static clone(
    source: OptionalKind<ConstructorDeclarationStructure>,
  ): ConstructorDeclarationImpl {
    const target = new ConstructorDeclarationImpl();
    this[COPY_FIELDS](source, target);
    return target;
  }

  public static fromSignature(
    signature: ConstructSignatureDeclarationImpl,
  ): ConstructorDeclarationImpl {
    const declaration = new ConstructorDeclarationImpl();
    declaration.docs.push(
      ...StructureClassesMap.cloneArray<JSDocImpl | string, JSDocImpl | string>(
        signature.docs,
      ),
    );
    declaration.leadingTrivia.push(...signature.leadingTrivia);
    declaration.parameters.push(
      ...StructureClassesMap.cloneArray<
        ParameterDeclarationImpl,
        ParameterDeclarationImpl
      >(signature.parameters),
    );
    if (signature.returnTypeStructure) {
      declaration.returnTypeStructure = TypeStructureClassesMap.clone(
        signature.returnTypeStructure,
      );
    }

    declaration.trailingTrivia.push(...signature.trailingTrivia);
    declaration.typeParameters.push(
      ...StructureClassesMap.cloneArray<
        TypeParameterDeclarationImpl | string,
        TypeParameterDeclarationImpl | string
      >(signature.typeParameters),
    );
    return declaration;
  }

  public toJSON(): StructureClassToJSON<ConstructorDeclarationImpl> {
    const rv =
      super.toJSON() as StructureClassToJSON<ConstructorDeclarationImpl>;
    rv.kind = this.kind;
    rv.overloads = this.overloads;
    return rv;
  }
}

ConstructorDeclarationImpl satisfies CloneableStructure<
  ConstructorDeclarationStructure,
  ConstructorDeclarationImpl
> &
  Class<ExtractStructure<ConstructorDeclarationStructure["kind"]>>;
StructureClassesMap.set(StructureKind.Constructor, ConstructorDeclarationImpl);
