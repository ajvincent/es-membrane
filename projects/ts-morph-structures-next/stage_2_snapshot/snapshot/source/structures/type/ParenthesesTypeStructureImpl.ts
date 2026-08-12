import { TypeStructureKind, type TypeStructures } from "../../exports.js";

import {
  type CloneableTypeStructure,
  TypeStructureClassesMap,
  TypeStructuresWithChildren,
} from "../../internal-exports.js";

/** Wrap the child type in parentheses. */
export default class ParenthesesTypeStructureImpl extends TypeStructuresWithChildren<
  TypeStructureKind.Parentheses,
  [TypeStructures]
> {
  static clone(
    other: ParenthesesTypeStructureImpl,
  ): ParenthesesTypeStructureImpl {
    return new ParenthesesTypeStructureImpl(other.childTypes[0]);
  }

  public readonly kind = TypeStructureKind.Parentheses;
  protected readonly objectType: null = null;
  public readonly childTypes: [TypeStructures];

  protected readonly startToken = "(";
  protected readonly joinChildrenToken = "";
  protected readonly endToken = ")";
  protected readonly maxChildCount = 1;

  constructor(childType: TypeStructures) {
    super();
    this.childTypes = [childType];
    this.registerCallbackForTypeStructure();
  }
}
ParenthesesTypeStructureImpl satisfies CloneableTypeStructure<ParenthesesTypeStructureImpl>;
TypeStructureClassesMap.set(
  TypeStructureKind.Parentheses,
  ParenthesesTypeStructureImpl,
);
