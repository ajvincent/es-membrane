
import {
  type ImportSpecifierStructure,
  type OptionalKind,
  StructureKind
} from "ts-morph";

import type {
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";

import {
  stringOrWriterFunctionArray
} from "./utilities.mjs";
import { CloneableStructure } from "../types/CloneableStructure.mjs";

export default class ImportSpecifierImpl implements ImportSpecifierStructure
{
  leadingTrivia: stringOrWriterFunction[] = [];
  trailingTrivia: stringOrWriterFunction[] = [];
  name: string;
  isTypeOnly = false;
  alias: string | undefined;
  kind: StructureKind.ImportSpecifier = StructureKind.ImportSpecifier;

  constructor(name: string) {
    this.name = name;
  }

  public static clone(
    other: OptionalKind<ImportSpecifierStructure>
  ): ImportSpecifierImpl
  {
    const clone = new ImportSpecifierImpl(other.name);

    clone.leadingTrivia = stringOrWriterFunctionArray(other.leadingTrivia);
    clone.trailingTrivia = stringOrWriterFunctionArray(other.trailingTrivia);
    clone.isTypeOnly = other.isTypeOnly ?? false;
    clone.alias = other.alias;

    return clone;
  }
}
ImportSpecifierImpl satisfies CloneableStructure<ImportSpecifierStructure>;
