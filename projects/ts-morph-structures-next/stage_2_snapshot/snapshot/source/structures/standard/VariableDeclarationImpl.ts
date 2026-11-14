//#region preamble
import type {
  stringOrWriterFunction,
  TypeStructures,
  VariableDeclarationStructureClassIfc,
} from "../../exports.js";
import {
  type CloneableStructure,
  COPY_FIELDS,
  type ExclamationTokenableNodeStructureFields,
  ExclamationTokenableNodeStructureMixin,
  type ExtractStructure,
  type InitializerExpressionableNodeStructureFields,
  InitializerExpressionableNodeStructureMixin,
  type NamedNodeStructureFields,
  NamedNodeStructureMixin,
  StructureBase,
  StructureClassesMap,
  type StructureClassToJSON,
  type StructureFields,
  StructureMixin,
  type TypedNodeStructureFields,
  TypedNodeStructureMixin,
} from "../../internal-exports.js";
import MultiMixinBuilder from "mixin-decorators";
import {
  type OptionalKind,
  StructureKind,
  type VariableDeclarationStructure,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const VariableDeclarationStructureBase = MultiMixinBuilder<
  [
    ExclamationTokenableNodeStructureFields,
    TypedNodeStructureFields,
    InitializerExpressionableNodeStructureFields,
    NamedNodeStructureFields,
    StructureFields,
  ],
  typeof StructureBase
>(
  [
    ExclamationTokenableNodeStructureMixin,
    TypedNodeStructureMixin,
    InitializerExpressionableNodeStructureMixin,
    NamedNodeStructureMixin,
    StructureMixin,
  ],
  StructureBase,
);

export class VariableDeclarationImpl
  extends VariableDeclarationStructureBase
  implements VariableDeclarationStructureClassIfc
{
  readonly kind: StructureKind.VariableDeclaration =
    StructureKind.VariableDeclaration;

  constructor(
    name: string,
    typeStructure?: TypeStructures,
    initializer?: stringOrWriterFunction,
  ) {
    super();
    this.name = name;
    if (typeStructure !== undefined) this.typeStructure = typeStructure;
    if (initializer !== undefined) this.initializer = initializer;
  }

  /**
   * Create a `VariableDeclarationImpl` from a `VariableDeclarationStructure`.
   * @param source - The structure to clone.
   */
  public static clone(
    source: OptionalKind<VariableDeclarationStructure>,
  ): VariableDeclarationImpl {
    const target = new VariableDeclarationImpl(source.name);
    this[COPY_FIELDS](source, target);
    return target;
  }

  public toJSON(): StructureClassToJSON<VariableDeclarationImpl> {
    const rv = super.toJSON() as StructureClassToJSON<VariableDeclarationImpl>;
    rv.kind = this.kind;
    return rv;
  }
}

VariableDeclarationImpl satisfies CloneableStructure<
  VariableDeclarationStructure,
  VariableDeclarationImpl
> &
  Class<ExtractStructure<VariableDeclarationStructure["kind"]>>;
StructureClassesMap.set(
  StructureKind.VariableDeclaration,
  VariableDeclarationImpl,
);
