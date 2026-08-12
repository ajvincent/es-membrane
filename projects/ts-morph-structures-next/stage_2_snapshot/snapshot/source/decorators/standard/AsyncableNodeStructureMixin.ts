//#region preamble
import type { AsyncableNodeStructureClassIfc } from "../../exports.js";
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
import type { AsyncableNodeStructure, Structures } from "ts-morph";
//#endregion preamble
declare const AsyncableNodeStructureKey: unique symbol;
export type AsyncableNodeStructureFields = RightExtendsLeft<
  StaticAndInstance<typeof AsyncableNodeStructureKey>,
  {
    staticFields: object;
    instanceFields: AsyncableNodeStructureClassIfc;
    symbolKey: typeof AsyncableNodeStructureKey;
  }
>;

export default function AsyncableNodeStructureMixin(
  baseClass: typeof StructureBase,
  context: ClassDecoratorContext,
): MixinClass<
  AsyncableNodeStructureFields["staticFields"],
  AsyncableNodeStructureFields["instanceFields"],
  typeof StructureBase
> {
  void context;

  class AsyncableNodeStructureMixin extends baseClass {
    isAsync = false;

    /** @internal */
    public static [COPY_FIELDS](
      source: AsyncableNodeStructure & Structures,
      target: AsyncableNodeStructureMixin & Structures,
    ): void {
      super[COPY_FIELDS](source, target);
      target.isAsync = source.isAsync ?? false;
    }

    public toJSON(): StructureClassToJSON<AsyncableNodeStructureMixin> {
      const rv =
        super.toJSON() as StructureClassToJSON<AsyncableNodeStructureMixin>;
      rv.isAsync = this.isAsync;
      return rv;
    }
  }

  return AsyncableNodeStructureMixin;
}

AsyncableNodeStructureMixin satisfies SubclassDecorator<
  AsyncableNodeStructureFields,
  typeof StructureBase,
  false
>;
