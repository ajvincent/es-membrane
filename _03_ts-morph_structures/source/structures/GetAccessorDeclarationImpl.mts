import {
  DecoratorStructure,
  GetAccessorDeclarationStructure,
  OptionalKind,
  Scope,
  StatementStructures,
  StructureKind,
} from "ts-morph";
import ReturnTypeWriterManager from "./ReturnTypeWriterManager.mjs";
import { CloneableStructure } from "../types/CloneableStructure.mjs";
import { TS_Parameter, stringOrWriterFunction } from "../types/ts-morph-native.mjs";
import DecoratorImpl from "./DecoratorImpl.mjs";
import ParameterDeclarationImpl from "./ParameterDeclarationImpl.mjs";
import TypeParameterDeclarationImpl from "./TypeParameterDeclarationImpl.mjs";
import JSDocImpl from "./JSDocImpl.mjs";
import { cloneArrayOrUndefined, statementsArray, stringOrWriterFunctionArray } from "./utilities.mjs";

export default class GetAccessorDeclarationImpl
extends ReturnTypeWriterManager
implements GetAccessorDeclarationStructure
{
  leadingTrivia: stringOrWriterFunction[] = [];
  trailingTrivia: stringOrWriterFunction[] = [];
  readonly kind: StructureKind.GetAccessor = StructureKind.GetAccessor;
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
    other: OptionalKind<GetAccessorDeclarationStructure>
  ): GetAccessorDeclarationImpl
  {
    const clone = new GetAccessorDeclarationImpl(other.name);

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
GetAccessorDeclarationImpl satisfies CloneableStructure<GetAccessorDeclarationStructure>;
