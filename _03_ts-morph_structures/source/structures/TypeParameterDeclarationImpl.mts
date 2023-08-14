// #region preamble
import {
  CodeBlockWriter,
  type OptionalKind,
  StructureKind,
  type TypeParameterDeclarationStructure,
  type TypeParameterVariance,
  type TypeParameteredNodeStructure,
} from "ts-morph";

import StructureBase from "../base/StructureBase.mjs";

import StructuresClassesMap from "../base/StructuresClassesMap.mjs";

import TypeWriterManager from "../base/TypeWriterManager.mjs";

import type {
  TypeParameterWithTypeStructures
} from "../typeStructures/TypeAndTypeStructureInterfaces.mjs";

import type {
  TypeStructures
} from "../typeStructures/TypeStructures.mjs";

import type {
  CloneableStructure
} from "../types/CloneableStructure.mjs";

import type {
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";
// #endregion preamble

export enum TypeParameterConstraintMode {
  extends = "extends",
  in = "in",
}

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

  get constraintStructure(): TypeStructures | undefined
  {
    return this.#constraintManager.typeStructure
  }
  set constraintStructure(
    structure: TypeStructures
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

  get defaultStructure(): TypeStructures | undefined
  {
    return this.#defaultManager.typeStructure;
  }
  set defaultStructure(
    structure: TypeStructures
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
    writer: CodeBlockWriter,
    constraintMode: TypeParameterConstraintMode,
  ): void
  {
    writer.write(this.name);

    switch (constraintMode) {
      case TypeParameterConstraintMode.extends:
        this.#writeConstraintExtends(writer);
        break;
      case TypeParameterConstraintMode.in:
        this.#writeConstraintIn(writer);
    }

    // isConst, variance not supported yet... need examples to test against
  }

  #writeConstraintExtends(
    writer: CodeBlockWriter
  ): void
  {
    const constraint = this.constraint;
    if (typeof constraint === "undefined")
      return;

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

  #writeConstraintIn(
    writer: CodeBlockWriter
  ): void
  {
    const constraint = this.constraint;
    if (typeof constraint === "undefined")
      return;

    writer.write(" in ");
    if (typeof constraint === "string") {
      writer.write(constraint);
    }
    else {
      constraint(writer);
    }
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
