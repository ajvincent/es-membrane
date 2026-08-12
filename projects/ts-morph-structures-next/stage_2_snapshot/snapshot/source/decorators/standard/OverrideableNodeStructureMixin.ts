//#region preamble
import type { OverrideableNodeStructureClassIfc } from "../../exports.js";
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
import type { OverrideableNodeStructure, Structures } from "ts-morph";
//#endregion preamble
declare const OverrideableNodeStructureKey: unique symbol;
export type OverrideableNodeStructureFields = RightExtendsLeft<
  StaticAndInstance<typeof OverrideableNodeStructureKey>,
  {
    staticFields: object;
    instanceFields: OverrideableNodeStructureClassIfc;
    symbolKey: typeof OverrideableNodeStructureKey;
  }
>;

export default function OverrideableNodeStructureMixin(
  baseClass: typeof StructureBase,
  context: ClassDecoratorContext,
): MixinClass<
  OverrideableNodeStructureFields["staticFields"],
  OverrideableNodeStructureFields["instanceFields"],
  typeof StructureBase
> {
  void context;

  class OverrideableNodeStructureMixin extends baseClass {
    hasOverrideKeyword = false;

    /** @internal */
    public static [COPY_FIELDS](
      source: OverrideableNodeStructure & Structures,
      target: OverrideableNodeStructureMixin & Structures,
    ): void {
      super[COPY_FIELDS](source, target);
      target.hasOverrideKeyword = source.hasOverrideKeyword ?? false;
    }

    public toJSON(): StructureClassToJSON<OverrideableNodeStructureMixin> {
      const rv =
        super.toJSON() as StructureClassToJSON<OverrideableNodeStructureMixin>;
      rv.hasOverrideKeyword = this.hasOverrideKeyword;
      return rv;
    }
  }

  return OverrideableNodeStructureMixin;
}

OverrideableNodeStructureMixin satisfies SubclassDecorator<
  OverrideableNodeStructureFields,
  typeof StructureBase,
  false
>;
