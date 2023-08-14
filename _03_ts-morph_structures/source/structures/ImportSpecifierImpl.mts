// #region preamble
import {
  type ImportSpecifierStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";

import StructureBase from "../base/StructureBase.mjs";

import StructuresClassesMap from "../base/StructuresClassesMap.mjs";

import type {
  CloneableStructure
} from "../types/CloneableStructure.mjs";
// #endregion preamble

export default class ImportSpecifierImpl
extends StructureBase
implements ImportSpecifierStructure
{
  readonly kind: StructureKind.ImportSpecifier = StructureKind.ImportSpecifier;
  name: string;
  isTypeOnly = false;
  alias: string | undefined;

  constructor(name: string) {
    super();
    this.name = name;
  }

  public static clone(
    other: OptionalKind<ImportSpecifierStructure>
  ): ImportSpecifierImpl
  {
    const clone = new ImportSpecifierImpl(other.name);

    StructureBase.cloneTrivia(other, clone);
    clone.isTypeOnly = other.isTypeOnly ?? false;
    clone.alias = other.alias;

    return clone;
  }
}
ImportSpecifierImpl satisfies CloneableStructure<ImportSpecifierStructure>;

StructuresClassesMap.set(StructureKind.ImportSpecifier, ImportSpecifierImpl);
