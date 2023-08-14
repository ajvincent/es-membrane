// #region preamble
import {
  type ExportDeclarationStructure,
  StructureKind,
} from "ts-morph";

import {
  AssertEntryImpl,
  ExportSpecifierImpl,
} from "../../exports.mjs";

import StatementClassesMap from "../base/StatementClassesMap.mjs";

import StructureBase from "../base/StructureBase.mjs";

import StructuresClassesMap from "../base/StructuresClassesMap.mjs";

import type {
  CloneableStructure
} from "../types/CloneableStructure.mjs";

import type {
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";
// #endregion preamble

export default class ExportDeclarationImpl
extends StructureBase
implements ExportDeclarationStructure
{
  readonly kind: StructureKind.ExportDeclaration = StructureKind.ExportDeclaration;

  isTypeOnly = false;
  namespaceExport: string | undefined = undefined;
  namedExports: (stringOrWriterFunction | ExportSpecifierImpl)[] = [];
  moduleSpecifier: string | undefined = undefined;
  assertElements?: AssertEntryImpl[] = [];

  public static clone(
    other: ExportDeclarationStructure
  ): ExportDeclarationImpl
  {
    const clone = new ExportDeclarationImpl;

    StructureBase.cloneTrivia(other, clone);
    clone.isTypeOnly = other.isTypeOnly ?? false;
    clone.namespaceExport = other.namespaceExport;

    if (Array.isArray(other.namedExports)) {
      other.namedExports.forEach(namedExport => {
        if ((typeof namedExport === "string") || (typeof namedExport === "function"))
          clone.namedExports.push(namedExport);
        else
          clone.namedExports.push(ExportSpecifierImpl.clone(namedExport));
      });
    }
    else if (other.namedExports) {
      clone.namedExports = [other.namedExports];
    }

    clone.moduleSpecifier = other.moduleSpecifier;

    if (other.assertElements) {
      clone.assertElements = other.assertElements.map(element => AssertEntryImpl.clone(element));
    }


    return clone;
  }
}
ExportDeclarationImpl satisfies CloneableStructure<ExportDeclarationStructure>;

StatementClassesMap.set(StructureKind.ExportDeclaration, ExportDeclarationImpl);
StructuresClassesMap.set(StructureKind.ExportDeclaration, ExportDeclarationImpl);
