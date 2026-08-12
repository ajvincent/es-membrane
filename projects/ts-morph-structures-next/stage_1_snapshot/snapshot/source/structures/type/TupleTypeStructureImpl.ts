import { TypeStructureKind, type TypeStructures } from "../../exports.js";

import {
  type CloneableTypeStructure,
  TypeStructureClassesMap,
  TypeStructuresWithChildren,
} from "../../internal-exports.js";

/**
 * @example
 * `[number, boolean]`
 *
 * @see `ArrayTypeStructureImpl` for `boolean[]`
 * @see `IndexedAccessTypeStructureImpl` for `Foo["index"]`
 */
export default class TupleTypeStructureImpl extends TypeStructuresWithChildren<
  TypeStructureKind.Tuple,
  TypeStructures[]
> {
  static clone(other: TupleTypeStructureImpl): TupleTypeStructureImpl {
    return new TupleTypeStructureImpl(
      TypeStructureClassesMap.cloneArray(other.childTypes),
    );
  }

  readonly kind = TypeStructureKind.Tuple;
  protected readonly objectType: null = null;
  public childTypes: TypeStructures[];
  protected readonly startToken = "[";
  protected readonly joinChildrenToken = ", ";
  protected readonly endToken = "]";
  protected readonly maxChildCount = Infinity;

  constructor(childTypes: TypeStructures[] = []) {
    super();
    this.childTypes = childTypes;
    this.registerCallbackForTypeStructure();
  }
}
TupleTypeStructureImpl satisfies CloneableTypeStructure<TupleTypeStructureImpl>;
TypeStructureClassesMap.set(TypeStructureKind.Tuple, TupleTypeStructureImpl);
