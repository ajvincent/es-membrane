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

class TypeStructureClassesMapClass extends Map<
  TypeStructureKind,
  CloneableStructure<TypeStructures> & Class<KindedTypeStructure<TypeStructureKind>>
>
{
  clone(
    structure: TypeStructures
  ): TypeStructures
  {
    return this.get(structure.kind)!.clone(structure);
  }

  cloneArray(
    structures: TypeStructures[]
  ): TypeStructures[]
  {
    return structures.map(structure => this.clone(structure));
  }
}

const TypeStructureClassesMap = new TypeStructureClassesMapClass;

export default TypeStructureClassesMap;
