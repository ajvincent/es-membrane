//#region preamble
import type {
  stringOrWriterFunction,
  StructureImpls,
  TypedNodeStructureClassIfc,
  TypeStructures,
} from "../../exports.js";
import {
  COPY_FIELDS,
  REPLACE_WRITER_WITH_STRING,
  type RightExtendsLeft,
  STRUCTURE_AND_TYPES_CHILDREN,
  StructureBase,
  type StructureClassToJSON,
  TypeAccessors,
  TypeStructureClassesMap,
} from "../../internal-exports.js";
import type {
  MixinClass,
  StaticAndInstance,
  SubclassDecorator,
} from "mixin-decorators";
import type { Structures, TypedNodeStructure } from "ts-morph";
//#endregion preamble
declare const TypedNodeStructureKey: unique symbol;
export type TypedNodeStructureFields = RightExtendsLeft<
  StaticAndInstance<typeof TypedNodeStructureKey>,
  {
    staticFields: object;
    instanceFields: TypedNodeStructureClassIfc;
    symbolKey: typeof TypedNodeStructureKey;
  }
>;

export default function TypedNodeStructureMixin(
  baseClass: typeof StructureBase,
  context: ClassDecoratorContext,
): MixinClass<
  TypedNodeStructureFields["staticFields"],
  TypedNodeStructureFields["instanceFields"],
  typeof StructureBase
> {
  void context;

  class TypedNodeStructureMixin extends baseClass {
    readonly #typeManager = new TypeAccessors();

    get type(): stringOrWriterFunction | undefined {
      return this.#typeManager.type;
    }

    set type(value: stringOrWriterFunction | undefined) {
      this.#typeManager.type = value;
    }

    get typeStructure(): TypeStructures | undefined {
      return this.#typeManager.typeStructure;
    }

    set typeStructure(value: TypeStructures | undefined) {
      this.#typeManager.typeStructure = value;
    }

    /** @internal */
    public static [COPY_FIELDS](
      source: TypedNodeStructure & Structures,
      target: TypedNodeStructureMixin & Structures,
    ): void {
      super[COPY_FIELDS](source, target);
      const { typeStructure } = source as unknown as TypedNodeStructureMixin;
      if (typeStructure) {
        target.typeStructure = TypeStructureClassesMap.clone(typeStructure);
      } else if (source.type) {
        target.type = source.type;
      }
    }

    /** @internal */
    public *[STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<
      StructureImpls | TypeStructures
    > {
      yield* super[STRUCTURE_AND_TYPES_CHILDREN]();
      if (typeof this.typeStructure === "object") yield this.typeStructure;
    }

    public toJSON(): StructureClassToJSON<TypedNodeStructureMixin> {
      const rv =
        super.toJSON() as StructureClassToJSON<TypedNodeStructureMixin>;
      if (this.type) {
        rv.type = StructureBase[REPLACE_WRITER_WITH_STRING](this.type);
      } else {
        rv.type = undefined;
      }

      return rv;
    }
  }

  return TypedNodeStructureMixin;
}

TypedNodeStructureMixin satisfies SubclassDecorator<
  TypedNodeStructureFields,
  typeof StructureBase,
  false
>;
