import type {
  Class,
} from "type-fest";

import {
  TypeStructures,
} from "../typeStructures/TypeStructures.mjs";

import {
  KindedTypeStructure,
  TypeStructureKind
} from "./TypeStructureKind.mjs";

import {
  CloneableStructure
} from "../types/CloneableStructure.mjs";

const TypeStructureClassesMap = new Map<
  TypeStructureKind,
  CloneableStructure<TypeStructures> & Class<KindedTypeStructure<TypeStructureKind>>
>;

export default TypeStructureClassesMap;
