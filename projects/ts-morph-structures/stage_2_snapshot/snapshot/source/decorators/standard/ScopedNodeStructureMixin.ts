//#region preamble
import type { ScopedNodeStructureClassIfc } from "../../exports.js";
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
import type { Scope, ScopedNodeStructure, Structures } from "ts-morph";
//#endregion preamble
declare const ScopedNodeStructureKey: unique symbol;
export type ScopedNodeStructureFields = RightExtendsLeft<
  StaticAndInstance<typeof ScopedNodeStructureKey>,
  {
    staticFields: object;
    instanceFields: ScopedNodeStructureClassIfc;
    symbolKey: typeof ScopedNodeStructureKey;
  }
>;

export default function ScopedNodeStructureMixin(
  baseClass: typeof StructureBase,
  context: ClassDecoratorContext,
): MixinClass<
  ScopedNodeStructureFields["staticFields"],
  ScopedNodeStructureFields["instanceFields"],
  typeof StructureBase
> {
  void context;

  class ScopedNodeStructureMixin extends baseClass {
    scope?: Scope = undefined;

    /** @internal */
    public static [COPY_FIELDS](
      source: ScopedNodeStructure & Structures,
      target: ScopedNodeStructureMixin & Structures,
    ): void {
      super[COPY_FIELDS](source, target);
      if (source.scope) {
        target.scope = source.scope;
      }
    }

    public toJSON(): StructureClassToJSON<ScopedNodeStructureMixin> {
      const rv =
        super.toJSON() as StructureClassToJSON<ScopedNodeStructureMixin>;
      if (this.scope) {
        rv.scope = this.scope;
      } else {
        rv.scope = undefined;
      }

      return rv;
    }
  }

  return ScopedNodeStructureMixin;
}

ScopedNodeStructureMixin satisfies SubclassDecorator<
  ScopedNodeStructureFields,
  typeof StructureBase,
  false
>;
