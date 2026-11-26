//#region preamble
import { StructureBase } from "../../base/StructureBase.js";
import { StructureClassesMap } from "../../base/StructureClassesMap.js";
import { COPY_FIELDS } from "../../base/symbolKeys.js";
import {
  type AmbientableNodeStructureFields,
  AmbientableNodeStructureMixin,
} from "../../decorators/standard/AmbientableNodeStructureMixin.js";
import {
  type AsyncableNodeStructureFields,
  AsyncableNodeStructureMixin,
} from "../../decorators/standard/AsyncableNodeStructureMixin.js";
import {
  type ExportableNodeStructureFields,
  ExportableNodeStructureMixin,
} from "../../decorators/standard/ExportableNodeStructureMixin.js";
import {
  type GeneratorableNodeStructureFields,
  GeneratorableNodeStructureMixin,
} from "../../decorators/standard/GeneratorableNodeStructureMixin.js";
import {
  type JSDocableNodeStructureFields,
  JSDocableNodeStructureMixin,
} from "../../decorators/standard/JSDocableNodeStructureMixin.js";
import {
  type NameableNodeStructureFields,
  NameableNodeStructureMixin,
} from "../../decorators/standard/NameableNodeStructureMixin.js";
import {
  type ParameteredNodeStructureFields,
  ParameteredNodeStructureMixin,
} from "../../decorators/standard/ParameteredNodeStructureMixin.js";
import {
  type ReturnTypedNodeStructureFields,
  ReturnTypedNodeStructureMixin,
} from "../../decorators/standard/ReturnTypedNodeStructureMixin.js";
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
  FunctionDeclarationOverloadImpl,
  FunctionDeclarationStructureClassIfc,
} from "../../exports.js";
import {
  type CloneableStructure,
  type ExtractStructure,
  GET_OUTER_TYPE,
  type InnerTypeElement,
  type StructureClassToJSON,
} from "../../internal-exports.js";
import MultiMixinBuilder from "mixin-decorators";
import {
  type FunctionDeclarationOverloadStructure,
  type FunctionDeclarationStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const FunctionDeclarationStructureBase = MultiMixinBuilder<
  [
    NameableNodeStructureFields,
    AsyncableNodeStructureFields,
    GeneratorableNodeStructureFields,
    ExportableNodeStructureFields,
    StatementedNodeStructureFields,
    AmbientableNodeStructureFields,
    ParameteredNodeStructureFields,
    ReturnTypedNodeStructureFields,
    TypeParameteredNodeStructureFields,
    JSDocableNodeStructureFields,
    StructureFields,
  ],
  typeof StructureBase
>(
  [
    NameableNodeStructureMixin,
    AsyncableNodeStructureMixin,
    GeneratorableNodeStructureMixin,
    ExportableNodeStructureMixin,
    StatementedNodeStructureMixin,
    AmbientableNodeStructureMixin,
    ParameteredNodeStructureMixin,
    ReturnTypedNodeStructureMixin,
    TypeParameteredNodeStructureMixin,
    JSDocableNodeStructureMixin,
    StructureMixin,
  ],
  StructureBase,
);

export class FunctionDeclarationImpl
  extends FunctionDeclarationStructureBase
  implements
    FunctionDeclarationStructureClassIfc,
    InnerTypeElement<FunctionDeclarationImpl>
{
  readonly kind: StructureKind.Function = StructureKind.Function;
  readonly overloads: FunctionDeclarationOverloadImpl[] = [];

  /** @internal */
  public static [COPY_FIELDS](
    source: OptionalKind<FunctionDeclarationStructure>,
    target: FunctionDeclarationImpl,
  ): void {
    super[COPY_FIELDS](source, target);
    if (source.overloads) {
      target.overloads.push(
        ...StructureClassesMap.cloneArrayWithKind<
          FunctionDeclarationOverloadStructure,
          StructureKind.FunctionOverload,
          FunctionDeclarationOverloadImpl
        >(
          StructureKind.FunctionOverload,
          StructureClassesMap.forceArray(source.overloads),
        ),
      );
    }
  }

  /**
   * Create a `FunctionDeclarationImpl` from a `FunctionDeclarationStructure`.
   * @param source - The structure to clone.
   */
  public static clone(
    source: OptionalKind<FunctionDeclarationStructure>,
  ): FunctionDeclarationImpl {
    const target = new FunctionDeclarationImpl();
    this[COPY_FIELDS](source, target);
    return target;
  }

  /** @internal */
  public [GET_OUTER_TYPE](): this {
    return this;
  }

  public toJSON(): StructureClassToJSON<FunctionDeclarationImpl> {
    const rv = super.toJSON() as StructureClassToJSON<FunctionDeclarationImpl>;
    rv.kind = this.kind;
    rv.overloads = this.overloads;
    return rv;
  }
}

FunctionDeclarationImpl satisfies CloneableStructure<
  FunctionDeclarationStructure,
  FunctionDeclarationImpl
> &
  Class<ExtractStructure<FunctionDeclarationStructure["kind"]>>;
StructureClassesMap.set(StructureKind.Function, FunctionDeclarationImpl);
