// #region preamble
import {
  type ImportDeclarationStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";

import {
  ImportSpecifierImpl,
} from "../exports.js";

import StructureBase from "../base/StructureBase.js";

import StatementClassesMap from "../base/StatementClassesMap.js";

import StructuresClassesMap from "../base/StructuresClassesMap.js";

import type {
  stringOrWriterFunction
} from "../types/ts-morph-native.js";

import type {
  CloneableStructure
} from "../types/CloneableStructure.js";
import { ReplaceWriterInProperties } from "../types/ModifyWriterInTypes.js";
import { replaceWriterWithString } from "../base/utilities.js";
// #endregion preamble

export default class ImportDeclarationImpl
extends StructureBase
implements ImportDeclarationStructure
{
  readonly kind: StructureKind.ImportDeclaration = StructureKind.ImportDeclaration;
  isTypeOnly = false;
  defaultImport: string | undefined = undefined;
  namespaceImport: string | undefined = undefined;
  namedImports: (stringOrWriterFunction | ImportSpecifierImpl)[] = [];
  moduleSpecifier: string;

  constructor(
    moduleSpecifier: string
  )
  {
    super();
    this.moduleSpecifier = moduleSpecifier;
  }

  public static clone(
    other: OptionalKind<ImportDeclarationStructure>
  ): ImportDeclarationImpl
  {
    const clone = new ImportDeclarationImpl(other.moduleSpecifier);

    StructureBase.cloneTrivia(other, clone);

    clone.isTypeOnly = other.isTypeOnly ?? false;
    clone.defaultImport = other.defaultImport;
    clone.namespaceImport = other.namespaceImport;

    if (Array.isArray(other.namedImports)) {
      other.namedImports.forEach(namedImport => {
        if ((typeof namedImport === "string") || (typeof namedImport === "function"))
          clone.namedImports.push(namedImport);
        else
          clone.namedImports.push(ImportSpecifierImpl.clone(namedImport));
      });
    }
    else if (other.namedImports) {
      clone.namedImports = [other.namedImports];
    }

    return clone;
  }

  public toJSON(): ReplaceWriterInProperties<ImportDeclarationStructure>
  {
    const rv = super.toJSON() as ReplaceWriterInProperties<ImportDeclarationStructure>;
    rv.namedImports = this.namedImports.map(value => {
      if (typeof value === "object")
        return value;
      return replaceWriterWithString(value);
    });
    return rv;
  }
}
ImportDeclarationImpl satisfies CloneableStructure<ImportDeclarationStructure>;

StatementClassesMap.set(StructureKind.ImportDeclaration, ImportDeclarationImpl);
StructuresClassesMap.set(StructureKind.ImportDeclaration, ImportDeclarationImpl);
