import {
  type OptionalKind,
  type MethodDeclarationStructure,
  StructureKind,
  DecoratorStructure,
  MethodDeclarationOverloadStructure,
  Scope,
  StatementStructures,
} from "ts-morph";

import type {
  TS_Method,
  TS_Parameter,
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";

import {
  cloneArrayOrUndefined,
  statementsArray,
  stringOrWriterFunctionArray
} from "./utilities.mjs";
import DecoratorImpl from "./DecoratorImpl.mjs";
import ParameterDeclarationImpl from "./ParameterDeclarationImpl.mjs";
import TypeParameterDeclarationImpl from "./TypeParameterDeclarationImpl.mjs";
import { CloneableStructure } from "../types/CloneableStructure.mjs";

import ReturnTypeWriterManager from "./ReturnTypeWriterManager.mjs";
import JSDocImpl from "./JSDocImpl.mjs";

export default class MethodDeclarationImpl
extends ReturnTypeWriterManager
implements MethodDeclarationStructure
{
  leadingTrivia: stringOrWriterFunction[] = [];
  trailingTrivia: stringOrWriterFunction[] = [];
  overloads: OptionalKind<MethodDeclarationOverloadStructure>[] = [];
  readonly kind: StructureKind.Method = StructureKind.Method;
  name: string;
  isStatic = false;
  decorators: DecoratorImpl[] = [];
  isAbstract = false;
  scope: Scope | undefined = undefined;
  isAsync = false;
  isGenerator = false;
  parameters: ParameterDeclarationImpl[] = [];
  typeParameters: (string | TypeParameterDeclarationImpl)[] = [];
  docs: (string | JSDocImpl)[] = [];
  statements: (stringOrWriterFunction | StatementStructures)[] = [];
  hasQuestionToken = false;
  hasOverrideKeyword = false;

  constructor(name: string) {
    super();
    this.name = name;
  }

  public static clone(
    other: OptionalKind<MethodDeclarationStructure>
  ): MethodDeclarationImpl
  {
    const clone = this.#cloneDeclarationOrSignature(other);

    clone.overloads = other.overloads?.slice() ?? [];
    clone.isStatic = other.isStatic ?? false;
    clone.decorators = cloneArrayOrUndefined<
      OptionalKind<DecoratorStructure>,
      typeof DecoratorImpl
    >(other.decorators,  DecoratorImpl);
    clone.isAbstract = other.isAbstract ?? false;
    clone.scope = other.scope;
    clone.isAsync = other.isAsync ?? false;
    clone.isGenerator = other.isGenerator ?? false;
    clone.statements = statementsArray(other);
    clone.hasOverrideKeyword = other.hasOverrideKeyword ?? false;

    return clone;
  }

  public static fromSignature(
    signature: TS_Method
  ): MethodDeclarationImpl
  {
    return this.#cloneDeclarationOrSignature(signature);
  }

  static #cloneDeclarationOrSignature(
    other: OptionalKind<MethodDeclarationStructure> | TS_Method
  ): MethodDeclarationImpl {
    const clone = new MethodDeclarationImpl(other.name);

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
MethodDeclarationImpl satisfies CloneableStructure<MethodDeclarationStructure>;
