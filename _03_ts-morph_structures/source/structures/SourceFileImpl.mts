import {
  type SourceFileStructure,
  type StatementStructures,
  StructureKind,
} from "ts-morph";

import type {
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";
import StructureBase from "../decorators/StructureBase.mjs";

export default class SourceFileImpl
extends StructureBase
implements SourceFileStructure
{
  readonly kind: StructureKind.SourceFile = StructureKind.SourceFile;
  statements: (stringOrWriterFunction | StatementStructures)[] = [];
}
