import {
  ConstructSignatureDeclarationStructure,
  OptionalKind,
  StructureKind,
} from "ts-morph";
import { CloneableStructure } from "../types/CloneableStructure.mjs";
import JSDocImpl from "./JSDocImpl.mjs";
import ParameterDeclarationImpl from "./ParameterDeclarationImpl.mjs";
import TypeParameterDeclarationImpl from "./TypeParameterDeclarationImpl.mjs";
import ReturnTypeWriterManager from "./ReturnTypeWriterManager.mjs";
import { TS_Parameter, stringOrWriterFunction } from "../types/ts-morph-native.mjs";
import { cloneArrayOrUndefined, stringOrWriterFunctionArray } from "./utilities.mjs";

export default class ConstructSignatureDeclarationImpl
extends ReturnTypeWriterManager
implements ConstructSignatureDeclarationStructure
{
  leadingTrivia: stringOrWriterFunction[] = [];
  trailingTrivia: stringOrWriterFunction[] = [];
  readonly kind: StructureKind.ConstructSignature = StructureKind.ConstructSignature;
  docs: (string | JSDocImpl)[] = [];
  parameters: ParameterDeclarationImpl[] = [];
  typeParameters: (TypeParameterDeclarationImpl | string)[] = [];

  public static clone(
    other: OptionalKind<ConstructSignatureDeclarationStructure>
  ): ConstructSignatureDeclarationImpl
  {
    const declaration = new ConstructSignatureDeclarationImpl;

    declaration.leadingTrivia = stringOrWriterFunctionArray(other.leadingTrivia);
    declaration.trailingTrivia = stringOrWriterFunctionArray(other.trailingTrivia);
    declaration.docs = JSDocImpl.cloneArray(other);
    declaration.parameters = cloneArrayOrUndefined<TS_Parameter, typeof ParameterDeclarationImpl>(
      other.parameters, ParameterDeclarationImpl
    );
    declaration.typeParameters = TypeParameterDeclarationImpl.cloneArray(other);
    declaration.returnType = other.returnType;

    return declaration;
  }
}
ConstructSignatureDeclarationImpl satisfies CloneableStructure<ConstructSignatureDeclarationStructure>;
