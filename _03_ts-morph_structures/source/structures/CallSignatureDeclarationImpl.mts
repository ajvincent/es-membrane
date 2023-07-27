import {
  CallSignatureDeclarationStructure,
  OptionalKind,
  ParameterDeclarationStructure,
  StructureKind,
} from "ts-morph";
import { CloneableStructure } from "../types/CloneableStructure.mjs";
import JSDocImpl from "./JSDocImpl.mjs";
import ParameterDeclarationImpl from "./ParameterDeclarationImpl.mjs";
import TypeParameterDeclarationImpl from "./TypeParameterDeclarationImpl.mjs";
import ReturnTypeWriterManager from "./ReturnTypeWriterManager.mjs";
import { stringOrWriterFunction } from "../types/ts-morph-native.mjs";
import { cloneArrayOrUndefined, stringOrWriterFunctionArray } from "./utilities.mjs";

export default class CallSignatureDeclarationImpl
extends ReturnTypeWriterManager
implements CallSignatureDeclarationStructure
{
  leadingTrivia: stringOrWriterFunction[] = [];
  trailingTrivia: stringOrWriterFunction[] = [];
  readonly kind: StructureKind.CallSignature = StructureKind.CallSignature;
  docs: (string | JSDocImpl)[] = [];
  parameters: ParameterDeclarationImpl[] = [];
  typeParameters: (TypeParameterDeclarationImpl | string)[] = [];

  public static clone(
    other: OptionalKind<CallSignatureDeclarationStructure>
  ): CallSignatureDeclarationImpl
  {
    const declaration = new CallSignatureDeclarationImpl;

    declaration.leadingTrivia = stringOrWriterFunctionArray(other.leadingTrivia);
    declaration.trailingTrivia = stringOrWriterFunctionArray(other.trailingTrivia);
    declaration.docs = JSDocImpl.cloneArray(other);
    declaration.parameters = cloneArrayOrUndefined<
      OptionalKind<ParameterDeclarationStructure>, typeof ParameterDeclarationImpl
    >(other.parameters, ParameterDeclarationImpl);
    declaration.typeParameters = TypeParameterDeclarationImpl.cloneArray(other);
    declaration.returnType = other.returnType;

    return declaration;
  }
}
CallSignatureDeclarationImpl satisfies CloneableStructure<CallSignatureDeclarationStructure>;
