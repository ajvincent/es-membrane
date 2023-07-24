import {
  ConstructorDeclarationOverloadStructure,
  ConstructorDeclarationStructure,
  OptionalKind,
  Scope,
  StatementStructures,
  StructureKind,
} from "ts-morph";
import ReturnTypeWriterManager from "./ReturnTypeWriterManager.mjs";
import { CloneableStructure } from "../types/CloneableStructure.mjs";
import ParameterDeclarationImpl from "./ParameterDeclarationImpl.mjs";
import TypeParameterDeclarationImpl from "./TypeParameterDeclarationImpl.mjs";
import { TS_Parameter, stringOrWriterFunction } from "../types/ts-morph-native.mjs";
import JSDocImpl from "./JSDocImpl.mjs";
import { cloneArrayOrUndefined, statementsArray, stringOrWriterFunctionArray } from "./utilities.mjs";
import ConstructorDeclarationOverloadImpl from "./ConstructorDeclarationOverloadImpl.mjs";

export default class ConstructorDeclarationImpl
extends ReturnTypeWriterManager
implements ConstructorDeclarationStructure
{
  leadingTrivia: stringOrWriterFunction[] = [];
  trailingTrivia: stringOrWriterFunction[] = [];
  overloads: ConstructorDeclarationOverloadImpl[] = [];
  readonly kind: StructureKind.Constructor = StructureKind.Constructor;
  scope: Scope | undefined;
  parameters: ParameterDeclarationImpl[] = [];
  typeParameters: (string | TypeParameterDeclarationImpl)[] = [];
  docs: (string | JSDocImpl)[] = [];
  statements: (stringOrWriterFunction | StatementStructures)[] | undefined;

  public static clone(
    other: OptionalKind<ConstructorDeclarationStructure>
  ): ConstructorDeclarationImpl
  {
    const clone = new ConstructorDeclarationImpl;

    clone.leadingTrivia = stringOrWriterFunctionArray(other.leadingTrivia);
    clone.trailingTrivia = stringOrWriterFunctionArray(other.trailingTrivia);
    clone.overloads = cloneArrayOrUndefined<
      OptionalKind<ConstructorDeclarationOverloadStructure>,
      typeof ConstructorDeclarationOverloadImpl
    >
    (
      other.overloads, ConstructorDeclarationOverloadImpl
    );
    clone.scope = other.scope;
    clone.parameters = cloneArrayOrUndefined<
      TS_Parameter,
      typeof ParameterDeclarationImpl
    >(other.parameters, ParameterDeclarationImpl);
    clone.typeParameters = TypeParameterDeclarationImpl.cloneArray(other);
    clone.docs = JSDocImpl.cloneArray(other);
    clone.statements = statementsArray(other);

    return clone;
  }
}
ConstructorDeclarationImpl satisfies CloneableStructure<ConstructorDeclarationStructure>;
