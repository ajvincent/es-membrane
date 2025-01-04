//#region preamble
import {
  ParameterDeclarationImpl,
  type SetAccessorDeclarationStructureClassIfc,
} from "../../exports.js";
import {
  type AbstractableNodeStructureFields,
  AbstractableNodeStructureMixin,
  type CloneableStructure,
  COPY_FIELDS,
  type DecoratableNodeStructureFields,
  DecoratableNodeStructureMixin,
  type ExtractStructure,
  type JSDocableNodeStructureFields,
  JSDocableNodeStructureMixin,
  type NamedNodeStructureFields,
  NamedNodeStructureMixin,
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
} from "../../internal-exports.js";
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
    DecoratableNodeStructureFields,
    AbstractableNodeStructureFields,
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
    DecoratableNodeStructureMixin,
    AbstractableNodeStructureMixin,
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

export default class SetAccessorDeclarationImpl
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
