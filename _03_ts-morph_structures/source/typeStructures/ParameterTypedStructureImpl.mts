import type {
  CodeBlockWriter,
} from "ts-morph";

import type {
  ParameterTypedStructure,
  LiteralTypedStructure,
  TypeStructures
} from "./TypeStructures.mjs";

import {
  TypeStructureKind,
} from "../base/TypeStructureKind.mjs";

import TypeStructureClassesMap from "../base/TypeStructureClassesMap.mjs";
import LiteralTypedStructureImpl from "./LiteralTypedStructureImpl.mjs";

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

  readonly writerFunction = this.#writerFunction.bind(this);

  public static clone(
    other: ParameterTypedStructure
  ): ParameterTypedStructureImpl
  {
    let typeClone: TypeStructures | undefined;
    if (other.typeStructure)
      typeClone = TypeStructureClassesMap.get(other.typeStructure.kind)!.clone(other.typeStructure);
    const clone = new ParameterTypedStructureImpl(other.name.stringValue, typeClone);
    return clone;
  }
}
