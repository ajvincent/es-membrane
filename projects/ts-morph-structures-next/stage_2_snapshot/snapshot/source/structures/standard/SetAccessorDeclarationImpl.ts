//#region preamble
import { StructureBase } from "../../base/StructureBase.js";
import { StructureClassesMap } from "../../base/StructureClassesMap.js";
import { COPY_FIELDS } from "../../base/symbolKeys.js";
import {
  type AbstractableNodeStructureFields,
  AbstractableNodeStructureMixin,
} from "../../decorators/standard/AbstractableNodeStructureMixin.js";
import {
  type DecoratableNodeStructureFields,
  DecoratableNodeStructureMixin,
} from "../../decorators/standard/DecoratableNodeStructureMixin.js";
import {
  type JSDocableNodeStructureFields,
  JSDocableNodeStructureMixin,
} from "../../decorators/standard/JSDocableNodeStructureMixin.js";
import {
  type NamedNodeStructureFields,
  NamedNodeStructureMixin,
} from "../../decorators/standard/NamedNodeStructureMixin.js";
import {
  type ParameteredNodeStructureFields,
  ParameteredNodeStructureMixin,
} from "../../decorators/standard/ParameteredNodeStructureMixin.js";
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
import type { SetAccessorDeclarationStructureClassIfc } from "../../exports.js";
import type {
  CloneableStructure,
  ExtractStructure,
  StructureClassToJSON,
} from "../../internal-exports.js";
import { ParameterDeclarationImpl } from "./ParameterDeclarationImpl.js";
import MultiMixinBuilder from "mixin-decorators";
import {
  type OptionalKind,
  type SetAccessorDeclarationStructure,
  StructureKind,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const SetAccessorDeclarationStructureBase = MultiMixinBuilder<
  [
    AbstractableNodeStructureFields,
    DecoratableNodeStructureFields,
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
    AbstractableNodeStructureMixin,
    DecoratableNodeStructureMixin,
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

export class SetAccessorDeclarationImpl
  extends SetAccessorDeclarationStructureBase
  implements SetAccessorDeclarationStructureClassIfc
{
  readonly kind: StructureKind.SetAccessor = StructureKind.SetAccessor;
  isStatic: boolean;

  constructor(
    isStatic: boolean,
    name: string,
    setterParameter: ParameterDeclarationImpl,
  ) {
    super();
    this.isStatic = isStatic;
    this.name = name;
    this.parameters.push(setterParameter);
  }

  /**
   * Create a `SetAccessorDeclarationImpl` from a `SetAccessorDeclarationStructure`.
   * @param source - The structure to clone.
   */
  public static clone(
    source: OptionalKind<SetAccessorDeclarationStructure>,
  ): SetAccessorDeclarationImpl {
    const valueParam: ParameterDeclarationImpl = new ParameterDeclarationImpl(
      "value",
    );
    const hasSourceParameter =
      source.parameters && source.parameters.length > 0;
    const target = new SetAccessorDeclarationImpl(
      source.isStatic ?? false,
      source.name,
      valueParam,
    );
    this[COPY_FIELDS](source, target);
    if (hasSourceParameter) {
      // copy-fields included copying the existing parameter, so we have to drop our artificial one
      target.parameters.shift();
    }

    return target;
  }

  public toJSON(): StructureClassToJSON<SetAccessorDeclarationImpl> {
    const rv =
      super.toJSON() as StructureClassToJSON<SetAccessorDeclarationImpl>;
    rv.isStatic = this.isStatic;
    rv.kind = this.kind;
    return rv;
  }
}

SetAccessorDeclarationImpl satisfies CloneableStructure<
  SetAccessorDeclarationStructure,
  SetAccessorDeclarationImpl
> &
  Class<ExtractStructure<SetAccessorDeclarationStructure["kind"]>>;
StructureClassesMap.set(StructureKind.SetAccessor, SetAccessorDeclarationImpl);
