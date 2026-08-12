//#region preamble
import type {
  stringOrWriterFunction,
  StructureClassIfc,
} from "../../exports.js";
import {
  COPY_FIELDS,
  REPLACE_WRITER_WITH_STRING,
  type RightExtendsLeft,
  StructureBase,
  type StructureClassToJSON,
} from "../../internal-exports.js";
import type {
  MixinClass,
  StaticAndInstance,
  SubclassDecorator,
} from "mixin-decorators";
import type { Structure, Structures } from "ts-morph";
//#endregion preamble
declare const StructureKey: unique symbol;
export type StructureFields = RightExtendsLeft<
  StaticAndInstance<typeof StructureKey>,
  {
    staticFields: object;
    instanceFields: StructureClassIfc;
    symbolKey: typeof StructureKey;
  }
>;

export default function StructureMixin(
  baseClass: typeof StructureBase,
  context: ClassDecoratorContext,
): MixinClass<
  StructureFields["staticFields"],
  StructureFields["instanceFields"],
  typeof StructureBase
> {
  void context;

  class StructureMixin extends baseClass {
    /** Leading comments or whitespace. */
    readonly leadingTrivia: stringOrWriterFunction[] = [];
    /** Trailing comments or whitespace. */
    readonly trailingTrivia: stringOrWriterFunction[] = [];

    /** @internal */
    public static [COPY_FIELDS](
      source: Structure & Structures,
      target: StructureMixin & Structures,
    ): void {
      super[COPY_FIELDS](source, target);
      if (Array.isArray(source.leadingTrivia)) {
        target.leadingTrivia.push(...source.leadingTrivia);
      } else if (source.leadingTrivia !== undefined) {
        target.leadingTrivia.push(source.leadingTrivia);
      }

      if (Array.isArray(source.trailingTrivia)) {
        target.trailingTrivia.push(...source.trailingTrivia);
      } else if (source.trailingTrivia !== undefined) {
        target.trailingTrivia.push(source.trailingTrivia);
      }
    }

    public toJSON(): StructureClassToJSON<StructureMixin> {
      const rv = super.toJSON() as StructureClassToJSON<StructureMixin>;
      rv.leadingTrivia = this.leadingTrivia.map((value) => {
        return StructureBase[REPLACE_WRITER_WITH_STRING](value);
      });
      rv.trailingTrivia = this.trailingTrivia.map((value) => {
        return StructureBase[REPLACE_WRITER_WITH_STRING](value);
      });
      return rv;
    }
  }

  return StructureMixin;
}

StructureMixin satisfies SubclassDecorator<
  StructureFields,
  typeof StructureBase,
  false
>;
