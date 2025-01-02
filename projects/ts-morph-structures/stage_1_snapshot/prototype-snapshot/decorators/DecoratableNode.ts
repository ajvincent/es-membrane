// #region preamble
import type {
  MixinClass,
  StaticAndInstance,
  SubclassDecorator,
} from "mixin-decorators";

import type {
  OptionalKind,
  DecoratableNodeStructure,
  DecoratorStructure,
} from "ts-morph";

import type {
  RightExtendsLeft
} from "#utilities/source/_types/Utility.js";

import type StructureBase from "../base/StructureBase.js";

import DecoratorImpl from "../structures/DecoratorImpl.js";
import {
  cloneArrayOrUndefined
} from "../base/utilities.js";
// #endregion preamble

declare const DecoratableNodeStructureKey: unique symbol;

export interface DecoratorsArrayOwner {
  decorators: DecoratorImpl[];
}

export type DecoratableNodeStructureFields = RightExtendsLeft<
  StaticAndInstance<typeof DecoratableNodeStructureKey>,
  {
    staticFields: {
      cloneDecoratable(
        source: DecoratableNodeStructure,
        target: DecoratorsArrayOwner
      ): void;
    };

    instanceFields: DecoratorsArrayOwner;

    symbolKey: typeof DecoratableNodeStructureKey;
  }
>;

export default function DecoratableNode(
  baseClass: typeof StructureBase,
  context: ClassDecoratorContext
): MixinClass<
  DecoratableNodeStructureFields["staticFields"],
  DecoratableNodeStructureFields["instanceFields"],
  typeof StructureBase
>
{
  void(context);
  return class extends baseClass
  {
    decorators: DecoratorImpl[] = [];

    static cloneDecoratable(
      source: DecoratableNodeStructure,
      target: DecoratorsArrayOwner
    ): void
    {
      target.decorators = cloneArrayOrUndefined<
        OptionalKind<DecoratorStructure>, typeof DecoratorImpl
      >
      (
        source.decorators, DecoratorImpl
      );
    }
  }
}

DecoratableNode satisfies SubclassDecorator<
  DecoratableNodeStructureFields,
  typeof StructureBase,
  false
>;
