// #region preamble
import type {
  NameableNodeStructure
} from "ts-morph";

import type {
  RightExtendsLeft
} from "#stage_utilities/source/types/Utility.mjs";

import type {
  MixinClass
} from "#mixin_decorators/source/types/MixinClass.mjs";

import type {
  StaticAndInstance
} from "#mixin_decorators/source/types/StaticAndInstance.mjs";

import type {
  SubclassDecorator
} from "#mixin_decorators/source/types/SubclassDecorator.mjs";

import StructureBase from "../base/StructureBase.mjs";
// #endregion preamble

declare const NameableNodeStructureKey: unique symbol;

export type NameableNodeStructureFields = RightExtendsLeft<
  StaticAndInstance<typeof NameableNodeStructureKey>,
  {
    staticFields: {
      cloneNameable(
        source: NameableNodeStructure,
        target: NameableNodeStructure,
      ): void;
    },

    instanceFields: NameableNodeStructure,

    symbolKey: typeof NameableNodeStructureKey
  }
>;

export default function NameableNode(
  baseClass: typeof StructureBase,
  context: ClassDecoratorContext
): MixinClass<
  NameableNodeStructureFields["staticFields"],
  NameableNodeStructureFields["instanceFields"],
  typeof StructureBase
>
{
  void(context);
  return class extends baseClass {
    name: string | undefined = undefined;

    static cloneNameable(
      source: NameableNodeStructure,
      target: NameableNodeStructure
    ): void
    {
      target.name = source.name;
    }
  }
}

NameableNode satisfies SubclassDecorator<
  typeof StructureBase,
  NameableNodeStructureFields,
  false
>;
