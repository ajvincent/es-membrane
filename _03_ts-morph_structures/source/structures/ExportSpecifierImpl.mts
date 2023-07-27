
import {
  type ExportSpecifierStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";

import type {
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";

import {
  stringOrWriterFunctionArray
} from "./utilities.mjs";
import { CloneableStructure } from "../types/CloneableStructure.mjs";

export default class ExportSpecifierImpl implements ExportSpecifierStructure
{
  leadingTrivia: stringOrWriterFunction[] = [];
  trailingTrivia: stringOrWriterFunction[] = [];
  name: string;
  alias: string | undefined;
  isTypeOnly = false;
  readonly kind: StructureKind.ExportSpecifier = StructureKind.ExportSpecifier;

  constructor(name: string) {
    this.name = name;
  }

  public static clone(
    other: OptionalKind<ExportSpecifierStructure>
  ): ExportSpecifierImpl
  {
    const clone = new ExportSpecifierImpl(other.name);

    clone.leadingTrivia = stringOrWriterFunctionArray(other.leadingTrivia);
    clone.trailingTrivia = stringOrWriterFunctionArray(other.trailingTrivia);
    clone.isTypeOnly = other.isTypeOnly ?? false;
    clone.alias = other.alias;

    return clone;
  }
}
ExportSpecifierImpl satisfies CloneableStructure<ExportSpecifierStructure>;
