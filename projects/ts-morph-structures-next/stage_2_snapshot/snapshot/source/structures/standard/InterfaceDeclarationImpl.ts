//#region preamble
import type {
  CallSignatureDeclarationImpl,
  ConstructSignatureDeclarationImpl,
  GetAccessorDeclarationImpl,
  IndexSignatureDeclarationImpl,
  InterfaceDeclarationStructureClassIfc,
  MethodSignatureImpl,
  PropertySignatureImpl,
  SetAccessorDeclarationImpl,
  stringOrWriterFunction,
  StructureImpls,
  TypeStructures,
} from "../../exports.js";
import {
  type AmbientableNodeStructureFields,
  AmbientableNodeStructureMixin,
  type CloneableStructure,
  COPY_FIELDS,
  type ExportableNodeStructureFields,
  ExportableNodeStructureMixin,
  type ExtractStructure,
  GET_OUTER_TYPE,
  type InnerTypeElement,
  type JSDocableNodeStructureFields,
  JSDocableNodeStructureMixin,
  type NamedNodeStructureFields,
  NamedNodeStructureMixin,
  REPLACE_WRITER_WITH_STRING,
  STRUCTURE_AND_TYPES_CHILDREN,
  StructureBase,
  StructureClassesMap,
  type StructureClassToJSON,
  type StructureFields,
  StructureMixin,
  type TypeParameteredNodeStructureFields,
  TypeParameteredNodeStructureMixin,
  TypeStructureClassesMap,
  TypeStructureSequence,
} from "../../internal-exports.js";
import MultiMixinBuilder from "mixin-decorators";
import {
  type CallSignatureDeclarationStructure,
  type ConstructSignatureDeclarationStructure,
  type GetAccessorDeclarationStructure,
  type IndexSignatureDeclarationStructure,
  type InterfaceDeclarationStructure,
  type MethodSignatureStructure,
  type OptionalKind,
  type PropertySignatureStructure,
  type SetAccessorDeclarationStructure,
  StructureKind,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const InterfaceDeclarationStructureBase = MultiMixinBuilder<
  [
    ExportableNodeStructureFields,
    AmbientableNodeStructureFields,
    TypeParameteredNodeStructureFields,
    NamedNodeStructureFields,
    JSDocableNodeStructureFields,
    StructureFields,
  ],
  typeof StructureBase
>(
  [
    ExportableNodeStructureMixin,
    AmbientableNodeStructureMixin,
    TypeParameteredNodeStructureMixin,
    NamedNodeStructureMixin,
    JSDocableNodeStructureMixin,
    StructureMixin,
  ],
  StructureBase,
);

export class InterfaceDeclarationImpl
  extends InterfaceDeclarationStructureBase
  implements
    InterfaceDeclarationStructureClassIfc,
    InnerTypeElement<InterfaceDeclarationImpl>
{
  readonly kind: StructureKind.Interface = StructureKind.Interface;
  readonly callSignatures: CallSignatureDeclarationImpl[] = [];
  readonly constructSignatures: ConstructSignatureDeclarationImpl[] = [];
  readonly extends: stringOrWriterFunction[];
  readonly extendsSequence: TypeStructures[] = [];
  readonly getAccessors: GetAccessorDeclarationImpl[] = [];
  readonly indexSignatures: IndexSignatureDeclarationImpl[] = [];
  readonly methods: MethodSignatureImpl[] = [];
  readonly properties: PropertySignatureImpl[] = [];
  readonly setAccessors: SetAccessorDeclarationImpl[] = [];

  constructor(name: string) {
    super();
    this.extends = TypeStructureSequence.createProxy(this.extendsSequence);
    this.name = name;
  }

  /** @internal */
  public static [COPY_FIELDS](
    source: OptionalKind<InterfaceDeclarationStructure>,
    target: InterfaceDeclarationImpl,
  ): void {
    super[COPY_FIELDS](source, target);
    if (source.callSignatures) {
      target.callSignatures.push(
        ...StructureClassesMap.cloneArrayWithKind<
          CallSignatureDeclarationStructure,
          StructureKind.CallSignature,
          CallSignatureDeclarationImpl
        >(
          StructureKind.CallSignature,
          StructureClassesMap.forceArray(source.callSignatures),
        ),
      );
    }

    if (source.constructSignatures) {
      target.constructSignatures.push(
        ...StructureClassesMap.cloneArrayWithKind<
          ConstructSignatureDeclarationStructure,
          StructureKind.ConstructSignature,
          ConstructSignatureDeclarationImpl
        >(
          StructureKind.ConstructSignature,
          StructureClassesMap.forceArray(source.constructSignatures),
        ),
      );
    }

    if (source instanceof InterfaceDeclarationImpl) {
      target.extendsSequence.push(
        ...TypeStructureClassesMap.cloneArray(source.extendsSequence),
      );
    } else if (Array.isArray(source.extends)) {
      target.extends.push(...source.extends);
    } else if (source.extends !== undefined) {
      target.extends.push(source.extends);
    }

    if (source.getAccessors) {
      target.getAccessors.push(
        ...StructureClassesMap.cloneArrayWithKind<
          GetAccessorDeclarationStructure,
          StructureKind.GetAccessor,
          GetAccessorDeclarationImpl
        >(
          StructureKind.GetAccessor,
          StructureClassesMap.forceArray(source.getAccessors),
        ),
      );
    }

    if (source.indexSignatures) {
      target.indexSignatures.push(
        ...StructureClassesMap.cloneArrayWithKind<
          IndexSignatureDeclarationStructure,
          StructureKind.IndexSignature,
          IndexSignatureDeclarationImpl
        >(
          StructureKind.IndexSignature,
          StructureClassesMap.forceArray(source.indexSignatures),
        ),
      );
    }

    if (source.methods) {
      target.methods.push(
        ...StructureClassesMap.cloneArrayWithKind<
          MethodSignatureStructure,
          StructureKind.MethodSignature,
          MethodSignatureImpl
        >(
          StructureKind.MethodSignature,
          StructureClassesMap.forceArray(source.methods),
        ),
      );
    }

    if (source.properties) {
      target.properties.push(
        ...StructureClassesMap.cloneArrayWithKind<
          PropertySignatureStructure,
          StructureKind.PropertySignature,
          PropertySignatureImpl
        >(
          StructureKind.PropertySignature,
          StructureClassesMap.forceArray(source.properties),
        ),
      );
    }

    if (source.setAccessors) {
      target.setAccessors.push(
        ...StructureClassesMap.cloneArrayWithKind<
          SetAccessorDeclarationStructure,
          StructureKind.SetAccessor,
          SetAccessorDeclarationImpl
        >(
          StructureKind.SetAccessor,
          StructureClassesMap.forceArray(source.setAccessors),
        ),
      );
    }
  }

  /**
   * Create a `InterfaceDeclarationImpl` from a `InterfaceDeclarationStructure`.
   * @param source - The structure to clone.
   */
  public static clone(
    source: OptionalKind<InterfaceDeclarationStructure>,
  ): InterfaceDeclarationImpl {
    const target = new InterfaceDeclarationImpl(source.name);
    this[COPY_FIELDS](source, target);
    return target;
  }

  /** @internal */
  public [GET_OUTER_TYPE](): this {
    return this;
  }

  /** @internal */
  public *[STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<
    StructureImpls | TypeStructures
  > {
    yield* super[STRUCTURE_AND_TYPES_CHILDREN]();
    yield* this.extendsSequence;
  }

  public toJSON(): StructureClassToJSON<InterfaceDeclarationImpl> {
    const rv = super.toJSON() as StructureClassToJSON<InterfaceDeclarationImpl>;
    rv.callSignatures = this.callSignatures;
    rv.constructSignatures = this.constructSignatures;
    rv.extends = this.extends.map((value) => {
      return StructureBase[REPLACE_WRITER_WITH_STRING](value);
    });
    rv.getAccessors = this.getAccessors;
    rv.indexSignatures = this.indexSignatures;
    rv.kind = this.kind;
    rv.methods = this.methods;
    rv.properties = this.properties;
    rv.setAccessors = this.setAccessors;
    return rv;
  }
}

InterfaceDeclarationImpl satisfies CloneableStructure<
  InterfaceDeclarationStructure,
  InterfaceDeclarationImpl
> &
  Class<ExtractStructure<InterfaceDeclarationStructure["kind"]>>;
StructureClassesMap.set(StructureKind.Interface, InterfaceDeclarationImpl);
