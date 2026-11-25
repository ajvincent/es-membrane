import { CodeBlockWriter, StructureKind, Writers } from "ts-morph";

import type {
  AugmentedStructures,
  CallSignatureDeclarationImpl,
  ConstructSignatureDeclarationImpl,
  GetAccessorDeclarationImpl,
  IndexSignatureDeclarationImpl,
  MethodSignatureImpl,
  PropertySignatureImpl,
  SetAccessorDeclarationImpl,
} from "../../exports.js";

import { TypeStructureKind } from "../../base/TypeStructureKind.js";

import StructureClassesMap from "../../base/StructureClassesMap.js";
import TypeStructureClassesMap from "../../base/TypeStructureClassesMap.js";

import { STRUCTURE_CHILDREN } from "../../base/symbolKeys.js";

import type { CloneableTypeStructure } from "../../types/CloneableStructure.js";

import { WRITER_FUNCTION_KEY } from "../WriterStructuresBase.js";

import TypeStructuresBase from "./TypeStructuresBase.js";

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
export class MemberedObjectTypeStructureImpl extends TypeStructuresBase<TypeStructureKind.MemberedObject> {
  static clone(
    other: MemberedObjectTypeStructureImpl,
  ): MemberedObjectTypeStructureImpl {
    const membered = new MemberedObjectTypeStructureImpl();

    membered.callSignatures.push(
      ...(StructureClassesMap.cloneArrayWithKind(
        StructureKind.CallSignature,
        other.callSignatures,
      ) as CallSignatureDeclarationImpl[]),
    );
    membered.constructSignatures.push(
      ...(StructureClassesMap.cloneArrayWithKind(
        StructureKind.ConstructSignature,
        other.constructSignatures,
      ) as ConstructSignatureDeclarationImpl[]),
    );
    membered.getAccessors.push(
      ...(StructureClassesMap.cloneArrayWithKind(
        StructureKind.GetAccessor,
        other.getAccessors,
      ) as GetAccessorDeclarationImpl[]),
    );
    membered.indexSignatures.push(
      ...(StructureClassesMap.cloneArrayWithKind(
        StructureKind.IndexSignature,
        other.indexSignatures,
      ) as IndexSignatureDeclarationImpl[]),
    );
    membered.properties.push(
      ...(StructureClassesMap.cloneArrayWithKind(
        StructureKind.PropertySignature,
        other.properties,
      ) as PropertySignatureImpl[]),
    );
    membered.methods.push(
      ...(StructureClassesMap.cloneArrayWithKind(
        StructureKind.MethodSignature,
        other.methods,
      ) as MethodSignatureImpl[]),
    );
    membered.setAccessors.push(
      ...(StructureClassesMap.cloneArrayWithKind(
        StructureKind.SetAccessor,
        other.setAccessors,
      ) as SetAccessorDeclarationImpl[]),
    );

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

  protected [WRITER_FUNCTION_KEY](writer: CodeBlockWriter): void {
    Writers.objectType(this)(writer);
  }

  /** @internal */
  public *[STRUCTURE_CHILDREN](): IterableIterator<AugmentedStructures> {
    yield* super[STRUCTURE_CHILDREN]();
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
TypeStructureClassesMap.set(
  TypeStructureKind.MemberedObject,
  MemberedObjectTypeStructureImpl,
);
