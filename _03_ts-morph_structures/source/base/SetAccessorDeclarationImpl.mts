import {
  DecoratorStructure,
  OptionalKind,
  Scope,
  SetAccessorDeclarationStructure,
  StatementStructures,
  StructureKind,
} from "ts-morph";
import ReturnTypeWriterManager from "./ReturnTypeWriterManager.mjs";
import { CloneableStructure } from "../types/CloneableStructure.mjs";
import { TS_Parameter, stringOrWriterFunction } from "../types/ts-morph-native.mjs";
import DecoratorImpl from "./DecoratorImpl.mjs";
import JSDocImpl from "./JSDocImpl.mjs";
import ParameterDeclarationImpl from "./ParameterDeclarationImpl.mjs";
import TypeParameterDeclarationImpl from "./TypeParameterDeclarationImpl.mjs";
import { stringOrWriterFunctionArray, cloneArrayOrUndefined, statementsArray } from "./utilities.mjs";

export default class SetAccessorDeclarationImpl
extends ReturnTypeWriterManager
implements SetAccessorDeclarationStructure
{
  leadingTrivia: stringOrWriterFunction[] = [];
  trailingTrivia: stringOrWriterFunction[] = [];
  readonly kind: StructureKind.SetAccessor = StructureKind.SetAccessor;
  name: string;
  isStatic = false;
  decorators: DecoratorImpl[] = [];
  isAbstract = false;
  scope: Scope | undefined;
  parameters: ParameterDeclarationImpl[] = [];
  typeParameters: (string | TypeParameterDeclarationImpl)[] = [];
  docs: (string | JSDocImpl)[] = [];
  statements: (stringOrWriterFunction | StatementStructures)[] = [];

  constructor(
    name: string
  )
  {
    super();
    this.name = name;
  }

  public static clone(
    other: OptionalKind<SetAccessorDeclarationStructure>
  ): SetAccessorDeclarationImpl
  {
    const clone = new SetAccessorDeclarationImpl(other.name);

    clone.leadingTrivia = stringOrWriterFunctionArray(other.leadingTrivia);
    clone.trailingTrivia = stringOrWriterFunctionArray(other.trailingTrivia);
    clone.isStatic = other.isStatic ?? false;
    clone.decorators = cloneArrayOrUndefined<OptionalKind<DecoratorStructure>, typeof DecoratorImpl>(
      other.decorators, DecoratorImpl
    );
    clone.isAbstract = other.isAbstract ?? false;
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
SetAccessorDeclarationImpl satisfies CloneableStructure<SetAccessorDeclarationStructure>;
