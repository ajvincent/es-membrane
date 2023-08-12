import type {
  Class,
} from "type-fest";

import {
  TypeStructure,
} from "../typeStructures/TypeStructure.mjs";

import {
  KindedTypeStructure,
  TypeStructureKind
} from "./TypeStructureKind.mjs";

import {
  CloneableStructure
} from "../types/CloneableStructure.mjs";

const TypeStructureClassesMap = new Map<
  TypeStructureKind,
  CloneableStructure<TypeStructure> & Class<KindedTypeStructure<TypeStructureKind>>
>;

export default TypeStructureClassesMap;
