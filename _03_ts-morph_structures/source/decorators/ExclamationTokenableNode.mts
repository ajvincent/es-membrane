// #region preamble
import type {
  MixinClass,
  StaticAndInstance,
  SubclassDecorator,
} from "mixin-decorators";

import type {
  ExclamationTokenableNodeStructure
} from "ts-morph";

import type {
  RightExtendsLeft
} from "#stage_utilities/source/types/Utility.mjs";

import StructureBase from "../base/StructureBase.mjs";

// #endregion preamble

declare const ExclamationTokenableNodeStructureKey: unique symbol;

export type ExclamationTokenableNodeStructureFields = RightExtendsLeft<
  StaticAndInstance<typeof ExclamationTokenableNodeStructureKey>,
  {
    staticFields: {
      cloneExclamationTokenable(
        source: ExclamationTokenableNodeStructure,
        target: Required<ExclamationTokenableNodeStructure>,
      ): void;
    };

    instanceFields: Required<ExclamationTokenableNodeStructure>;

    symbolKey: typeof ExclamationTokenableNodeStructureKey;
  }
>;

export default function ExclamationTokenableNode(
  baseClass: typeof StructureBase,
  context: ClassDecoratorContext
): MixinClass<
  ExclamationTokenableNodeStructureFields["staticFields"],
  ExclamationTokenableNodeStructureFields["instanceFields"],
  typeof StructureBase
>
{
  void(context);
  return class extends baseClass
  {
    hasExclamationToken = false;

    static cloneExclamationTokenable(
      source: ExclamationTokenableNodeStructure,
      target: Required<ExclamationTokenableNodeStructure>
    ): void
    {
      target.hasExclamationToken = source.hasExclamationToken ?? false;
    }
  }
}

ExclamationTokenableNode satisfies SubclassDecorator<
  ExclamationTokenableNodeStructureFields,
  typeof StructureBase,
  false
>;
