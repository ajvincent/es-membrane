//#region preamble
import type { ReadonlyableNodeStructureClassIfc } from "../../exports.js";
import {
  COPY_FIELDS,
  type RightExtendsLeft,
  StructureBase,
  type StructureClassToJSON,
} from "../../internal-exports.js";
import type {
  MixinClass,
  StaticAndInstance,
  SubclassDecorator,
} from "mixin-decorators";
import type { ReadonlyableNodeStructure, Structures } from "ts-morph";
//#endregion preamble
declare const ReadonlyableNodeStructureKey: unique symbol;
export type ReadonlyableNodeStructureFields = RightExtendsLeft<
  StaticAndInstance<typeof ReadonlyableNodeStructureKey>,
  {
    staticFields: object;
    instanceFields: ReadonlyableNodeStructureClassIfc;
    symbolKey: typeof ReadonlyableNodeStructureKey;
  }
>;

export default function ReadonlyableNodeStructureMixin(
  baseClass: typeof StructureBase,
  context: ClassDecoratorContext,
): MixinClass<
  ReadonlyableNodeStructureFields["staticFields"],
  ReadonlyableNodeStructureFields["instanceFields"],
  typeof StructureBase
> {
  void context;

  class ReadonlyableNodeStructureMixin extends baseClass {
    isReadonly = false;

    /** @internal */
    public static [COPY_FIELDS](
      source: ReadonlyableNodeStructure & Structures,
      target: ReadonlyableNodeStructureMixin & Structures,
    ): void {
      super[COPY_FIELDS](source, target);
      target.isReadonly = source.isReadonly ?? false;
    }

    public toJSON(): StructureClassToJSON<ReadonlyableNodeStructureMixin> {
      const rv =
        super.toJSON() as StructureClassToJSON<ReadonlyableNodeStructureMixin>;
      rv.isReadonly = this.isReadonly;
      return rv;
    }
  }

  return ReadonlyableNodeStructureMixin;
}

ReadonlyableNodeStructureMixin satisfies SubclassDecorator<
  ReadonlyableNodeStructureFields,
  typeof StructureBase,
  false
>;
