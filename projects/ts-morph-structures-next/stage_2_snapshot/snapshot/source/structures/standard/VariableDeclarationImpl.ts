//#region preamble
import { StructureBase } from "../../base/StructureBase.js";
import { StructureClassesMap } from "../../base/StructureClassesMap.js";
import { COPY_FIELDS } from "../../base/symbolKeys.js";
import {
  type ExclamationTokenableNodeStructureFields,
  ExclamationTokenableNodeStructureMixin,
} from "../../decorators/standard/ExclamationTokenableNodeStructureMixin.js";
import {
  type InitializerExpressionableNodeStructureFields,
  InitializerExpressionableNodeStructureMixin,
} from "../../decorators/standard/InitializerExpressionableNodeStructureMixin.js";
import {
  type NamedNodeStructureFields,
  NamedNodeStructureMixin,
} from "../../decorators/standard/NamedNodeStructureMixin.js";
import {
  type StructureFields,
  StructureMixin,
} from "../../decorators/standard/StructureMixin.js";
import {
  type TypedNodeStructureFields,
  TypedNodeStructureMixin,
} from "../../decorators/standard/TypedNodeStructureMixin.js";
import type {
  stringOrWriterFunction,
  TypeStructures,
  VariableDeclarationStructureClassIfc,
} from "../../exports.js";
import type {
  CloneableStructure,
  ExtractStructure,
  StructureClassToJSON,
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
