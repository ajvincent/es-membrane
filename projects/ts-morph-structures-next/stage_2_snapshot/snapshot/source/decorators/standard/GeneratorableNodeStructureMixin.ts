//#region preamble
import type { GeneratorableNodeStructureClassIfc } from "../../exports.js";
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
import type { GeneratorableNodeStructure, Structures } from "ts-morph";
//#endregion preamble
declare const GeneratorableNodeStructureKey: unique symbol;
export type GeneratorableNodeStructureFields = RightExtendsLeft<
  StaticAndInstance<typeof GeneratorableNodeStructureKey>,
  {
    staticFields: object;
    instanceFields: GeneratorableNodeStructureClassIfc;
    symbolKey: typeof GeneratorableNodeStructureKey;
  }
>;

export default function GeneratorableNodeStructureMixin(
  baseClass: typeof StructureBase,
  context: ClassDecoratorContext,
): MixinClass<
  GeneratorableNodeStructureFields["staticFields"],
  GeneratorableNodeStructureFields["instanceFields"],
  typeof StructureBase
> {
  void context;

  class GeneratorableNodeStructureMixin extends baseClass {
    isGenerator = false;

    /** @internal */
    public static [COPY_FIELDS](
      source: GeneratorableNodeStructure & Structures,
      target: GeneratorableNodeStructureMixin & Structures,
    ): void {
      super[COPY_FIELDS](source, target);
      target.isGenerator = source.isGenerator ?? false;
    }

    public toJSON(): StructureClassToJSON<GeneratorableNodeStructureMixin> {
      const rv =
        super.toJSON() as StructureClassToJSON<GeneratorableNodeStructureMixin>;
      rv.isGenerator = this.isGenerator;
      return rv;
    }
  }

  return GeneratorableNodeStructureMixin;
}

GeneratorableNodeStructureMixin satisfies SubclassDecorator<
  GeneratorableNodeStructureFields,
  typeof StructureBase,
  false
>;
