import {
  CallSignatureDeclarationStructure,
  OptionalKind,
  StructureKind,
} from "ts-morph";
import { CloneableStructure } from "../types/CloneableStructure.mjs";
import JSDocImpl from "./JSDocImpl.mjs";
import ParameterDeclarationImpl from "./ParameterDeclarationImpl.mjs";
import TypeParameterDeclarationImpl from "./TypeParameterDeclarationImpl.mjs";
import ReturnTypeWriterManager from "./ReturnTypeWriterManager.mjs";
import { stringOrWriterFunction } from "../types/ts-morph-native.mjs";
import { stringOrWriterFunctionArray } from "./utilities.mjs";

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
    if (Array.isArray(other.docs)) {
      declaration.docs = other.docs.map(doc => {
        if (typeof doc === "string")
          return doc;
        return JSDocImpl.clone(doc);
      });
    }
    if (other.parameters) {
      declaration.parameters = other.parameters.map(param => ParameterDeclarationImpl.clone(param));
    }
    if (other.typeParameters) {
      declaration.typeParameters = other.typeParameters.map(typeParam => {
        if (typeof typeParam === "string")
          return typeParam;
        return TypeParameterDeclarationImpl.clone(typeParam);
      });
    }
    declaration.returnType = other.returnType;

    return declaration;
  }
}
CallSignatureDeclarationImpl satisfies CloneableStructure<CallSignatureDeclarationStructure>;
