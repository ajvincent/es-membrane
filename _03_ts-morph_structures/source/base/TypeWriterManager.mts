//#region preamble
import type {
  TypedNodeStructure,
  WriterFunction,
} from "ts-morph";

import {
  TypedNodeTypeStructure
} from "../typeStructures/TypeAndTypeStructureInterfaces.mjs";

import {
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";

import {
  TypeStructures
} from "../typeStructures/TypeStructures.mjs";

import {
  getTypeStructureForCallback,
  deregisterCallbackForTypeStructure,
} from "./callbackToTypeStructureRegistry.mjs";
import StructureBase from "./StructureBase.mjs";

import TypeStructureClassesMap from "./TypeStructureClassesMap.mjs";
import { TypeStructureKind } from "./TypeStructureKind.mjs";
import LiteralTypedStructureImpl from "../typeStructures/LiteralTypedStructureImpl.mjs";
import WriterTypedStructureImpl from "../typeStructures/WriterTypedStructureImpl.mjs";
// #endregion preamble

/**
 * This provides an API for converting between a type (`string | WriterFunction`) and a `TypeStructure`.
 *
 * For any class providing a type (return type, constraint, extends, etc.), you can have an instance of
 * `TypeWriterManager` as a private class field, and provide getters and setters for type and typeStructure
 * referring to the private TypeWriterManager.
 *
 * See `../decorators/TypedNode.mts` for an example.
 */
export default class TypeWriterManager
extends StructureBase
implements TypedNodeStructure, TypedNodeTypeStructure
{
  typeStructure: TypeStructures | undefined = undefined;

  get type(): string | WriterFunction | undefined
  {
    if (!this.typeStructure)
      return undefined;

    if (this.typeStructure.kind === TypeStructureKind.Literal) {
      return this.typeStructure.stringValue;
    }

    return this.typeStructure.writerFunction;
  }

  set type(
    value: stringOrWriterFunction | undefined
  )
  {
    if (typeof value === "string") {
      this.typeStructure = new LiteralTypedStructureImpl(value);
      deregisterCallbackForTypeStructure(this.typeStructure);
      return;
    }

    if (typeof value === "function") {
      const knownTypeStructure = getTypeStructureForCallback(value);
      if (knownTypeStructure) {
        this.typeStructure = knownTypeStructure;
        return;
      }

      this.typeStructure = new WriterTypedStructureImpl(value);
      deregisterCallbackForTypeStructure(this.typeStructure);
      return;
    }

    this.typeStructure = undefined;
  }

  /**
   * Create a clone of an existing type, if it belongs to a type structure.
   *
   * If the underlying type structure exists, this will register the clone's type structure
   * for later retrieval.
   * @param type - the type to clone.
   * @returns the cloned type, or the original type if the type is not cloneable.
   */
  static cloneType(
    type: stringOrWriterFunction | undefined
  ): stringOrWriterFunction | undefined
  {
    if (typeof type !== "function")
      return type;

    const typeStructure = getTypeStructureForCallback(type);
    if (!typeStructure)
      return type;

    if (typeStructure.kind === TypeStructureKind.Literal)
      return typeStructure.stringValue;

    return TypeStructureClassesMap.clone(typeStructure).writerFunction;
  }
}
