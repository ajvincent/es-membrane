// #region preamble
import {
  type ImportSpecifierStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";

import StructureBase from "../base/StructureBase.js";

import StructureClassesMap from "../base/StructureClassesMap.js";

import type {
  CloneableStructure
} from "../types/CloneableStructure.js";
import { ReplaceWriterInProperties } from "../types/ModifyWriterInTypes.js";
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

  public toJSON(): ReplaceWriterInProperties<ImportSpecifierStructure>
  {
    return super.toJSON() as ReplaceWriterInProperties<ImportSpecifierStructure>;
  }
}
ImportSpecifierImpl satisfies CloneableStructure<ImportSpecifierStructure>;

StructureClassesMap.set(StructureKind.ImportSpecifier, ImportSpecifierImpl);
