import {
  type OptionalKind,
  type JSDocStructure,
  StructureKind,
  MethodSignatureStructure
} from "ts-morph";

import type {
  TS_Method,
  TS_Parameter,
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";

import {
  cloneArrayOrUndefined,
  stringOrWriterFunctionArray,
} from "./utilities.mjs";

import ParameterDeclarationImpl from "./ParameterDeclarationImpl.mjs";
import TypeParameterDeclarationImpl from "./TypeParameterDeclarationImpl.mjs";
import { CloneableStructure } from "../types/CloneableStructure.mjs";

export default class MethodSignatureImpl implements TS_Method
{
  leadingTrivia: stringOrWriterFunction[] = [];
  trailingTrivia: stringOrWriterFunction[] = [];
  name: string;
  hasQuestionToken = false;
  docs: (string | OptionalKind<JSDocStructure>)[] = [];
  parameters: ParameterDeclarationImpl[] = [];
  returnType: stringOrWriterFunction | undefined = undefined;
  typeParameters: (TypeParameterDeclarationImpl | string)[] = [];
  readonly kind: StructureKind.MethodSignature = StructureKind.MethodSignature;

  constructor(name: string) {
    this.name = name;
  }

  public static clone(
    other: TS_Method
  ): MethodSignatureImpl
  {
    const clone = new MethodSignatureImpl(other.name);

    clone.leadingTrivia = stringOrWriterFunctionArray(other.leadingTrivia);
    clone.trailingTrivia = stringOrWriterFunctionArray(other.trailingTrivia);
    clone.hasQuestionToken = other.hasQuestionToken ?? false;
    clone.docs = other.docs?.slice() ?? [];

    clone.parameters = cloneArrayOrUndefined<
      TS_Parameter,
      typeof ParameterDeclarationImpl
    >(other.parameters, ParameterDeclarationImpl);

    clone.returnType = other.returnType;

    if (other.typeParameters) {
      clone.typeParameters = other.typeParameters.map(typeParam => {
        if (typeof typeParam === "string")
          return typeParam;
        return TypeParameterDeclarationImpl.clone(typeParam);
      });
    }

    return clone;
  }
}
MethodSignatureImpl satisfies CloneableStructure<MethodSignatureStructure>;
