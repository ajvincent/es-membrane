// #region preamble
import type {
  MixinClass,
  StaticAndInstance,
  SubclassDecorator,
} from "mixin-decorators";

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
} from "#utilities/source/_types/Utility.js";

import {
  CallSignatureDeclarationImpl,
  ConstructSignatureDeclarationImpl,
  IndexSignatureDeclarationImpl,
  MethodSignatureImpl,
  PropertySignatureImpl,
} from "../exports.js";

import type StructureBase from "../base/StructureBase.js";

import {
  cloneArrayOrUndefined
} from "../base/utilities.js";
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
  TypeElementMemberedNodeStructureFields,
  typeof StructureBase,
  false
>;
