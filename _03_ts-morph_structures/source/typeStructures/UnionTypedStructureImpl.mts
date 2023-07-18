import type {
  UnionTypedStructure
} from "./TypeStructure.mjs";

import {
  TypeStructureKind,
} from "./TypeStructureKind.mjs";

import ElementsTypedStructureAbstract from "./ElementsTypedStructureAbstract.mjs";

import {
  registerCallbackForTypeStructure
} from "./callbackToTypeStructureRegistry.mjs";

import cloneableClassesMap from "./cloneableClassesMap.mjs";
import type {
  CloneableStructure
} from "../types/CloneableStructure.mjs";

export default class UnionTypedStructureImpl
extends ElementsTypedStructureAbstract
implements UnionTypedStructure
{
  static clone(
    other: UnionTypedStructure
  ): UnionTypedStructure
  {
    const rv = new UnionTypedStructureImpl();
    rv.elements = other.elements.map(
      typeStructure => cloneableClassesMap.get(typeStructure.kind)!.clone(typeStructure)
    );
    return rv;
  }

  public readonly kind: TypeStructureKind.Union = TypeStructureKind.Union;

  public readonly prefix = "";
  public readonly postfix = "";
  public readonly joinCharacters = " | ";

  constructor() {
    super();
    registerCallbackForTypeStructure(this);
  }
}
UnionTypedStructureImpl satisfies CloneableStructure<UnionTypedStructure>;
