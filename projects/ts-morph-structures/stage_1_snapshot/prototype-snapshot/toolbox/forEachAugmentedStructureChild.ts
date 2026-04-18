import {
  forEachStructureChild,
  type Structures
} from "ts-morph";

import type {
  StructureImpls
} from "../types/StructureImplUnions.js";
import type {
  TypeStructures
} from "../typeStructures/TypeStructures.js";

import StructureBase from "../base/StructureBase.js";
import { STRUCTURE_AND_TYPES_CHILDREN } from "../base/symbolKeys.js";

type ArrayOrValue<T> = T | readonly T[];

/*
export function forEachStructureChild<TStructure>(
  structure: Structures | ReadonlyArray<Structures>,
  callback: (child: Structures) => TStructure | void
): TStructure | undefined
*/

/**
 * Iterates over the children of a structure (or type structure), or the elements of an array of structures and type structures.
 * @param structureOrArray - Structure or array of structures to iterate over.
 * @param callback - Callback to do on each structure, until the callback returns a truthy result.
 * @returns the first truthy result from the callback.
 *
 * @see {@link https://ts-morph.com/manipulation/structures#codeforeachstructurechildcode}
 */
export default function forEachAugmentedStructureChild<TStructure>(
  structureOrArray: ArrayOrValue<StructureImpls | TypeStructures>,
  callback: (child: StructureImpls | TypeStructures) => TStructure | void,
): TStructure | undefined
{
  if (Array.isArray(structureOrArray)) {
    for (const element of structureOrArray as readonly (StructureImpls  | TypeStructures
    )[]) {
      const rv = callback(element);
      if (rv) return rv;
    }
    return;
  }

  const structureOrType = structureOrArray as StructureImpls | TypeStructures;

  if (structureOrType instanceof StructureBase) {
    const rv = forEachStructureChild(
      structureOrType as unknown as Structures,
      callback as (child: Structures) => TStructure | void,
    );
    if (rv) return rv;
  }

  // Yes, we need this because it's the only way to reach the .typeStructures field, or anything else.
  const iterator: IterableIterator<StructureImpls | TypeStructures> =
    structureOrType[STRUCTURE_AND_TYPES_CHILDREN]();

  for (const child of iterator) {
    const rv = callback(child);
    if (rv) return rv;
  }

  return undefined;
}
