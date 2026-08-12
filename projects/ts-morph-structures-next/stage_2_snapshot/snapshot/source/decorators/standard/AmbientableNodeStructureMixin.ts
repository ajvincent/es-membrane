//#region preamble
import type { AmbientableNodeStructureClassIfc } from "../../exports.js";
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
import type { AmbientableNodeStructure, Structures } from "ts-morph";
//#endregion preamble
declare const AmbientableNodeStructureKey: unique symbol;
export type AmbientableNodeStructureFields = RightExtendsLeft<
  StaticAndInstance<typeof AmbientableNodeStructureKey>,
  {
    staticFields: object;
    instanceFields: AmbientableNodeStructureClassIfc;
    symbolKey: typeof AmbientableNodeStructureKey;
  }
>;

export default function AmbientableNodeStructureMixin(
  baseClass: typeof StructureBase,
  context: ClassDecoratorContext,
): MixinClass<
  AmbientableNodeStructureFields["staticFields"],
  AmbientableNodeStructureFields["instanceFields"],
  typeof StructureBase
> {
  void context;

  class AmbientableNodeStructureMixin extends baseClass {
    hasDeclareKeyword = false;

    /** @internal */
    public static [COPY_FIELDS](
      source: AmbientableNodeStructure & Structures,
      target: AmbientableNodeStructureMixin & Structures,
    ): void {
      super[COPY_FIELDS](source, target);
      target.hasDeclareKeyword = source.hasDeclareKeyword ?? false;
    }

    public toJSON(): StructureClassToJSON<AmbientableNodeStructureMixin> {
      const rv =
        super.toJSON() as StructureClassToJSON<AmbientableNodeStructureMixin>;
      rv.hasDeclareKeyword = this.hasDeclareKeyword;
      return rv;
    }
  }

  return AmbientableNodeStructureMixin;
}

AmbientableNodeStructureMixin satisfies SubclassDecorator<
  AmbientableNodeStructureFields,
  typeof StructureBase,
  false
>;
