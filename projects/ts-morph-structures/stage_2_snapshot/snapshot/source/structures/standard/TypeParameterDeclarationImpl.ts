//#region preamble
import type {
  stringOrWriterFunction,
  StructureImpls,
  TypeParameterDeclarationStructureClassIfc,
  TypeStructures,
} from "../../exports.js";
import {
  type CloneableStructure,
  COPY_FIELDS,
  type ExtractStructure,
  type NamedNodeStructureFields,
  NamedNodeStructureMixin,
  REPLACE_WRITER_WITH_STRING,
  STRUCTURE_AND_TYPES_CHILDREN,
  StructureBase,
  StructureClassesMap,
  type StructureClassToJSON,
  type StructureFields,
  StructureMixin,
  TypeAccessors,
  TypeStructureClassesMap,
} from "../../internal-exports.js";
import MultiMixinBuilder from "mixin-decorators";
import {
  type OptionalKind,
  StructureKind,
  type TypeParameterDeclarationStructure,
  type TypeParameterVariance,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const TypeParameterDeclarationStructureBase = MultiMixinBuilder<
  [NamedNodeStructureFields, StructureFields],
  typeof StructureBase
>([NamedNodeStructureMixin, StructureMixin], StructureBase);

export default class TypeParameterDeclarationImpl
  extends TypeParameterDeclarationStructureBase
  implements TypeParameterDeclarationStructureClassIfc
{
  readonly kind: StructureKind.TypeParameter = StructureKind.TypeParameter;
  readonly #constraintManager = new TypeAccessors();
  readonly #defaultManager = new TypeAccessors();
  isConst = false;
  variance?: TypeParameterVariance = undefined;

  constructor(name: string) {
    super();
    this.name = name;
  }

  get constraint(): stringOrWriterFunction | undefined {
    return this.#constraintManager.type;
  }

  set constraint(value: stringOrWriterFunction | undefined) {
    this.#constraintManager.type = value;
  }

  get constraintStructure(): TypeStructures | undefined {
    return this.#constraintManager.typeStructure;
  }

  set constraintStructure(value: TypeStructures | undefined) {
    this.#constraintManager.typeStructure = value;
  }

  get default(): stringOrWriterFunction | undefined {
    return this.#defaultManager.type;
  }

  set default(value: stringOrWriterFunction | undefined) {
    this.#defaultManager.type = value;
  }

  get defaultStructure(): TypeStructures | undefined {
    return this.#defaultManager.typeStructure;
  }

  set defaultStructure(value: TypeStructures | undefined) {
    this.#defaultManager.typeStructure = value;
  }

  /** @internal */
  public static [COPY_FIELDS](
    source: OptionalKind<TypeParameterDeclarationStructure>,
    target: TypeParameterDeclarationImpl,
  ): void {
    super[COPY_FIELDS](source, target);
    const { constraintStructure } =
      source as unknown as TypeParameterDeclarationImpl;
    if (constraintStructure) {
      target.constraintStructure =
        TypeStructureClassesMap.clone(constraintStructure);
    } else if (source.constraint) {
      target.constraint = source.constraint;
    }

    const { defaultStructure } =
      source as unknown as TypeParameterDeclarationImpl;
    if (defaultStructure) {
      target.defaultStructure = TypeStructureClassesMap.clone(defaultStructure);
    } else if (source.default) {
      target.default = source.default;
    }

    target.isConst = source.isConst ?? false;
    if (source.variance) {
      target.variance = source.variance;
    }
  }

  public static clone(
    source: OptionalKind<TypeParameterDeclarationStructure>,
  ): TypeParameterDeclarationImpl {
    const target = new TypeParameterDeclarationImpl(source.name);
    this[COPY_FIELDS](source, target);
    return target;
  }

  /** @internal */
  public *[STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<
    StructureImpls | TypeStructures
  > {
    yield* super[STRUCTURE_AND_TYPES_CHILDREN]();
    if (typeof this.constraintStructure === "object")
      yield this.constraintStructure;
    if (typeof this.defaultStructure === "object") yield this.defaultStructure;
  }

  public toJSON(): StructureClassToJSON<TypeParameterDeclarationImpl> {
    const rv =
      super.toJSON() as StructureClassToJSON<TypeParameterDeclarationImpl>;
    if (this.constraint) {
      rv.constraint = StructureBase[REPLACE_WRITER_WITH_STRING](
        this.constraint,
      );
    } else {
      rv.constraint = undefined;
    }

    if (this.default) {
      rv.default = StructureBase[REPLACE_WRITER_WITH_STRING](this.default);
    } else {
      rv.default = undefined;
    }

    rv.isConst = this.isConst;
    rv.kind = this.kind;
    if (this.variance) {
      rv.variance = this.variance;
    } else {
      rv.variance = undefined;
    }

    return rv;
  }
}

TypeParameterDeclarationImpl satisfies CloneableStructure<
  TypeParameterDeclarationStructure,
  TypeParameterDeclarationImpl
> &
  Class<ExtractStructure<TypeParameterDeclarationStructure["kind"]>>;
StructureClassesMap.set(
  StructureKind.TypeParameter,
  TypeParameterDeclarationImpl,
);
