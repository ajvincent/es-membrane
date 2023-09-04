// #region preamble
import type {
  MixinClass,
  SubclassDecorator,
  StaticAndInstance
} from "mixin-decorators";

import type {
  AmbientableNodeStructure
} from "ts-morph";

import type {
  RightExtendsLeft
} from "#stage_utilities/source/types/Utility.mjs";

import StructureBase from "../base/StructureBase.mjs";

// #endregion preamble

declare const AmbientableNodeStructureKey: unique symbol;

export type AmbientableNodeStructureFields = RightExtendsLeft<
  StaticAndInstance<typeof AmbientableNodeStructureKey>,
  {
    staticFields: {
      cloneAmbientable(
        source: AmbientableNodeStructure,
        target: Required<AmbientableNodeStructure>,
      ): void;
    };

    instanceFields: Required<AmbientableNodeStructure>;

    symbolKey: typeof AmbientableNodeStructureKey;
  }
>;

export default function AmbientableNode(
  baseClass: typeof StructureBase,
  context: ClassDecoratorContext
): MixinClass<
  AmbientableNodeStructureFields["staticFields"],
  AmbientableNodeStructureFields["instanceFields"],
  typeof StructureBase
>
{
  void(context);
  return class extends baseClass
  {
    hasDeclareKeyword = false;

    static cloneAmbientable(
      source: AmbientableNodeStructure,
      target: Required<AmbientableNodeStructure>
    ): void
    {
      target.hasDeclareKeyword = source.hasDeclareKeyword ?? false;
    }
  }
}

AmbientableNode satisfies SubclassDecorator<
  AmbientableNodeStructureFields,
  typeof StructureBase,
  false
>;
