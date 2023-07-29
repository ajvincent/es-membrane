import {
  type ImportSpecifierStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";

import { CloneableStructure } from "../types/CloneableStructure.mjs";
import StructureBase from "../decorators/StructureBase.mjs";

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
