import type {
  Class
} from "type-fest";

import {
  KindedStructure,
  StructureKind,
  type Structures,
} from "ts-morph";

import {
  CloneableStructure
} from "../types/CloneableStructure.js";

const StructuresClassesMap = new Map<
  StructureKind,
  CloneableStructure<Structures> & Class<KindedStructure<StructureKind>>
>;

export default StructuresClassesMap;
