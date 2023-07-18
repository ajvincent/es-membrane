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

export default class UnionTypedStructureImpl
extends ElementsTypedStructureAbstract
implements UnionTypedStructure
{
  public readonly kind: TypeStructureKind.Union = TypeStructureKind.Union;

  public readonly prefix = "";
  public readonly postfix = "";
  public readonly joinCharacters = " | ";

  constructor() {
    super();
    registerCallbackForTypeStructure(this);
  }
}
