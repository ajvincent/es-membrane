//#region preamble
import type { AbstractableNodeStructureClassIfc } from "../../exports.js";
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
import type { AbstractableNodeStructure, Structures } from "ts-morph";
//#endregion preamble
declare const AbstractableNodeStructureKey: unique symbol;
export type AbstractableNodeStructureFields = RightExtendsLeft<
  StaticAndInstance<typeof AbstractableNodeStructureKey>,
  {
    staticFields: object;
    instanceFields: AbstractableNodeStructureClassIfc;
    symbolKey: typeof AbstractableNodeStructureKey;
  }
>;

export default function AbstractableNodeStructureMixin(
  baseClass: typeof StructureBase,
  context: ClassDecoratorContext,
): MixinClass<
  AbstractableNodeStructureFields["staticFields"],
  AbstractableNodeStructureFields["instanceFields"],
  typeof StructureBase
> {
  void context;

  class AbstractableNodeStructureMixin extends baseClass {
    isAbstract = false;

    /** @internal */
    public static [COPY_FIELDS](
      source: AbstractableNodeStructure & Structures,
      target: AbstractableNodeStructureMixin & Structures,
    ): void {
      super[COPY_FIELDS](source, target);
      target.isAbstract = source.isAbstract ?? false;
    }

    public toJSON(): StructureClassToJSON<AbstractableNodeStructureMixin> {
      const rv =
        super.toJSON() as StructureClassToJSON<AbstractableNodeStructureMixin>;
      rv.isAbstract = this.isAbstract;
      return rv;
    }
  }

  return AbstractableNodeStructureMixin;
}

AbstractableNodeStructureMixin satisfies SubclassDecorator<
  AbstractableNodeStructureFields,
  typeof StructureBase,
  false
>;
