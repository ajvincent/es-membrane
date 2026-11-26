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
  type AsyncableNodeStructureFields,
  AsyncableNodeStructureMixin,
} from "../../decorators/standard/AsyncableNodeStructureMixin.js";
import {
  type DecoratableNodeStructureFields,
  DecoratableNodeStructureMixin,
} from "../../decorators/standard/DecoratableNodeStructureMixin.js";
import {
  type GeneratorableNodeStructureFields,
  GeneratorableNodeStructureMixin,
} from "../../decorators/standard/GeneratorableNodeStructureMixin.js";
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
  type ParameteredNodeStructureFields,
  ParameteredNodeStructureMixin,
} from "../../decorators/standard/ParameteredNodeStructureMixin.js";
import {
  type QuestionTokenableNodeStructureFields,
  QuestionTokenableNodeStructureMixin,
} from "../../decorators/standard/QuestionTokenableNodeStructureMixin.js";
import {
  type ReturnTypedNodeStructureFields,
  ReturnTypedNodeStructureMixin,
} from "../../decorators/standard/ReturnTypedNodeStructureMixin.js";
import {
  type ScopedNodeStructureFields,
  ScopedNodeStructureMixin,
} from "../../decorators/standard/ScopedNodeStructureMixin.js";
import {
  type StatementedNodeStructureFields,
  StatementedNodeStructureMixin,
} from "../../decorators/standard/StatementedNodeStructureMixin.js";
import {
  type StructureFields,
  StructureMixin,
} from "../../decorators/standard/StructureMixin.js";
import {
  type TypeParameteredNodeStructureFields,
  TypeParameteredNodeStructureMixin,
} from "../../decorators/standard/TypeParameteredNodeStructureMixin.js";
import type {
  JSDocImpl,
  MethodDeclarationOverloadImpl,
  MethodDeclarationStructureClassIfc,
  MethodSignatureImpl,
} from "../../exports.js";
import type {
  CloneableStructure,
  ExtractStructure,
  StructureClassToJSON,
} from "../../internal-exports.js";
import { ParameterDeclarationImpl } from "./ParameterDeclarationImpl.js";
import { TypeParameterDeclarationImpl } from "./TypeParameterDeclarationImpl.js";
import MultiMixinBuilder from "mixin-decorators";
import {
  type MethodDeclarationOverloadStructure,
  type MethodDeclarationStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const MethodDeclarationStructureBase = MultiMixinBuilder<
  [
    AsyncableNodeStructureFields,
    GeneratorableNodeStructureFields,
    OverrideableNodeStructureFields,
    AbstractableNodeStructureFields,
    DecoratableNodeStructureFields,
    QuestionTokenableNodeStructureFields,
    ScopedNodeStructureFields,
    StatementedNodeStructureFields,
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
    AsyncableNodeStructureMixin,
    GeneratorableNodeStructureMixin,
    OverrideableNodeStructureMixin,
    AbstractableNodeStructureMixin,
    DecoratableNodeStructureMixin,
    QuestionTokenableNodeStructureMixin,
    ScopedNodeStructureMixin,
    StatementedNodeStructureMixin,
    ParameteredNodeStructureMixin,
    ReturnTypedNodeStructureMixin,
    TypeParameteredNodeStructureMixin,
    NamedNodeStructureMixin,
    JSDocableNodeStructureMixin,
    StructureMixin,
  ],
  StructureBase,
);

export class MethodDeclarationImpl
  extends MethodDeclarationStructureBase
  implements MethodDeclarationStructureClassIfc
{
  readonly kind: StructureKind.Method = StructureKind.Method;
  isStatic: boolean;
  readonly overloads: MethodDeclarationOverloadImpl[] = [];

  constructor(isStatic: boolean, name: string) {
    super();
    this.isStatic = isStatic;
    this.name = name;
  }

  /** @internal */
  public static [COPY_FIELDS](
    source: OptionalKind<MethodDeclarationStructure>,
    target: MethodDeclarationImpl,
  ): void {
    super[COPY_FIELDS](source, target);
    if (source.overloads) {
      target.overloads.push(
        ...StructureClassesMap.cloneArrayWithKind<
          MethodDeclarationOverloadStructure,
          StructureKind.MethodOverload,
          MethodDeclarationOverloadImpl
        >(
          StructureKind.MethodOverload,
          StructureClassesMap.forceArray(source.overloads),
        ),
      );
    }
  }

  /**
   * Create a `MethodDeclarationImpl` from a `MethodDeclarationStructure`.
   * @param source - The structure to clone.
   */
  public static clone(
    source: OptionalKind<MethodDeclarationStructure>,
  ): MethodDeclarationImpl {
    const target = new MethodDeclarationImpl(
      source.isStatic ?? false,
      source.name,
    );
    this[COPY_FIELDS](source, target);
    return target;
  }

  public static fromSignature(
    isStatic: boolean,
    signature: MethodSignatureImpl,
  ): MethodDeclarationImpl {
    const declaration = new MethodDeclarationImpl(isStatic, signature.name);
    declaration.docs.push(
      ...StructureClassesMap.cloneArray<JSDocImpl | string, JSDocImpl | string>(
        signature.docs,
      ),
    );
    declaration.hasQuestionToken = signature.hasQuestionToken;
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

  public toJSON(): StructureClassToJSON<MethodDeclarationImpl> {
    const rv = super.toJSON() as StructureClassToJSON<MethodDeclarationImpl>;
    rv.isStatic = this.isStatic;
    rv.kind = this.kind;
    rv.overloads = this.overloads;
    return rv;
  }
}

MethodDeclarationImpl satisfies CloneableStructure<
  MethodDeclarationStructure,
  MethodDeclarationImpl
> &
  Class<ExtractStructure<MethodDeclarationStructure["kind"]>>;
StructureClassesMap.set(StructureKind.Method, MethodDeclarationImpl);
