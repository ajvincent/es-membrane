// #region preamble
import type {
  MixinClass,
  StaticAndInstance,
  SubclassDecorator,
} from "mixin-decorators";

import {
  TypeParameteredNodeStructure
} from "ts-morph";

import type {
  RightExtendsLeft
} from "#utilities/source/_types/Utility.js";

import {
  TypeParameterDeclarationImpl
}from "../exports.js";

import type StructureBase from "../base/StructureBase.js";
// #endregion preamble

declare const TypeParameteredNodeStructureKey: unique symbol;

export interface TypeParametersArrayOwner {
  typeParameters: (TypeParameterDeclarationImpl | string)[];
}

export type TypeParameteredNodeStructureFields = RightExtendsLeft<
  StaticAndInstance<typeof TypeParameteredNodeStructureKey>,
  {
    staticFields: {
      cloneTypeParametered(
        source: TypeParameteredNodeStructure,
        target: TypeParametersArrayOwner
      ): void;
    },

    instanceFields: {
      typeParameters: (TypeParameterDeclarationImpl | string)[]
    },

    symbolKey: typeof TypeParameteredNodeStructureKey
  }
>;

export default function TypeParameteredNode(
  baseClass: typeof StructureBase,
  context: ClassDecoratorContext
): MixinClass<
  TypeParameteredNodeStructureFields["staticFields"],
  TypeParameteredNodeStructureFields["instanceFields"],
  typeof StructureBase
>
{
  void(context);

  return class extends baseClass {
    typeParameters: TypeParameterDeclarationImpl[] = [];

    static cloneTypeParametered(
      source: TypeParameteredNodeStructure,
      target: TypeParametersArrayOwner
    ): void
    {
      target.typeParameters = TypeParameterDeclarationImpl.cloneArray(source);
    }
  }
}

TypeParameteredNode satisfies SubclassDecorator<
  TypeParameteredNodeStructureFields,
  typeof StructureBase,
  false
>;
