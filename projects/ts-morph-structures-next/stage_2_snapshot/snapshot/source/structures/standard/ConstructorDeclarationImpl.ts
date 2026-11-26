//#region preamble
import { StructureBase } from "../../base/StructureBase.js";
import { StructureClassesMap } from "../../base/StructureClassesMap.js";
import { COPY_FIELDS } from "../../base/symbolKeys.js";
import { TypeStructureClassesMap } from "../../base/TypeStructureClassesMap.js";
import type {
  ConstructorDeclarationOverloadImpl,
  ConstructorDeclarationStructureClassIfc,
  ConstructSignatureDeclarationImpl,
  JSDocImpl,
} from "../../exports.js";
import {
  type CloneableStructure,
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
  type StructureClassToJSON,
  type StructureFields,
  StructureMixin,
  type TypeParameteredNodeStructureFields,
  TypeParameteredNodeStructureMixin,
} from "../../internal-exports.js";
import { ParameterDeclarationImpl } from "./ParameterDeclarationImpl.js";
import { TypeParameterDeclarationImpl } from "./TypeParameterDeclarationImpl.js";
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

export class ConstructorDeclarationImpl
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

  /**
   * Create a `ConstructorDeclarationImpl` from a `ConstructorDeclarationStructure`.
   * @param source - The structure to clone.
   */
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
