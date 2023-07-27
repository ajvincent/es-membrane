import {
  ConstructorDeclarationOverloadStructure,
  OptionalKind,
  Scope,
  StructureKind,
} from "ts-morph";
import ReturnTypeWriterManager from "./ReturnTypeWriterManager.mjs";
import { CloneableStructure } from "../types/CloneableStructure.mjs";
import { TS_Parameter, stringOrWriterFunction } from "../types/ts-morph-native.mjs";
import JSDocImpl from "./JSDocImpl.mjs";
import ParameterDeclarationImpl from "./ParameterDeclarationImpl.mjs";
import TypeParameterDeclarationImpl from "./TypeParameterDeclarationImpl.mjs";
import { cloneArrayOrUndefined, stringOrWriterFunctionArray } from "./utilities.mjs";

export default class ConstructorDeclarationOverloadImpl
extends ReturnTypeWriterManager
implements ConstructorDeclarationOverloadStructure
{
  leadingTrivia: stringOrWriterFunction[] = [];
  trailingTrivia: stringOrWriterFunction[] = [];
  readonly kind: StructureKind.ConstructorOverload = StructureKind.ConstructorOverload;
  scope: Scope | undefined;
  parameters: ParameterDeclarationImpl[] = [];
  typeParameters: (string | TypeParameterDeclarationImpl)[] = [];
  docs: (string | JSDocImpl)[] = [];

  public static clone(
    other: OptionalKind<ConstructorDeclarationOverloadStructure>
  ): ConstructorDeclarationOverloadImpl
  {
    const clone = new ConstructorDeclarationOverloadImpl;

    clone.leadingTrivia = stringOrWriterFunctionArray(other.leadingTrivia);
    clone.trailingTrivia = stringOrWriterFunctionArray(other.trailingTrivia);
    clone.scope = other.scope;
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
ConstructorDeclarationOverloadImpl satisfies CloneableStructure<ConstructorDeclarationOverloadStructure>;
