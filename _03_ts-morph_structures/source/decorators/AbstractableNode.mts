// #region preamble
import type {
  AbstractableNodeStructure
} from "ts-morph";

import type {
  RightExtendsLeft
} from "#stage_utilities/source/types/Utility.mjs";

import type {
  StaticAndInstance
} from "#mixin_decorators/source/types/StaticAndInstance.mjs";

import type {
  SubclassDecorator
} from "#mixin_decorators/source/types/SubclassDecorator.mjs";

import StructureBase from "../base/StructureBase.mjs";

import type {
  MixinClass
} from "#mixin_decorators/source/types/MixinClass.mjs";
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
  typeof StructureBase,
  AbstractableNodeStructureFields,
  false
>;
