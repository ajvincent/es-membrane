import {
  type SourceFileStructure,
  type StatementStructures,
  StructureKind,
} from "ts-morph";

import type {
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";

export default class SourceFileImpl implements SourceFileStructure
{
  leadingTrivia: stringOrWriterFunction[] = [];
  trailingTrivia: stringOrWriterFunction[] = [];
  readonly kind: StructureKind.SourceFile = StructureKind.SourceFile;
  statements: (stringOrWriterFunction | StatementStructures)[] = [];
}
