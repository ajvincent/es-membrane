// #region preamble
import {
  TypeParameteredNodeStructure
} from "ts-morph";

import type {
  RightExtendsLeft
} from "#stage_utilities/source/types/Utility.mjs";

import {
  MixinClass
} from "#mixin_decorators/source/types/MixinClass.mjs";

import type {
  StaticAndInstance
} from "#mixin_decorators/source/types/StaticAndInstance.mjs";

import type {
  SubclassDecorator
} from "#mixin_decorators/source/types/SubclassDecorator.mjs";

import {
  TypeParameterDeclarationImpl
}from "../../exports.mjs";

import StructureBase from "../base/StructureBase.mjs";
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
  typeof StructureBase,
  TypeParameteredNodeStructureFields,
  false
>;
