// #region preamble
import ElementsTypedStructureAbstract from "./ElementsTypedStructureAbstract.mjs";

import TypeStructureClassesMap from "../base/TypeStructureClassesMap.mjs";

import type {
  TypeStructures,
  UnionTypedStructure
} from "./TypeStructures.mjs";

import {
  TypeStructureKind,
} from "../base/TypeStructureKind.mjs";

import {
  registerCallbackForTypeStructure
} from "../base/callbackToTypeStructureRegistry.mjs";

import type {
  CloneableStructure
} from "../types/CloneableStructure.mjs";
// #endregion

/** Foo | Bar | ... */
export default class UnionTypedStructureImpl
extends ElementsTypedStructureAbstract
implements UnionTypedStructure
{
  static clone(
    other: UnionTypedStructure
  ): UnionTypedStructure
  {
    return new UnionTypedStructureImpl(
      TypeStructureClassesMap.cloneArray(other.elements)
    );
  }

  public readonly kind: TypeStructureKind.Union = TypeStructureKind.Union;

  public readonly prefix = "";
  public readonly postfix = "";
  public readonly joinCharacters = " | ";

  constructor(
    elements: TypeStructures[] = []
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
UnionTypedStructureImpl satisfies CloneableStructure<UnionTypedStructure>;

TypeStructureClassesMap.set(TypeStructureKind.Union, UnionTypedStructureImpl);
