// #region preamble
import type {
  MixinClass,
  StaticAndInstance,
  SubclassDecorator,
} from "mixin-decorators";

import type {
  AbstractableNodeStructure
} from "ts-morph";

import type {
  RightExtendsLeft
} from "#utilities/source/_types/Utility.js";

import type StructureBase from "../base/StructureBase.js";

// #endregion preamble

declare const AbstractableNodeStructureKey: unique symbol;

export type AbstractableNodeStructureFields = RightExtendsLeft<
  StaticAndInstance<typeof AbstractableNodeStructureKey>,
  {
    staticFields: {
      cloneAbstractable(
        source: AbstractableNodeStructure,
        target: Required<AbstractableNodeStructure>,
      ): void;
    },

    instanceFields: Required<AbstractableNodeStructure>,

    symbolKey: typeof AbstractableNodeStructureKey
  }
>;

export default function AbstractableNode(
  baseClass: typeof StructureBase,
  context: ClassDecoratorContext
): MixinClass<
  AbstractableNodeStructureFields["staticFields"],
  AbstractableNodeStructureFields["instanceFields"],
  typeof StructureBase
>
{
  void(context);
  return class extends baseClass {
    isAbstract = false;

    static cloneAbstractable(
      source: AbstractableNodeStructure,
      target: Required<AbstractableNodeStructure>
    ): void
    {
      target.isAbstract = source.isAbstract ?? false;
    }
  }
}

AbstractableNode satisfies SubclassDecorator<
  AbstractableNodeStructureFields,
  typeof StructureBase,
  false
>;
