import {
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

import ReturnTypeWriterManager from "./ReturnTypeWriterManager.mjs";
import JSDocImpl from "./JSDocImpl.mjs";

export default class MethodSignatureImpl
extends ReturnTypeWriterManager
implements TS_Method
{
  leadingTrivia: stringOrWriterFunction[] = [];
  trailingTrivia: stringOrWriterFunction[] = [];
  name: string;
  hasQuestionToken = false;
  docs: (string | JSDocImpl)[] = [];
  parameters: ParameterDeclarationImpl[] = [];
  typeParameters: (TypeParameterDeclarationImpl | string)[] = [];
  readonly kind: StructureKind.MethodSignature = StructureKind.MethodSignature;

  constructor(name: string) {
    super();
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
    clone.docs = JSDocImpl.cloneArray(other);

    clone.parameters = cloneArrayOrUndefined<
      TS_Parameter,
      typeof ParameterDeclarationImpl
    >(other.parameters, ParameterDeclarationImpl);

    clone.returnType = other.returnType;
    clone.typeParameters = TypeParameterDeclarationImpl.cloneArray(other);
    return clone;
  }
}
MethodSignatureImpl satisfies CloneableStructure<MethodSignatureStructure>;
