import {
  StructureKind,
  type ExportDeclarationStructure,
} from "ts-morph";

import type {
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";

import {
  stringOrWriterFunctionArray
} from "./utilities.mjs";
import ExportSpecifierImpl from "./ExportSpecifierImpl.mjs";
import { CloneableStructure } from "../types/CloneableStructure.mjs";

import cloneableStatementsMap from "./cloneableStatements.mjs";
import AssertEntryImpl from "./AssertEntryImpl.mjs";

export default class ExportDeclarationImpl implements ExportDeclarationStructure
{
  leadingTrivia: stringOrWriterFunction[] = [];
  trailingTrivia: stringOrWriterFunction[] = [];
  isTypeOnly = false;
  namespaceExport: string | undefined = undefined;
  namedExports: (stringOrWriterFunction | ExportSpecifierImpl)[] = [];
  moduleSpecifier: string | undefined = undefined;
  assertElements?: AssertEntryImpl[] = [];
  readonly kind: StructureKind.ExportDeclaration = StructureKind.ExportDeclaration;

  public static clone(
    other: ExportDeclarationStructure
  ): ExportDeclarationImpl
  {
    const clone = new ExportDeclarationImpl;

    clone.leadingTrivia = stringOrWriterFunctionArray(other.leadingTrivia);
    clone.trailingTrivia = stringOrWriterFunctionArray(other.trailingTrivia);
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

cloneableStatementsMap.set(StructureKind.ExportDeclaration, ExportDeclarationImpl);