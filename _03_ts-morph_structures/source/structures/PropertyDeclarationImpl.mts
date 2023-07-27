import {
  DecoratorStructure,
  OptionalKind,
  PropertyDeclarationStructure,
  Scope,
  StructureKind,
} from "ts-morph";

import {
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";

import {
  CloneableStructure
} from "../types/CloneableStructure.mjs";
import { cloneArrayOrUndefined, stringOrWriterFunctionArray } from "./utilities.mjs";
import TypeWriterManager from "./TypeWriterManager.mjs";
import JSDocImpl from "./JSDocImpl.mjs";
import DecoratorImpl from "./DecoratorImpl.mjs";

export default class PropertyDeclarationImpl
extends TypeWriterManager
implements PropertyDeclarationStructure
{
  leadingTrivia: stringOrWriterFunction[] = [];
  trailingTrivia: stringOrWriterFunction[] = [];
  readonly kind: StructureKind.Property = StructureKind.Property
  hasAccessorKeyword = false;
  name: string;
  hasQuestionToken = false;
  hasExclamationToken = false;
  isStatic = false;
  scope: Scope | undefined = undefined;
  docs: (string | JSDocImpl)[] = [];
  isReadonly = false;
  initializer: stringOrWriterFunction | undefined;
  decorators: DecoratorImpl[] = [];
  isAbstract = false;
  hasDeclareKeyword = false;
  hasOverrideKeyword = false;

  constructor(name: string)
  {
    super();
    this.name = name;
  }

  public static clone(
    other: OptionalKind<PropertyDeclarationStructure>
  ): PropertyDeclarationImpl
  {
    const declaration = new PropertyDeclarationImpl(other.name);

    declaration.leadingTrivia = stringOrWriterFunctionArray(other.leadingTrivia);
    declaration.trailingTrivia = stringOrWriterFunctionArray(other.trailingTrivia);
    declaration.hasAccessorKeyword = other.hasAccessorKeyword ?? false;
    declaration.hasQuestionToken = other.hasQuestionToken ?? false;
    declaration.hasExclamationToken = other.hasExclamationToken ?? false;
    declaration.isStatic = other.isStatic ?? false;
    declaration.scope = other.scope;

    declaration.docs = JSDocImpl.cloneArray(other);
    declaration.isReadonly = other.isReadonly ?? false;
    declaration.initializer = other.initializer;

    declaration.decorators = cloneArrayOrUndefined<OptionalKind<DecoratorStructure>, typeof DecoratorImpl>(
      other.decorators, DecoratorImpl
    );
    declaration.isAbstract = other.isAbstract ?? false;
    declaration.hasDeclareKeyword = other.hasDeclareKeyword ?? false;
    declaration.hasOverrideKeyword = other.hasOverrideKeyword ?? false;

    return declaration;
  }
}
PropertyDeclarationImpl satisfies CloneableStructure<PropertyDeclarationStructure>;

