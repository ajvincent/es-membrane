import { DecoratorStructure, OptionalKind, ParameterDeclarationStructure, Scope, StructureKind } from "ts-morph";
import {
  TS_Parameter,
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";

import {
  cloneArrayOrUndefined,
} from "./utilities.mjs";

import DecoratorImpl from "./DecoratorImpl.mjs";
import { CloneableStructure } from "../types/CloneableStructure.mjs";

import TypeWriterManager from "./TypeWriterManager.mjs";
import StructureBase from "../decorators/StructureBase.mjs";

export default class ParameterDeclarationImpl
extends TypeWriterManager
implements TS_Parameter
{
  leadingTrivia: stringOrWriterFunction[] = [];
  trailingTrivia: stringOrWriterFunction[] = [];
  name: string;
  isReadonly = false;
  decorators: DecoratorImpl[] = [];
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
    super();
    this.name = name;
  }

  public static clone(
    other: TS_Parameter
  ): ParameterDeclarationImpl
  {
    const newParameter = new ParameterDeclarationImpl(other.name);

    StructureBase.cloneTrivia(other, newParameter);

    newParameter.type = other.type;
    newParameter.isReadonly = other.isReadonly ?? false;

    newParameter.decorators = cloneArrayOrUndefined<OptionalKind<DecoratorStructure>, typeof DecoratorImpl>(
      other.decorators, DecoratorImpl
    );

    newParameter.hasQuestionToken = other.hasQuestionToken ?? false;
    newParameter.scope = other.scope;
    newParameter.initializer = other.initializer;
    newParameter.isRestParameter = other.isRestParameter ?? false;
    newParameter.hasOverrideKeyword = other.hasOverrideKeyword ?? false;

    return newParameter;
  }
}
ParameterDeclarationImpl satisfies CloneableStructure<ParameterDeclarationStructure>;
