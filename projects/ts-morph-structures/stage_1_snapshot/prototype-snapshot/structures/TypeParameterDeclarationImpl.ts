// #region preamble
import {
  CodeBlockWriter,
  type OptionalKind,
  StructureKind,
  type TypeParameterDeclarationStructure,
  type TypeParameterVariance,
  type TypeParameteredNodeStructure,
} from "ts-morph";

import {
  TypeStructureClassesMap,
  type TypeStructures,
} from "../exports.js";

import StructureBase from "../base/StructureBase.js";

import StructuresClassesMap from "../base/StructuresClassesMap.js";

import TypeAccessors from "../base/TypeAccessors.js";

import type {
  TypeParameterWithTypeStructures
} from "../typeStructures/TypeAndTypeStructureInterfaces.js";

import type {
  CloneableStructure
} from "../types/CloneableStructure.js";

import type {
  stringOrWriterFunction
} from "../types/ts-morph-native.js";
import { ReplaceWriterInProperties } from "../types/ModifyWriterInTypes.js";
import { replaceWriterWithString } from "../base/utilities.js";
// #endregion preamble

export enum TypeParameterConstraintMode {
  extends = "extends",
  in = "in",
}

export default class TypeParameterDeclarationImpl
extends StructureBase
implements TypeParameterDeclarationStructure, TypeParameterWithTypeStructures
{
  readonly #constraintManager = new TypeAccessors;
  readonly #defaultManager = new TypeAccessors;

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
    return this.#constraintManager.typeStructure;
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

  public replaceDescendantTypes(
    filter: (typeStructure: TypeStructures) => boolean,
    replacement: TypeStructures
  ): void
  {
    if (this.constraintStructure) {
      if (filter(this.constraintStructure))
        this.constraintStructure = TypeStructureClassesMap.clone(replacement);
      else
        this.constraintStructure.replaceDescendantTypes(filter, replacement);
    }

    if (this.defaultStructure) {
      if (filter(this.defaultStructure))
        this.defaultStructure = TypeStructureClassesMap.clone(replacement);
      else
        this.defaultStructure.replaceDescendantTypes(filter, replacement);
    }
  }

  constraintWriter(
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

    clone.constraint = TypeAccessors.cloneType(other.constraint);
    clone.default = TypeAccessors.cloneType(other.default);

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

  public toJSON(): ReplaceWriterInProperties<TypeParameterDeclarationStructure>
  {
    const rv = super.toJSON() as ReplaceWriterInProperties<TypeParameterDeclarationStructure>;
    if (this.#constraintManager.type)
      rv.constraint = replaceWriterWithString(this.#constraintManager.type);
    if (this.#defaultManager.type)
      rv.default = replaceWriterWithString(this.#defaultManager.type);
    return rv;
  }
}
TypeParameterDeclarationImpl satisfies CloneableStructure<TypeParameterDeclarationStructure>;

StructuresClassesMap.set(StructureKind.TypeParameter, TypeParameterDeclarationImpl);
