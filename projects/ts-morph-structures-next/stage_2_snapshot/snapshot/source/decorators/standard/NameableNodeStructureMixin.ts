//#region preamble
import type { NameableNodeStructureClassIfc } from "../../exports.js";
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
import type { NameableNodeStructure, Structures } from "ts-morph";
//#endregion preamble
declare const NameableNodeStructureKey: unique symbol;
export type NameableNodeStructureFields = RightExtendsLeft<
  StaticAndInstance<typeof NameableNodeStructureKey>,
  {
    staticFields: object;
    instanceFields: NameableNodeStructureClassIfc;
    symbolKey: typeof NameableNodeStructureKey;
  }
>;

export default function NameableNodeStructureMixin(
  baseClass: typeof StructureBase,
  context: ClassDecoratorContext,
): MixinClass<
  NameableNodeStructureFields["staticFields"],
  NameableNodeStructureFields["instanceFields"],
  typeof StructureBase
> {
  void context;

  class NameableNodeStructureMixin extends baseClass {
    name?: string = undefined;

    /** @internal */
    public static [COPY_FIELDS](
      source: NameableNodeStructure & Structures,
      target: NameableNodeStructureMixin & Structures,
    ): void {
      super[COPY_FIELDS](source, target);
      if (source.name) {
        target.name = source.name;
      }
    }

    public toJSON(): StructureClassToJSON<NameableNodeStructureMixin> {
      const rv =
        super.toJSON() as StructureClassToJSON<NameableNodeStructureMixin>;
      if (this.name) {
        rv.name = this.name;
      } else {
        rv.name = undefined;
      }

      return rv;
    }
  }

  return NameableNodeStructureMixin;
}

NameableNodeStructureMixin satisfies SubclassDecorator<
  NameableNodeStructureFields,
  typeof StructureBase,
  false
>;
