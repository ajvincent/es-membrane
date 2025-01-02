//#region preamble
import type {
  ClassDeclarationStructureClassIfc,
  ClassStaticBlockDeclarationImpl,
  ConstructorDeclarationImpl,
  GetAccessorDeclarationImpl,
  MethodDeclarationImpl,
  PropertyDeclarationImpl,
  SetAccessorDeclarationImpl,
  stringOrWriterFunction,
  StructureImpls,
  TypeStructures,
  TypeStructureSet,
} from "../../exports.js";
import {
  type AbstractableNodeStructureFields,
  AbstractableNodeStructureMixin,
  type AmbientableNodeStructureFields,
  AmbientableNodeStructureMixin,
  type CloneableStructure,
  COPY_FIELDS,
  type DecoratableNodeStructureFields,
  DecoratableNodeStructureMixin,
  type ExportableNodeStructureFields,
  ExportableNodeStructureMixin,
  type ExtractStructure,
  type JSDocableNodeStructureFields,
  JSDocableNodeStructureMixin,
  type NameableNodeStructureFields,
  NameableNodeStructureMixin,
  ReadonlyArrayProxyHandler,
  REPLACE_WRITER_WITH_STRING,
  STRUCTURE_AND_TYPES_CHILDREN,
  StructureBase,
  StructureClassesMap,
  type StructureClassToJSON,
  type StructureFields,
  StructureMixin,
  TypeAccessors,
  type TypeParameteredNodeStructureFields,
  TypeParameteredNodeStructureMixin,
  TypeStructureClassesMap,
  TypeStructureSetInternal,
} from "../../internal-exports.js";
import MultiMixinBuilder from "mixin-decorators";
import {
  type ClassDeclarationStructure,
  type ClassStaticBlockDeclarationStructure,
  type ConstructorDeclarationStructure,
  type GetAccessorDeclarationStructure,
  type MethodDeclarationStructure,
  type OptionalKind,
  type PropertyDeclarationStructure,
  type SetAccessorDeclarationStructure,
  StructureKind,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const ClassDeclarationStructureBase = MultiMixinBuilder<
  [
    NameableNodeStructureFields,
    DecoratableNodeStructureFields,
    AbstractableNodeStructureFields,
    ExportableNodeStructureFields,
    AmbientableNodeStructureFields,
    TypeParameteredNodeStructureFields,
    JSDocableNodeStructureFields,
    StructureFields,
  ],
  typeof StructureBase
>(
  [
    NameableNodeStructureMixin,
    DecoratableNodeStructureMixin,
    AbstractableNodeStructureMixin,
    ExportableNodeStructureMixin,
    AmbientableNodeStructureMixin,
    TypeParameteredNodeStructureMixin,
    JSDocableNodeStructureMixin,
    StructureMixin,
  ],
  StructureBase,
);

export default class ClassDeclarationImpl
  extends ClassDeclarationStructureBase
  implements ClassDeclarationStructureClassIfc
{
  static readonly #implementsArrayReadonlyHandler =
    new ReadonlyArrayProxyHandler(
      "The implements array is read-only.  Please use this.implementsSet to set strings and type structures.",
    );
  readonly kind: StructureKind.Class = StructureKind.Class;
  readonly #extendsManager = new TypeAccessors();
  readonly #implements_ShadowArray: stringOrWriterFunction[] = [];
  readonly #implementsProxyArray = new Proxy<stringOrWriterFunction[]>(
    this.#implements_ShadowArray,
    ClassDeclarationImpl.#implementsArrayReadonlyHandler,
  );
  readonly ctors: ConstructorDeclarationImpl[] = [];
  readonly getAccessors: GetAccessorDeclarationImpl[] = [];
  readonly implementsSet: TypeStructureSet = new TypeStructureSetInternal(
    this.#implements_ShadowArray,
  );
  readonly methods: MethodDeclarationImpl[] = [];
  readonly properties: PropertyDeclarationImpl[] = [];
  readonly setAccessors: SetAccessorDeclarationImpl[] = [];
  readonly staticBlocks: ClassStaticBlockDeclarationImpl[] = [];

  get extends(): stringOrWriterFunction | undefined {
    return this.#extendsManager.type;
  }

  set extends(value: stringOrWriterFunction | undefined) {
    this.#extendsManager.type = value;
  }

  get extendsStructure(): TypeStructures | undefined {
    return this.#extendsManager.typeStructure;
  }

  set extendsStructure(value: TypeStructures | undefined) {
    this.#extendsManager.typeStructure = value;
  }

  /** Treat this as a read-only array.  Use `.implementsSet` to modify this. */
  get implements(): stringOrWriterFunction[] {
    return this.#implementsProxyArray;
  }

  /** @internal */
  public static [COPY_FIELDS](
    source: OptionalKind<ClassDeclarationStructure>,
    target: ClassDeclarationImpl,
  ): void {
    super[COPY_FIELDS](source, target);
    if (source.ctors) {
      target.ctors.push(
        ...StructureClassesMap.cloneArrayWithKind<
          ConstructorDeclarationStructure,
          StructureKind.Constructor,
          ConstructorDeclarationImpl
        >(
          StructureKind.Constructor,
          StructureClassesMap.forceArray(source.ctors),
        ),
      );
    }

    const { extendsStructure } = source as unknown as ClassDeclarationImpl;
    if (extendsStructure) {
      target.extendsStructure = TypeStructureClassesMap.clone(extendsStructure);
    } else if (source.extends) {
      target.extends = source.extends;
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

    const { implementsSet } = source as unknown as ClassDeclarationImpl;
    if (implementsSet instanceof TypeStructureSetInternal) {
      target.implementsSet.cloneFromTypeStructureSet(implementsSet);
    } else if (Array.isArray(source.implements)) {
      target.implementsSet.replaceFromTypeArray(source.implements);
    } else if (typeof source.implements === "function") {
      target.implementsSet.replaceFromTypeArray([source.implements]);
    }

    if (source.methods) {
      target.methods.push(
        ...StructureClassesMap.cloneArrayWithKind<
          MethodDeclarationStructure,
          StructureKind.Method,
          MethodDeclarationImpl
        >(StructureKind.Method, StructureClassesMap.forceArray(source.methods)),
      );
    }

    if (source.properties) {
      target.properties.push(
        ...StructureClassesMap.cloneArrayWithKind<
          PropertyDeclarationStructure,
          StructureKind.Property,
          PropertyDeclarationImpl
        >(
          StructureKind.Property,
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

    if (source.staticBlocks) {
      target.staticBlocks.push(
        ...StructureClassesMap.cloneArrayWithKind<
          ClassStaticBlockDeclarationStructure,
          StructureKind.ClassStaticBlock,
          ClassStaticBlockDeclarationImpl
        >(
          StructureKind.ClassStaticBlock,
          StructureClassesMap.forceArray(source.staticBlocks),
        ),
      );
    }
  }

  public static clone(
    source: OptionalKind<ClassDeclarationStructure>,
  ): ClassDeclarationImpl {
    const target = new ClassDeclarationImpl();
    this[COPY_FIELDS](source, target);
    return target;
  }

  /** @internal */
  public *[STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<
    StructureImpls | TypeStructures
  > {
    yield* super[STRUCTURE_AND_TYPES_CHILDREN]();
    if (typeof this.extendsStructure === "object") yield this.extendsStructure;
    for (const typeStructure of this.implementsSet) {
      if (typeof typeStructure === "object") yield typeStructure;
    }
  }

  public toJSON(): StructureClassToJSON<ClassDeclarationImpl> {
    const rv = super.toJSON() as StructureClassToJSON<ClassDeclarationImpl>;
    rv.ctors = this.ctors;
    if (this.extends) {
      rv.extends = StructureBase[REPLACE_WRITER_WITH_STRING](this.extends);
    } else {
      rv.extends = undefined;
    }

    rv.getAccessors = this.getAccessors;
    rv.implements = this.implements.map((value) => {
      return StructureBase[REPLACE_WRITER_WITH_STRING](value);
    });
    rv.kind = this.kind;
    rv.methods = this.methods;
    rv.properties = this.properties;
    rv.setAccessors = this.setAccessors;
    rv.staticBlocks = this.staticBlocks;
    return rv;
  }
}

ClassDeclarationImpl satisfies CloneableStructure<
  ClassDeclarationStructure,
  ClassDeclarationImpl
> &
  Class<ExtractStructure<ClassDeclarationStructure["kind"]>>;
StructureClassesMap.set(StructureKind.Class, ClassDeclarationImpl);
