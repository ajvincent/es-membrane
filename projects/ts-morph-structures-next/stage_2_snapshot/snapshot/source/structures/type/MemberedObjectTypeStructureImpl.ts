import { CodeBlockWriter, Writers } from "ts-morph";

import type { AugmentedStructures } from "../../exports.js";

import { TypeStructureKind } from "../../base/TypeStructureKind.js";

import TypeStructureClassesMap from "../../base/TypeStructureClassesMap.js";

import { STRUCTURE_CHILDREN } from "../../base/symbolKeys.js";

import type { CloneableTypeStructure } from "../../types/CloneableStructure.js";

import { WRITER_FUNCTION_KEY } from "../WriterStructuresBase.js";

import { CallSignatureDeclarationImpl } from "../standard/CallSignatureDeclarationImpl.js";

import { ConstructSignatureDeclarationImpl } from "../standard/ConstructSignatureDeclarationImpl.js";

import { GetAccessorDeclarationImpl } from "../standard/GetAccessorDeclarationImpl.js";

import { IndexSignatureDeclarationImpl } from "../standard/IndexSignatureDeclarationImpl.js";

import { MethodSignatureImpl } from "../standard/MethodSignatureImpl.js";

import { PropertySignatureImpl } from "../standard/PropertySignatureImpl.js";

import { SetAccessorDeclarationImpl } from "../standard/SetAccessorDeclarationImpl.js";

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
      ...other.callSignatures.map((signature) =>
        CallSignatureDeclarationImpl.clone(signature),
      ),
    );
    membered.constructSignatures.push(
      ...other.constructSignatures.map((signature) =>
        ConstructSignatureDeclarationImpl.clone(signature),
      ),
    );
    membered.getAccessors.push(
      ...other.getAccessors.map((accessor) =>
        GetAccessorDeclarationImpl.clone(accessor),
      ),
    );
    membered.indexSignatures.push(
      ...other.indexSignatures.map((signature) =>
        IndexSignatureDeclarationImpl.clone(signature),
      ),
    );
    membered.properties.push(
      ...other.properties.map((signature) =>
        PropertySignatureImpl.clone(signature),
      ),
    );
    membered.methods.push(
      ...other.methods.map((signature) => MethodSignatureImpl.clone(signature)),
    );
    membered.setAccessors.push(
      ...other.setAccessors.map((accessor) =>
        SetAccessorDeclarationImpl.clone(accessor),
      ),
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
