// #region preamble
import type {
  MixinClass,
  StaticAndInstance,
  SubclassDecorator,
} from "mixin-decorators";

import type {
  NameableNodeStructure
} from "ts-morph";

import type {
  RightExtendsLeft
} from "#utilities/source/_types/Utility.js";

import type StructureBase from "../base/StructureBase.js";
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
  NameableNodeStructureFields,
  typeof StructureBase,
  false
>;
