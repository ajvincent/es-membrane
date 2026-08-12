//#region preamble
import type { ExclamationTokenableNodeStructureClassIfc } from "../../exports.js";
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
import type { ExclamationTokenableNodeStructure, Structures } from "ts-morph";
//#endregion preamble
declare const ExclamationTokenableNodeStructureKey: unique symbol;
export type ExclamationTokenableNodeStructureFields = RightExtendsLeft<
  StaticAndInstance<typeof ExclamationTokenableNodeStructureKey>,
  {
    staticFields: object;
    instanceFields: ExclamationTokenableNodeStructureClassIfc;
    symbolKey: typeof ExclamationTokenableNodeStructureKey;
  }
>;

export default function ExclamationTokenableNodeStructureMixin(
  baseClass: typeof StructureBase,
  context: ClassDecoratorContext,
): MixinClass<
  ExclamationTokenableNodeStructureFields["staticFields"],
  ExclamationTokenableNodeStructureFields["instanceFields"],
  typeof StructureBase
> {
  void context;

  class ExclamationTokenableNodeStructureMixin extends baseClass {
    hasExclamationToken = false;

    /** @internal */
    public static [COPY_FIELDS](
      source: ExclamationTokenableNodeStructure & Structures,
      target: ExclamationTokenableNodeStructureMixin & Structures,
    ): void {
      super[COPY_FIELDS](source, target);
      target.hasExclamationToken = source.hasExclamationToken ?? false;
    }

    public toJSON(): StructureClassToJSON<ExclamationTokenableNodeStructureMixin> {
      const rv =
        super.toJSON() as StructureClassToJSON<ExclamationTokenableNodeStructureMixin>;
      rv.hasExclamationToken = this.hasExclamationToken;
      return rv;
    }
  }

  return ExclamationTokenableNodeStructureMixin;
}

ExclamationTokenableNodeStructureMixin satisfies SubclassDecorator<
  ExclamationTokenableNodeStructureFields,
  typeof StructureBase,
  false
>;
