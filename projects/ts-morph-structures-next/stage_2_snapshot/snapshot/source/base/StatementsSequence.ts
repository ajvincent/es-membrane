import { StructureKind } from "ts-morph";

import {
  BUILD_ARRAY_WRAPPER,
  CONVERT_OUTER_TO_INNER,
  ShadowArrayImpl,
} from "../array-utilities/ShadowArrayImpl.js";

import { WriterStructuresBase } from "../structures/WriterStructuresBase.js";

import type { AugmentedStatementStructures } from "../structures/statements/AugmentedStatements.js";

import { UnknownStringStatementImpl } from "../structures/statements/UnknownStringStatementImpl.js";

import { UnknownWriterStatementImpl } from "../structures/statements/UnknownWriterStatementImpl.js";

import type { StatementStructureImpls } from "../types/StructureImplUnions.js";

import type { stringOrWriterFunction } from "../types/stringOrWriterFunction.js";

type OuterStatements = stringOrWriterFunction | StatementStructureImpls;

export class StatementsSequence extends ShadowArrayImpl<
  OuterStatements,
  AugmentedStatementStructures
> {
  public static createProxy(
    innerElements: AugmentedStatementStructures[],
  ): OuterStatements[] {
    return new StatementsSequence(innerElements).proxy;
  }

  protected [BUILD_ARRAY_WRAPPER](
    ...innerElements: AugmentedStatementStructures[]
  ): OuterStatements[] {
    return StatementsSequence.createProxy(innerElements);
  }

  protected [CONVERT_OUTER_TO_INNER](
    outerType: OuterStatements,
  ): AugmentedStatementStructures {
    if (typeof outerType === "string") {
      return new UnknownStringStatementImpl(outerType);
    }

    if (typeof outerType === "object") {
      switch (outerType.kind) {
        case StructureKind.Class:
        case StructureKind.Enum:
        case StructureKind.ExportAssignment:
        case StructureKind.ExportDeclaration:
        case StructureKind.Function:
        case StructureKind.ImportDeclaration:
        case StructureKind.Interface:
        case StructureKind.Module:
        case StructureKind.TypeAlias:
        case StructureKind.VariableStatement:
          return outerType;

        default:
          throw new Error("unknown statement: " + outerType);
      }
    }

    const structure =
      WriterStructuresBase.getWriterStructureForCallback(outerType);
    if (structure) return structure as unknown as AugmentedStatementStructures;

    return new UnknownWriterStatementImpl(outerType);
  }
}
