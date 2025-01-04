// #region preamble
import {
  CallSignatureDeclarationStructure,
  CodeBlockWriter,
  ConstructSignatureDeclarationStructure,
  IndexSignatureDeclarationStructure,
  MethodSignatureStructure,
  OptionalKind,
  PropertySignatureStructure,
  StructureKind,
  Writers,
} from "ts-morph";

import {
  CallSignatureDeclarationImpl,
  ConstructSignatureDeclarationImpl,
  IndexSignatureDeclarationImpl,
  MethodSignatureImpl,
  type ObjectLiteralAppendables,
  type MemberedObjectTypedStructure,
  PropertySignatureImpl,
  TypeStructureKind,
  TypeStructureClassesMap,
  TypeStructures,
} from "../exports.js"

import {
  registerCallbackForTypeStructure
} from "../base/callbackToTypeStructureRegistry.js";

import {
  cloneArrayOrUndefined
} from "../base/utilities.js";

import type {
  CloneableStructure
} from "../types/CloneableStructure.js";
// #endregion preamble

/**
 * ```typescript
 * {
 *    (callSignatureArgument) => string;
 *    new (constructSignatureArgument) => ClassName;
 *    [indexSignatureKey: string]: boolean;
 *    property: number;
 *    method(): void;
 * }
 * ```
 *
 * @see `MappedTypeTypedStructureImpl` for `{ readonly [key in keyof Foo]: boolean }`
 */
export default class MemberedObjectTypeStructureImpl
implements MemberedObjectTypedStructure
{
  readonly kind: TypeStructureKind.MemberedObject = TypeStructureKind.MemberedObject;

  readonly callSignatures: CallSignatureDeclarationImpl[] = [];
  readonly constructSignatures: ConstructSignatureDeclarationImpl[] = [];
  readonly indexSignatures: IndexSignatureDeclarationImpl[] = [];
  readonly methods: MethodSignatureImpl[] = [];
  readonly properties: PropertySignatureImpl[] = [];

  constructor(members: ObjectLiteralAppendables = []) {
    this.appendStructures(members);
    registerCallbackForTypeStructure(this);
  }

  public replaceDescendantTypes(
    filter: (typeStructure: TypeStructures) => boolean,
    replacement: TypeStructures
  ): void
  {
    this.callSignatures.forEach(signature => signature.replaceDescendantTypes(filter, replacement));
    this.constructSignatures.forEach(signature => signature.replaceDescendantTypes(filter, replacement));
    this.indexSignatures.forEach(signature => signature.replaceDescendantTypes(filter, replacement));
    this.methods.forEach(signature => signature.replaceDescendantTypes(filter, replacement));
    this.properties.forEach(signature => signature.replaceDescendantTypes(filter, replacement));
  }

  appendStructures(
    structuresContext: ObjectLiteralAppendables
  ): this
  {
    if (!Array.isArray(structuresContext)) {
      structuresContext = [
        ...structuresContext?.callSignatures ?? [],
        ...structuresContext?.constructSignatures ?? [],
        ...structuresContext?.indexSignatures ?? [],
        ...structuresContext?.methods ?? [],
        ...structuresContext?.properties ?? [],
      ];
    }

    structuresContext.forEach(structure => {
      switch (structure.kind) {
        case StructureKind.CallSignature:
          this.callSignatures.push(structure);
          return;
        case StructureKind.ConstructSignature:
          this.constructSignatures.push(structure);
          return;
        case StructureKind.IndexSignature:
          this.indexSignatures.push(structure);
          return;
        case StructureKind.MethodSignature:
          this.methods.push(structure);
          return;
        case StructureKind.PropertySignature:
          this.properties.push(structure);
          return;
      }
    });

    return this;
  }

  #writerFunction(
    writer: CodeBlockWriter
  ): void
  {
    Writers.objectType(this)(writer);
  }

  writerFunction = this.#writerFunction.bind(this);

  static clone(
    other: MemberedObjectTypedStructure
  ): MemberedObjectTypeStructureImpl
  {
    const clone = new MemberedObjectTypeStructureImpl;

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

MemberedObjectTypeStructureImpl satisfies CloneableStructure<MemberedObjectTypedStructure>;
TypeStructureClassesMap.set(TypeStructureKind.MemberedObject, MemberedObjectTypeStructureImpl);
