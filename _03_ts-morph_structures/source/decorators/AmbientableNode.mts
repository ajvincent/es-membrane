// #region preamble
import type {
  AmbientableNodeStructure
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
  typeof StructureBase,
  AmbientableNodeStructureFields,
  false
>;
