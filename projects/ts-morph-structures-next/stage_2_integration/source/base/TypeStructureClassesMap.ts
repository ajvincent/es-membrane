import type {
  Class,
} from "type-fest";

import {
  KindedTypeStructure,
  TypeStructureKind,
  type TypeStructures,
} from "../../snapshot/source/exports.js";

import type {
  CloneableTypeStructure
} from "../../snapshot/source/internal-exports.js";

class TypeStructureClassesMapClass extends Map<
  TypeStructureKind,
  CloneableTypeStructure<TypeStructures> & Class<KindedTypeStructure<TypeStructureKind>>
>
{
  clone(
    structure: TypeStructures
  ): TypeStructures
  {
    return this.get(structure.kind)!.clone(structure);
  }

  cloneArray(
    structures: (TypeStructures)[]
  ): (TypeStructures)[]
  {
    return structures.map(structure => this.clone(structure));
  }
}

const TypeStructureClassesMap = new TypeStructureClassesMapClass;

export default TypeStructureClassesMap;
