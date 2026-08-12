import {
  CodeBlockWriter,
  Writers,
} from "ts-morph";

import {
  CallSignatureDeclarationImpl,
  ConstructSignatureDeclarationImpl,
  GetAccessorDeclarationImpl,
  IndexSignatureDeclarationImpl,
  MethodSignatureImpl,
  PropertySignatureImpl,
  SetAccessorDeclarationImpl,
  type StructureImpls,
  TypeStructureKind,
  type TypeStructures,
} from "../../../snapshot/source/exports.js";

import {
  type CloneableTypeStructure,
  STRUCTURE_AND_TYPES_CHILDREN,
  TypeStructureClassesMap,
  TypeStructuresBase,
} from "../../../snapshot/source/internal-exports.js";

/**
 * Properties, methods, getters, setters, and index signatures.  Very much like interfaces.  Usually in type aliases.
 * @example
 * ```typescript
 * {
 *    (callSignatureArgument) => string;
 *    new (constructSignatureArgument) => ClassName;
 *    get getterName(): symbol;
 *    [indexSignatureKey: string]: boolean;
 *    property: number;
 *    method(): void;
 *    set setterName(value: symbol);
 * }
 * ```
 *
 * @see `MappedTypeStructureImpl` for `{ readonly [key in keyof Foo]: boolean }`
 */
export default class MemberedObjectTypeStructureImpl
extends TypeStructuresBase<TypeStructureKind.MemberedObject>
{
  static clone(
    other: MemberedObjectTypeStructureImpl
  ): MemberedObjectTypeStructureImpl
  {
    const membered = new MemberedObjectTypeStructureImpl;

    membered.callSignatures.push(...other.callSignatures.map(
      signature => CallSignatureDeclarationImpl.clone(signature)
    ));
    membered.constructSignatures.push(...other.constructSignatures.map(
      signature => ConstructSignatureDeclarationImpl.clone(signature)
    ));
    membered.getAccessors.push(...other.getAccessors.map(
      accessor => GetAccessorDeclarationImpl.clone(accessor)
    ));
    membered.indexSignatures.push(...other.indexSignatures.map(
      signature => IndexSignatureDeclarationImpl.clone(signature)
    ));
    membered.properties.push(...other.properties.map(
      signature => PropertySignatureImpl.clone(signature)
    ));
    membered.methods.push(...other.methods.map(
      signature => MethodSignatureImpl.clone(signature)
    ));
    membered.setAccessors.push(...other.setAccessors.map(
      accessor => SetAccessorDeclarationImpl.clone(accessor)
    ));

    return membered;
  }

  readonly kind = TypeStructureKind.MemberedObject;

  readonly callSignatures: CallSignatureDeclarationImpl[] = [];
  readonly constructSignatures: ConstructSignatureDeclarationImpl[] = [];
  readonly getAccessors: GetAccessorDeclarationImpl[] = [];
  readonly indexSignatures: IndexSignatureDeclarationImpl[] = [];
  readonly methods: MethodSignatureImpl[] = [];
  readonly properties: PropertySignatureImpl[] = [];
  readonly setAccessors: SetAccessorDeclarationImpl[] = [];

  constructor() {
    super();
    this.registerCallbackForTypeStructure();
  }

  #writerFunction(
    writer: CodeBlockWriter
  ): void
  {
    Writers.objectType(this)(writer);
  }

  writerFunction = this.#writerFunction.bind(this);

  /** @internal */
  public *[STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<StructureImpls | TypeStructures>
  {
    yield* super[STRUCTURE_AND_TYPES_CHILDREN]();
    yield* this.callSignatures.values();
    yield* this.constructSignatures.values();
    yield* this.getAccessors.values();
    yield* this.indexSignatures.values();
    yield* this.methods.values();
    yield* this.properties.values();
    yield* this.setAccessors.values();
  }
}
MemberedObjectTypeStructureImpl satisfies CloneableTypeStructure<MemberedObjectTypeStructureImpl>;
TypeStructureClassesMap.set(TypeStructureKind.MemberedObject, MemberedObjectTypeStructureImpl);
