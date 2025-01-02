// #region preamble
import type {
  CodeBlockWriter,
} from "ts-morph";

import {
  LiteralTypedStructureImpl
} from "../exports.js";

import type {
  ParameterTypedStructure,
  LiteralTypedStructure,
  TypeStructures
} from "./TypeStructures.js";

import TypeStructureClassesMap from "../base/TypeStructureClassesMap.js";

import {
  TypeStructureKind,
} from "../base/TypeStructureKind.js";

import type {
  CloneableStructure,
} from "../types/CloneableStructure.js";

import replaceDescendantTypeStructures from "../base/replaceDescendantTypeStructures.js";
// #endregion

/** Just a parameter name and type for a `FunctionTypedStructureImpl`. */
export default class ParameterTypedStructureImpl
implements ParameterTypedStructure
{
  readonly kind: TypeStructureKind.Parameter = TypeStructureKind.Parameter;
  name: LiteralTypedStructure;
  typeStructure: TypeStructures | undefined;

  constructor(
    name: string | LiteralTypedStructure,
    typeStructure: TypeStructures | undefined
  )
  {
    if (typeof name === "string") {
      this.name = new LiteralTypedStructureImpl(name);
    }
    else {
      this.name = name;
    }
    this.typeStructure = typeStructure;
  }

  public replaceDescendantTypes(
    filter: (typeStructure: TypeStructures) => boolean,
    replacement: TypeStructures
  ): void
  {
    if (this.typeStructure) {
      replaceDescendantTypeStructures(this, "typeStructure", filter, replacement);
    }
  }

  #writerFunction(
    writer: CodeBlockWriter
  ): void
  {
    this.name.writerFunction(writer);
    if (this.typeStructure) {
      writer.write(": ");
      this.typeStructure.writerFunction(writer);
    }
  }

  writerFunction = this.#writerFunction.bind(this);

  public static clone(
    other: ParameterTypedStructure
  ): ParameterTypedStructureImpl
  {
    let typeClone: TypeStructures | undefined;
    if (other.typeStructure)
      typeClone = TypeStructureClassesMap.clone(other.typeStructure);

    const clone = new ParameterTypedStructureImpl(other.name.stringValue, typeClone);
    return clone;
  }
}
ParameterTypedStructureImpl satisfies CloneableStructure<ParameterTypedStructure>;

TypeStructureClassesMap.set(TypeStructureKind.Parameter, ParameterTypedStructureImpl);
