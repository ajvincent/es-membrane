import {
  CallSignatureDeclarationStructure,
  CodeBlockWriter,
  ConstructSignatureDeclarationStructure,
  IndexSignatureDeclarationStructure,
  MethodSignatureStructure,
  OptionalKind,
  PropertySignatureStructure,
  Writers,
} from "ts-morph";

import {
  CallSignatureDeclarationImpl,
  ConstructSignatureDeclarationImpl,
  IndexSignatureDeclarationImpl,
  MethodSignatureImpl,
  type ObjectLiteralTypedStructure,
  PropertySignatureImpl,
  TypeStructureKind,
  TypeStructureClassesMap,
} from "../../exports.mjs"

import {
  registerCallbackForTypeStructure
} from "../base/callbackToTypeStructureRegistry.mjs";

import {
  CloneableStructure
} from "../types/CloneableStructure.mjs";

import {
  cloneArrayOrUndefined
} from "../base/utilities.mjs";

export default class ObjectLiteralTypedStructureImpl
implements ObjectLiteralTypedStructure
{
  readonly kind: TypeStructureKind.ObjectLiteral = TypeStructureKind.ObjectLiteral;

  readonly callSignatures: CallSignatureDeclarationImpl[] = [];
  readonly constructSignatures: ConstructSignatureDeclarationImpl[] = [];
  readonly indexSignatures: IndexSignatureDeclarationImpl[] = [];
  readonly methods: MethodSignatureImpl[] = [];
  readonly properties: PropertySignatureImpl[] = [];

  constructor() {
    registerCallbackForTypeStructure(this);
  }

  writerFunction(
    writer: CodeBlockWriter
  ): void
  {
    Writers.objectType(this)(writer);
  }

  static clone(
    other: ObjectLiteralTypedStructure
  ): ObjectLiteralTypedStructureImpl
  {
    const clone = new ObjectLiteralTypedStructureImpl;

    clone.callSignatures.push(...cloneArrayOrUndefined<
      OptionalKind<CallSignatureDeclarationStructure>,
      typeof CallSignatureDeclarationImpl
    >
    (
      other.callSignatures,
      CallSignatureDeclarationImpl
    ));

    clone.constructSignatures.push(...cloneArrayOrUndefined<
      OptionalKind<ConstructSignatureDeclarationStructure>,
      typeof ConstructSignatureDeclarationImpl
    >
    (
      other.constructSignatures,
      ConstructSignatureDeclarationImpl
    ));

    clone.indexSignatures.push(...cloneArrayOrUndefined<
      OptionalKind<IndexSignatureDeclarationStructure>,
      typeof IndexSignatureDeclarationImpl
    >
    (
      other.indexSignatures,
      IndexSignatureDeclarationImpl
    ));

    clone.methods.push(...cloneArrayOrUndefined<
      OptionalKind<MethodSignatureStructure>,
      typeof MethodSignatureImpl
    >
    (
      other.methods,
      MethodSignatureImpl
    ));

    clone.properties.push(...cloneArrayOrUndefined<
      OptionalKind<PropertySignatureStructure>,
      typeof PropertySignatureImpl
    >
    (
      other.properties,
      PropertySignatureImpl
    ));

    return clone;
  }
}

ObjectLiteralTypedStructureImpl satisfies CloneableStructure<ObjectLiteralTypedStructure>;
TypeStructureClassesMap.set(TypeStructureKind.ObjectLiteral, ObjectLiteralTypedStructureImpl);
