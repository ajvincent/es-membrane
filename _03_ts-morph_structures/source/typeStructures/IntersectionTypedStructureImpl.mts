// #region preamble
import ElementsTypedStructureAbstract from "./ElementsTypedStructureAbstract.mjs";

import type {
  IntersectionTypedStructure,
  TypeStructures
} from "./TypeStructures.mjs";

import TypeStructureClassesMap from "../base/TypeStructureClassesMap.mjs";

import {
  TypeStructureKind,
} from "../base/TypeStructureKind.mjs";

import {
  registerCallbackForTypeStructure
} from "../base/callbackToTypeStructureRegistry.mjs";

import type {
  CloneableStructure
} from "../types/CloneableStructure.mjs";
// #endregion preamble

/** Foo & Bar & ... */
export default class IntersectionTypedStructureImpl
extends ElementsTypedStructureAbstract
implements IntersectionTypedStructure
{
  static clone(
    other: IntersectionTypedStructure
  ): IntersectionTypedStructureImpl
  {
    return new IntersectionTypedStructureImpl(
      TypeStructureClassesMap.cloneArray(other.elements)
    );
  }

  public readonly kind: TypeStructureKind.Intersection = TypeStructureKind.Intersection;

  public readonly prefix = "";
  public readonly postfix = "";
  public readonly joinCharacters = " & ";

  constructor(
    elements: TypeStructures[] = [],
  )
  {
    super();
    this.appendStructures(elements);
    registerCallbackForTypeStructure(this);
  }

  appendStructures(
    structuresContext: TypeStructures[]
  ): this
  {
    this.elements.push(...structuresContext);
    return this;
  }
}
IntersectionTypedStructureImpl satisfies CloneableStructure<IntersectionTypedStructure>;

TypeStructureClassesMap.set(TypeStructureKind.Intersection, IntersectionTypedStructureImpl);
