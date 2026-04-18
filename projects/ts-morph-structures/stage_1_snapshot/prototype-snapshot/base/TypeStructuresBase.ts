import type {
  WriterFunction
} from "ts-morph";

import {
  getTypeStructureForCallback,
  deregisterCallbackForTypeStructure,
} from "./callbackToTypeStructureRegistry.js";

import {
  STRUCTURE_AND_TYPES_CHILDREN
} from "./symbolKeys.js";

import type {
  TypeStructures
} from "../typeStructures/TypeStructures.js";

import type {
  StructureImpls
} from "../types/StructureImplUnions.js";

/**
 * This is a stub class, whose only purpose is to implement the parts of
 * stage 2's TypeStructuresBase which TypeAccessors.ts needs.  The existence
 * of this file makes transplanting TypeAccessors.ts from stage 1 to stage 2
 * much easier.
 *
 * @internal
 */
export default class TypeStructuresBase
{
  public static getTypeStructureForCallback(
    callback: WriterFunction
  ): TypeStructures | undefined
  {
    return getTypeStructureForCallback(callback);
  }

  public static deregisterCallbackForTypeStructure(
    structure: TypeStructures
  ): void {
    return deregisterCallbackForTypeStructure(structure);
  }

  /** @internal */
  public *[STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<StructureImpls | TypeStructures>
  {
    // do nothing
  }
}
