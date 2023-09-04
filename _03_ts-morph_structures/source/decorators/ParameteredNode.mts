// #region preamble
import type {
  MixinClass,
  StaticAndInstance,
  SubclassDecorator,
} from "mixin-decorators";

import {
  OptionalKind,
  ParameterDeclarationStructure,
  ParameteredNodeStructure,
} from "ts-morph";

import type {
  RightExtendsLeft
} from "#stage_utilities/source/types/Utility.mjs";

import StructureBase from "../base/StructureBase.mjs";

import {
  cloneArrayOrUndefined
} from "../base/utilities.mjs";

import ParameterDeclarationImpl from "../structures/ParameterDeclarationImpl.mjs";
// #endregion preamble

declare const ParameteredNodeStructureKey: unique symbol;

export interface ParametersArrayOwner {
  parameters: ParameterDeclarationImpl[];
}

export type ParameteredNodeStructureFields = RightExtendsLeft<
  StaticAndInstance<typeof ParameteredNodeStructureKey>,
  {
    staticFields: {
      cloneParametered(
        source: ParameteredNodeStructure,
        target: ParametersArrayOwner
      ): void;
    },

    instanceFields: ParametersArrayOwner,

    symbolKey: typeof ParameteredNodeStructureKey;
  }
>;

export default function ParameteredNode(
  baseClass: typeof StructureBase,
  context: ClassDecoratorContext
): MixinClass<
  ParameteredNodeStructureFields["staticFields"],
  ParameteredNodeStructureFields["instanceFields"],
  typeof StructureBase
>
{
  void(context);
  return class extends baseClass {
    parameters: ParameterDeclarationImpl[] = [];

    static cloneParametered(
      source: ParameteredNodeStructure,
      target: ParametersArrayOwner
    ): void
    {
      target.parameters = cloneArrayOrUndefined<
        OptionalKind<ParameterDeclarationStructure>,
        typeof ParameterDeclarationImpl
      >
      (source.parameters, ParameterDeclarationImpl);
    }
  }
}
ParameteredNode satisfies SubclassDecorator<
  ParameteredNodeStructureFields,
  typeof StructureBase,
  false
>;
