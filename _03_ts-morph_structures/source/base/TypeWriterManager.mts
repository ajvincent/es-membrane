import type {
  TypedNodeStructure,
  WriterFunction,
} from "ts-morph";

import {
  TypedNodeTypeStructure
} from "../typeStructures/TypedNodeTypeStructure.mjs";

import {
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";

import {
  TypeStructure
} from "../typeStructures/TypeStructure.mjs";

import {
  getTypeStructureForCallback
} from "./callbackToTypeStructureRegistry.mjs";
import StructureBase from "../decorators/StructureBase.mjs";

import TypeStructureClassesMap from "../typeStructures/TypeStructureClassesMap.mjs";

export default class TypeWriterManager
extends StructureBase
implements TypedNodeStructure, TypedNodeTypeStructure
{
  #typeOrStructure: string | WriterFunction | TypeStructure | undefined = undefined;

  get type(): string | WriterFunction | undefined
  {
    if ((typeof this.#typeOrStructure === "string") ||
        (typeof this.#typeOrStructure === "function") ||
        (typeof this.#typeOrStructure === "undefined"))
      return this.#typeOrStructure;

    return this.#typeOrStructure.writerFunction;
  }

  set type(
    value: stringOrWriterFunction | undefined
  )
  {
    if (typeof value === "string") {
      this.#typeOrStructure = value;
      return;
    }

    if (typeof value === "function") {
      this.#typeOrStructure = getTypeStructureForCallback(value) ?? value;
      return;
    }

    this.#typeOrStructure = undefined;
  }

  get typeStructure(): TypeStructure | undefined
  {
    if ((typeof this.#typeOrStructure === "string") ||
        (typeof this.#typeOrStructure === "function") ||
        (typeof this.#typeOrStructure === "undefined"))
      return undefined;
    return this.#typeOrStructure;
  }

  set typeStructure(value: TypeStructure)
  {
    this.#typeOrStructure = value;
  }

  static cloneType(
    type: stringOrWriterFunction | undefined
  ): stringOrWriterFunction | undefined
  {
    if (typeof type !== "function")
      return type;

    const typeStructure = getTypeStructureForCallback(type);
    if (!typeStructure)
      return type;

    return TypeStructureClassesMap
      .get(typeStructure.kind)!
      .clone(typeStructure)
      .writerFunction;
  }
}
