import type {
  Class,
} from "type-fest";


import {
  TypeStructure,
} from "./TypeStructure.mjs";

import {
  KindedTypeStructure,
  TypeStructureKind
} from "./TypeStructureKind.mjs";

import {
  CloneableStructure
} from "../types/CloneableStructure.mjs";

const cloneableClassesMap = new Map<
  TypeStructureKind,
  CloneableStructure<TypeStructure> & Class<KindedTypeStructure<TypeStructureKind>>
>;

export default cloneableClassesMap;
