//#region preamble
import type { NamedNodeStructureClassIfc } from "../../exports.js";
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
import type { NamedNodeStructure, Structures } from "ts-morph";
//#endregion preamble
declare const NamedNodeStructureKey: unique symbol;
export type NamedNodeStructureFields = RightExtendsLeft<
  StaticAndInstance<typeof NamedNodeStructureKey>,
  {
    staticFields: object;
    instanceFields: NamedNodeStructureClassIfc;
    symbolKey: typeof NamedNodeStructureKey;
  }
>;

export default function NamedNodeStructureMixin(
  baseClass: typeof StructureBase,
  context: ClassDecoratorContext,
): MixinClass<
  NamedNodeStructureFields["staticFields"],
  NamedNodeStructureFields["instanceFields"],
  typeof StructureBase
> {
  void context;

  class NamedNodeStructureMixin extends baseClass {
    name = "";

    /** @internal */
    public static [COPY_FIELDS](
      source: NamedNodeStructure & Structures,
      target: NamedNodeStructureMixin & Structures,
    ): void {
      super[COPY_FIELDS](source, target);
      target.name = source.name;
    }

    public toJSON(): StructureClassToJSON<NamedNodeStructureMixin> {
      const rv =
        super.toJSON() as StructureClassToJSON<NamedNodeStructureMixin>;
      rv.name = this.name;
      return rv;
    }
  }

  return NamedNodeStructureMixin;
}

NamedNodeStructureMixin satisfies SubclassDecorator<
  NamedNodeStructureFields,
  typeof StructureBase,
  false
>;
