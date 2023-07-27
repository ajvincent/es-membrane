import type {
  IntersectionTypedStructure
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

export default class IntersectionTypedStructureImpl
extends ElementsTypedStructureAbstract
implements IntersectionTypedStructure
{
  static clone(
    other: IntersectionTypedStructure
  ): IntersectionTypedStructureImpl
  {
    const rv = new IntersectionTypedStructureImpl();
    rv.elements = other.elements.map(
      typeStructure => cloneableClassesMap.get(typeStructure.kind)!.clone(typeStructure)
    );
    return rv;
  }

  public readonly kind: TypeStructureKind.Intersection = TypeStructureKind.Intersection;

  public readonly prefix = "";
  public readonly postfix = "";
  public readonly joinCharacters = " & ";

  constructor() {
    super();
    registerCallbackForTypeStructure(this);
  }
}
IntersectionTypedStructureImpl satisfies CloneableStructure<IntersectionTypedStructure>;

cloneableClassesMap.set(TypeStructureKind.Intersection, IntersectionTypedStructureImpl);
