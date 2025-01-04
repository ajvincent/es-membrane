import type {
  WriterFunction
} from "ts-morph";

import type {
  TypeStructures
} from "../exports.js";

import {
  getTypeStructureForCallback,
  deregisterCallbackForTypeStructure,
} from "./callbackToTypeStructureRegistry.js";

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
  constructor() {
    throw new Error("not implemented, deliberately: static members only");
  }

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
}
