import { TypeStructureKind } from "../../base/TypeStructureKind.js";

import type { CloneableTypeStructure } from "../../types/CloneableStructure.js";

import TypeStructureClassesMap from "../../base/TypeStructureClassesMap.js";

import type { TypeStructures } from "./TypeStructures.js";

import TypeStructuresWithChildren from "./TypeStructuresWithChildren.js";

/** Wrap the child type in parentheses. */
export class ParenthesesTypeStructureImpl extends TypeStructuresWithChildren<
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
  }
}
ParenthesesTypeStructureImpl satisfies CloneableTypeStructure<ParenthesesTypeStructureImpl>;
TypeStructureClassesMap.set(
  TypeStructureKind.Parentheses,
  ParenthesesTypeStructureImpl,
);
