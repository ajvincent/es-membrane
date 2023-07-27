import type {
  TS_TypeParameter,
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";

import {
  StructureKind,
  TypeParameterDeclarationStructure,
  TypeParameteredNodeStructure,
  type TypeParameterVariance,
} from "ts-morph";

import {
  stringOrWriterFunctionArray,
} from "./utilities.mjs";
import { CloneableStructure } from "../types/CloneableStructure.mjs";

export default class TypeParameterDeclarationImpl implements TS_TypeParameter
{
  leadingTrivia: stringOrWriterFunction[] = [];
  trailingTrivia: stringOrWriterFunction[] = [];
  isConst = false;
  constraint: stringOrWriterFunction | undefined = undefined;
  default: stringOrWriterFunction | undefined = undefined;
  variance: TypeParameterVariance | undefined = undefined;
  name: string;
  readonly kind: StructureKind.TypeParameter = StructureKind.TypeParameter;

  constructor(
    name: string
  )
  {
    this.name = name;
  }

  public static clone(
    other: TS_TypeParameter
  ): TypeParameterDeclarationImpl
  {
    const clone = new TypeParameterDeclarationImpl(other.name);

    clone.leadingTrivia = stringOrWriterFunctionArray(other.leadingTrivia);
    clone.trailingTrivia = stringOrWriterFunctionArray(other.trailingTrivia);
    clone.isConst = other.isConst ?? false;
    clone.constraint = other.constraint;
    clone.default = other.default;
    clone.variance = other.variance;

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
