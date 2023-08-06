import type {
  CodeBlockWriter,
} from "ts-morph";

import type {
  ParameterTypedStructure,
  LiteralTypedStructure,
  TypeStructure
} from "./TypeStructure.mjs";

import {
  TypeStructureKind,
} from "./TypeStructureKind.mjs";

import TypeStructureClassesMap from "./TypeStructureClassesMap.mjs";
import LiteralTypedStructureImpl from "./LiteralTypedStructureImpl.mjs";

export default class ParameterTypedStructureImpl
implements ParameterTypedStructure
{
  readonly kind: TypeStructureKind.Parameter = TypeStructureKind.Parameter;
  name: LiteralTypedStructure;
  typeStructure: TypeStructure | undefined;

  constructor(
    name: string | LiteralTypedStructure,
    typeStructure: TypeStructure | undefined
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
    let typeClone: TypeStructure | undefined;
    if (other.typeStructure)
      typeClone = TypeStructureClassesMap.get(other.typeStructure.kind)!.clone(other.typeStructure);
    const clone = new ParameterTypedStructureImpl(other.name.stringValue, typeClone);
    return clone;
  }
}
