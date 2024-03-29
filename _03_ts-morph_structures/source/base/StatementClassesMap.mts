import type {
  Class,
} from "type-fest";

import {
  KindedStructure,
  StructureKind,
  StatementStructures
} from "ts-morph";

import {
  CloneableStructure
} from "../types/CloneableStructure.mjs";

const StatementClassesMap = new Map<
  StructureKind,
  CloneableStructure<StatementStructures> & Class<KindedStructure<StructureKind>>
>;

export default StatementClassesMap;
