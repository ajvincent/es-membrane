// #region preamble
import type {
  CallSignatureDeclarationStructure,
  ConstructSignatureDeclarationStructure,
  IndexSignatureDeclarationStructure,
  MethodSignatureStructure,
  OptionalKind,
  PropertySignatureStructure,
  TypeElementMemberedNodeStructure
} from "ts-morph"

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
  CallSignatureDeclarationImpl,
  ConstructSignatureDeclarationImpl,
  IndexSignatureDeclarationImpl,
  MethodSignatureImpl,
  PropertySignatureImpl,
} from "../../exports.mjs";

import StructureBase from "../base/StructureBase.mjs";

import {
  cloneArrayOrUndefined
} from "../base/utilities.mjs";
// #endregion preamble

declare const TypeElementMemberedNodeStructureKey: unique symbol;

export interface TypeElementMemberedOwner {
  callSignatures: CallSignatureDeclarationImpl[];
  constructSignatures: ConstructSignatureDeclarationImpl[];
  indexSignatures: IndexSignatureDeclarationImpl[];
  methods: MethodSignatureImpl[];
  properties: PropertySignatureImpl[];
}

export type TypeElementMemberedNodeStructureFields = RightExtendsLeft<
  StaticAndInstance<typeof TypeElementMemberedNodeStructureKey>,
  {
    staticFields: {
      cloneTypeElementMembered(
        source: TypeElementMemberedNodeStructure,
        target: TypeElementMemberedOwner
      ): void;
    };

    instanceFields: TypeElementMemberedOwner;

    symbolKey: typeof TypeElementMemberedNodeStructureKey;
  }
>;

export default function TypeElementMemberedNode(
  baseClass: typeof StructureBase,
  context: ClassDecoratorContext
): MixinClass<
  TypeElementMemberedNodeStructureFields["staticFields"],
  TypeElementMemberedNodeStructureFields["instanceFields"],
  typeof StructureBase
>
{
  void(context);
  return class extends baseClass {
    callSignatures: CallSignatureDeclarationImpl[] = [];
    constructSignatures: ConstructSignatureDeclarationImpl[] = [];
    indexSignatures: IndexSignatureDeclarationImpl[] = [];
    methods: MethodSignatureImpl[] = [];
    properties: PropertySignatureImpl[] = [];

    static cloneTypeElementMembered(
      source: TypeElementMemberedNodeStructure,
      target: TypeElementMemberedOwner
    ): void
    {
      target.callSignatures = cloneArrayOrUndefined<
        OptionalKind<CallSignatureDeclarationStructure>,
        typeof CallSignatureDeclarationImpl
      >
      (
        source.callSignatures, CallSignatureDeclarationImpl
      );

      target.constructSignatures = cloneArrayOrUndefined<
        OptionalKind<ConstructSignatureDeclarationStructure>,
        typeof ConstructSignatureDeclarationImpl
      >
      (
        source.constructSignatures, ConstructSignatureDeclarationImpl
      );

      target.indexSignatures = cloneArrayOrUndefined<
        OptionalKind<IndexSignatureDeclarationStructure>,
        typeof IndexSignatureDeclarationImpl
      >
      (
        source.indexSignatures, IndexSignatureDeclarationImpl
      );

      target.methods = cloneArrayOrUndefined<
        OptionalKind<MethodSignatureStructure>,
        typeof MethodSignatureImpl
      >
      (
        source.methods, MethodSignatureImpl
      );

      target.properties = cloneArrayOrUndefined<
        OptionalKind<PropertySignatureStructure>,
        typeof PropertySignatureImpl
      >
      (
        source.properties, PropertySignatureImpl
      );
    }
  }
}

TypeElementMemberedNode satisfies SubclassDecorator<
  typeof StructureBase,
  TypeElementMemberedNodeStructureFields,
  false
>;
