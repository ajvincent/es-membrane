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
  TypeStructure
} from "../typeStructures/TypeStructure.mjs";

import {
  getTypeStructureForCallback,
  deregisterCallbackForTypeStructure,
} from "./callbackToTypeStructureRegistry.mjs";
import StructureBase from "../decorators/StructureBase.mjs";

import TypeStructureClassesMap from "./TypeStructureClassesMap.mjs";
import { TypeStructureKind } from "./TypeStructureKind.mjs";
import LiteralTypedStructureImpl from "../typeStructures/LiteralTypedStructureImpl.mjs";
import WriterTypedStructureImpl from "../typeStructures/WriterTypedStructureImpl.mjs";

export default class TypeWriterManager
extends StructureBase
implements TypedNodeStructure, TypedNodeTypeStructure
{
  typeStructure: TypeStructure | undefined = undefined;

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

    return TypeStructureClassesMap
      .get(typeStructure.kind)!
      .clone(typeStructure)
      .writerFunction;
  }
}
