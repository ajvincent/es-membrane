import type {
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";

import {
  CodeBlockWriter,
  OptionalKind,
  StructureKind,
  TypeParameterDeclarationStructure,
  TypeParameteredNodeStructure,
  type TypeParameterVariance,
} from "ts-morph";

import { CloneableStructure } from "../types/CloneableStructure.mjs";
import StructureBase from "../decorators/StructureBase.mjs";

import TypeWriterManager from "../base/TypeWriterManager.mjs";
import { TypeStructure } from "../typeStructures/TypeStructure.mjs";
import StructuresClassesMap from "../base/StructuresClassesMap.mjs";
import type {
  TypeParameterWithTypeStructures
} from "../typeStructures/TypedNodeTypeStructure.mjs";

export default class TypeParameterDeclarationImpl
extends StructureBase
implements TypeParameterDeclarationStructure, TypeParameterWithTypeStructures
{
  readonly #constraintManager = new TypeWriterManager;
  readonly #defaultManager = new TypeWriterManager;

  get constraint(): stringOrWriterFunction | undefined
  {
    return this.#constraintManager.type;
  }
  set constraint(
    type: stringOrWriterFunction | undefined
  )
  {
    this.#constraintManager.type = type;
  }

  get constraintStructure(): TypeStructure | undefined
  {
    return this.#constraintManager.typeStructure
  }
  set constraintStructure(
    structure: TypeStructure
  )
  {
    this.#constraintManager.typeStructure = structure;
  }

  get default(): stringOrWriterFunction | undefined
  {
    return this.#defaultManager.type;
  }
  set default(
    type: stringOrWriterFunction | undefined
  )
  {
    this.#defaultManager.type = type;
  }

  get defaultStructure(): TypeStructure | undefined
  {
    return this.#defaultManager.typeStructure;
  }
  set defaultStructure(
    structure: TypeStructure
  )
  {
    this.#defaultManager.typeStructure = structure;
  }

  isConst = false;
  variance: TypeParameterVariance | undefined = undefined;
  name: string;
  readonly kind: StructureKind.TypeParameter = StructureKind.TypeParameter;

  constructor(
    name: string
  )
  {
    super();
    this.name = name;
  }

  writerFunction(
    writer: CodeBlockWriter
  ): void
  {
    writer.write(this.name);

    const constraint = this.constraint;
    if (constraint) {
      writer.write(" extends ");
      if (typeof constraint === "string") {
        writer.write(constraint);
      }
      else {
        constraint(writer);
      }

      const _default = this.default;
      if (_default) {
        writer.write(" = ");
        if (typeof _default === "string") {
          writer.write(_default);
        }
        else {
          _default(writer);
        }
      }
    }

    // isConst, variance not supported yet... need examples to test against
  }

  public static clone(
    other: OptionalKind<TypeParameterDeclarationStructure>
  ): TypeParameterDeclarationImpl
  {
    const clone = new TypeParameterDeclarationImpl(other.name);

    StructureBase.cloneTrivia(other, clone);

    clone.isConst = other.isConst ?? false;
    clone.variance = other.variance;

    clone.constraint = TypeWriterManager.cloneType(other.constraint);
    clone.default = TypeWriterManager.cloneType(other.default);

    return clone;
  }

  public static cloneArray(
    other: TypeParameteredNodeStructure
  ): (string | TypeParameterDeclarationImpl)[]
  {
    if (!other.typeParameters)
      return [];

    return other.typeParameters.map(typeParam => {
      if (typeof typeParam === "string")
        return typeParam;
      return TypeParameterDeclarationImpl.clone(typeParam);
    });
  }

}
TypeParameterDeclarationImpl satisfies CloneableStructure<TypeParameterDeclarationStructure>;

StructuresClassesMap.set(StructureKind.TypeParameter, TypeParameterDeclarationImpl);
