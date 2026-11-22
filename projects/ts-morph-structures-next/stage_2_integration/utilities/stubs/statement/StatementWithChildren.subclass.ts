import type {
  CodeBlockWriter
} from "ts-morph";

import {
  StatementStructureClassesMap
} from "../../base/StatementStructureClassesMap.js";

import {
  StatementStructureKind
} from "../../base/StatementStructureKind.js";

import {
  COPY_FIELDS,
  WRITE_BETWEEN_TRIVIA,
  WRITE_STATEMENTS_SEQUENCE,
} from "../../base/symbolKeys.js";

import type {
  CloneableStatementStructure
} from "../../types/CloneableStructure.js";

import {
  StatementWithTrivia,
} from "./StatementWithTrivia.js";

/** @example `nobody` */
export class StatementWithChildren extends StatementWithTrivia<StatementStructureKind.UnknownString> {
  public static clone(
    source: StatementWithChildren
  ): StatementWithChildren
  {
    const target = new StatementWithChildren();
    this[COPY_FIELDS](source, target);
    return target;
  }

  protected static [COPY_FIELDS](
    source: StatementWithChildren,
    target: StatementWithChildren,
  ): void
  {
    super[COPY_FIELDS](source, target);
  }

  readonly kind: StatementStructureKind.UnknownString = StatementStructureKind.UnknownString;

  protected [WRITE_BETWEEN_TRIVIA](
    writer: CodeBlockWriter
  ): void
  {
    // calls to StatementWithChildren[WRITE_STATEMENTS_SEQUENCE]() go here
  }
}
StatementWithChildren satisfies CloneableStatementStructure<StatementWithChildren>;
StatementStructureClassesMap.set(StatementStructureKind.UnknownString, StatementWithChildren);
