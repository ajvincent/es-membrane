//#region preamble
import type {
  DecoratableNodeStructureClassIfc,
  DecoratorImpl,
} from "../../exports.js";
import {
  COPY_FIELDS,
  type RightExtendsLeft,
  StructureBase,
  StructureClassesMap,
  type StructureClassToJSON,
} from "../../internal-exports.js";
import type {
  MixinClass,
  StaticAndInstance,
  SubclassDecorator,
} from "mixin-decorators";
import {
  type DecoratableNodeStructure,
  type DecoratorStructure,
  StructureKind,
  type Structures,
} from "ts-morph";
//#endregion preamble
declare const DecoratableNodeStructureKey: unique symbol;
export type DecoratableNodeStructureFields = RightExtendsLeft<
  StaticAndInstance<typeof DecoratableNodeStructureKey>,
  {
    staticFields: object;
    instanceFields: DecoratableNodeStructureClassIfc;
    symbolKey: typeof DecoratableNodeStructureKey;
  }
>;

export default function DecoratableNodeStructureMixin(
  baseClass: typeof StructureBase,
  context: ClassDecoratorContext,
): MixinClass<
  DecoratableNodeStructureFields["staticFields"],
  DecoratableNodeStructureFields["instanceFields"],
  typeof StructureBase
> {
  void context;

  class DecoratableNodeStructureMixin extends baseClass {
    readonly decorators: DecoratorImpl[] = [];

    /** @internal */
    public static [COPY_FIELDS](
      source: DecoratableNodeStructure & Structures,
      target: DecoratableNodeStructureMixin & Structures,
    ): void {
      super[COPY_FIELDS](source, target);
      if (source.decorators) {
        target.decorators.push(
          ...StructureClassesMap.cloneArrayWithKind<
            DecoratorStructure,
            StructureKind.Decorator,
            DecoratorImpl
          >(
            StructureKind.Decorator,
            StructureClassesMap.forceArray(source.decorators),
          ),
        );
      }
    }

    public toJSON(): StructureClassToJSON<DecoratableNodeStructureMixin> {
      const rv =
        super.toJSON() as StructureClassToJSON<DecoratableNodeStructureMixin>;
      rv.decorators = this.decorators;
      return rv;
    }
  }

  return DecoratableNodeStructureMixin;
}

DecoratableNodeStructureMixin satisfies SubclassDecorator<
  DecoratableNodeStructureFields,
  typeof StructureBase,
  false
>;
