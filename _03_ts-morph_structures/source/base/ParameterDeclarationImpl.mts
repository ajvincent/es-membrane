import { OptionalKind, ParameterDeclarationStructure, Scope, StructureKind } from "ts-morph";
import {
  TS_Parameter,
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";

import {
  stringOrWriterFunctionArray,
} from "./utilities.mjs";

import DecoratorImpl from "./DecoratorImpl.mjs";
import { CloneableStructure } from "../types/CloneableStructure.mjs";

export default class ParameterDeclarationImpl implements TS_Parameter
{
  leadingTrivia: stringOrWriterFunction[] = [];
  trailingTrivia: stringOrWriterFunction[] = [];
  name: string;
  type: stringOrWriterFunction | undefined = undefined;
  isReadonly = false;
  decorators: OptionalKind<DecoratorImpl>[] = [];
  hasQuestionToken = false;
  scope: Scope | undefined = undefined;
  initializer: stringOrWriterFunction | undefined = undefined;
  isRestParameter = false;
  hasOverrideKeyword = false;
  readonly kind: StructureKind.Parameter = StructureKind.Parameter;

  constructor(
    name: string
  )
  {
    this.name = name;
  }

  public static clone(
    other: TS_Parameter
  ): ParameterDeclarationImpl
  {
    const newParameter = new ParameterDeclarationImpl(other.name);

    newParameter.leadingTrivia = stringOrWriterFunctionArray(other.leadingTrivia);
    newParameter.trailingTrivia = stringOrWriterFunctionArray(other.trailingTrivia);
    newParameter.type = other.type;
    newParameter.isReadonly = other.isReadonly ?? false;

    if (Array.isArray(other.decorators)) {
      newParameter.decorators = other.decorators.map(decorator => DecoratorImpl.clone(decorator));
    }
    else {
      newParameter.decorators = [];
    }

    newParameter.hasQuestionToken = other.hasQuestionToken ?? false;
    newParameter.scope = other.scope;
    newParameter.initializer = other.initializer;
    newParameter.isRestParameter = other.isRestParameter ?? false;
    newParameter.hasOverrideKeyword = other.hasOverrideKeyword ?? false;

    return newParameter;
  }
}
ParameterDeclarationImpl satisfies CloneableStructure<ParameterDeclarationStructure>;
