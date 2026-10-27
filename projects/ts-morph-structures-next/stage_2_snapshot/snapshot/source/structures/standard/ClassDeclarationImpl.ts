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
  GET_OUTER_TYPE,
  type InnerTypeElement,
  type JSDocableNodeStructureFields,
  JSDocableNodeStructureMixin,
  type NameableNodeStructureFields,
  NameableNodeStructureMixin,
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
  TypeStructureSequence,
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
    AbstractableNodeStructureFields,
    DecoratableNodeStructureFields,
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
    AbstractableNodeStructureMixin,
    DecoratableNodeStructureMixin,
    ExportableNodeStructureMixin,
    AmbientableNodeStructureMixin,
    TypeParameteredNodeStructureMixin,
    JSDocableNodeStructureMixin,
    StructureMixin,
  ],
  StructureBase,
);

export class ClassDeclarationImpl
  extends ClassDeclarationStructureBase
  implements
    ClassDeclarationStructureClassIfc,
    InnerTypeElement<ClassDeclarationImpl>
{
  readonly kind: StructureKind.Class = StructureKind.Class;
  readonly #extendsAccessors: TypeAccessors;
  readonly ctors: ConstructorDeclarationImpl[] = [];
  // overridden in constructor
  extends?: stringOrWriterFunction | undefined = undefined;
  readonly getAccessors: GetAccessorDeclarationImpl[] = [];
  readonly implements: stringOrWriterFunction[];
  readonly implementsSequence: TypeStructures[] = [];
  readonly methods: MethodDeclarationImpl[] = [];
  readonly properties: PropertyDeclarationImpl[] = [];
  readonly setAccessors: SetAccessorDeclarationImpl[] = [];
  readonly staticBlocks: ClassStaticBlockDeclarationImpl[] = [];

  constructor() {
    super();
    // extends is getting lost in ts-morph clone operations
    this.#extendsAccessors = TypeAccessors.buildTypeAccessors(this, "extends");
    this.implements = TypeStructureSequence.createProxy(
      this.implementsSequence,
    );
  }

  get extendsStructure(): TypeStructures | undefined {
    return this.#extendsAccessors.typeStructure;
  }

  set extendsStructure(value: TypeStructures | undefined) {
    this.#extendsAccessors.typeStructure = value;
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

    if (source instanceof ClassDeclarationImpl) {
      target.implementsSequence.push(
        ...TypeStructureClassesMap.cloneArray(source.implementsSequence),
      );
    } else if (Array.isArray(source.implements)) {
      target.implements.push(...source.implements);
    } else if (source.implements !== undefined) {
      target.implements.push(source.implements);
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

  /**
   * Create a `ClassDeclarationImpl` from a `ClassDeclarationStructure`.
   * @param source - The structure to clone.
   */
  public static clone(
    source: OptionalKind<ClassDeclarationStructure>,
  ): ClassDeclarationImpl {
    const target = new ClassDeclarationImpl();
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
    if (typeof this.extendsStructure === "object") yield this.extendsStructure;
    yield* this.implementsSequence;
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
