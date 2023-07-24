import {
  type OptionalKind,
  type ClassDeclarationStructure,
  StructureKind,
  DecoratorStructure,
  ConstructorDeclarationStructure,
  GetAccessorDeclarationStructure,
  MethodDeclarationStructure,
  SetAccessorDeclarationStructure,
  MethodSignatureStructure,
  PropertyDeclarationStructure,
} from "ts-morph";

import type {
  TS_Method,
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";

import {
  cloneArrayOrUndefined,
  stringOrWriterFunctionArray
} from "./utilities.mjs";
import MethodDeclarationImpl from "./MethodDeclarationImpl.mjs";
import DecoratorImpl from "./DecoratorImpl.mjs";
import TypeParameterDeclarationImpl from "./TypeParameterDeclarationImpl.mjs";
import { CloneableStructure } from "../types/CloneableStructure.mjs";
import JSDocImpl from "./JSDocImpl.mjs";
import PropertyDeclarationImpl from "./PropertyDeclarationImpl.mjs";

export default class ClassDeclarationImpl implements ClassDeclarationStructure
{
  name: string | undefined = undefined;
  leadingTrivia: stringOrWriterFunction[] = [];
  trailingTrivia: stringOrWriterFunction[] = [];
  extends: stringOrWriterFunction | undefined = undefined;
  ctors: OptionalKind<ConstructorDeclarationStructure>[] | undefined = undefined;
  properties: PropertyDeclarationImpl[] = [];
  getAccessors: OptionalKind<GetAccessorDeclarationStructure>[] | undefined = undefined;
  setAccessors: OptionalKind<SetAccessorDeclarationStructure>[] | undefined = undefined;
  methods: MethodDeclarationImpl[] = [];
  implements: stringOrWriterFunction[] = [];
  decorators: DecoratorImpl[] = [];
  typeParameters: (string | TypeParameterDeclarationImpl)[] = [];
  docs: (string | JSDocImpl)[] = [];
  isAbstract = false;
  readonly kind: StructureKind.Class = StructureKind.Class;
  hasDeclareKeyword = false;
  isExported = false;
  isDefaultExport = false;

  public static clone(
    other: OptionalKind<ClassDeclarationStructure>
  ): ClassDeclarationImpl
  {
    const clone = new ClassDeclarationImpl;

    clone.name = other.name;
    clone.leadingTrivia = stringOrWriterFunctionArray(other.leadingTrivia);
    clone.trailingTrivia = stringOrWriterFunctionArray(other.trailingTrivia);
    clone.extends = other.extends;
    if (other.ctors) {
      clone.ctors = other.ctors.slice();
    }
    clone.properties = cloneArrayOrUndefined<OptionalKind<PropertyDeclarationStructure>, typeof PropertyDeclarationImpl>(
      other.properties, PropertyDeclarationImpl
    );
    if (other.getAccessors) {
      clone.getAccessors = other.getAccessors.slice();
    }
    if (other.setAccessors) {
      clone.setAccessors = other.setAccessors.slice();
    }
    clone.methods = cloneArrayOrUndefined<OptionalKind<MethodDeclarationStructure>, typeof MethodDeclarationImpl>(
      other.methods, MethodDeclarationImpl
    );
    clone.implements = stringOrWriterFunctionArray(other.implements);
    clone.decorators = cloneArrayOrUndefined<OptionalKind<DecoratorStructure>, typeof DecoratorImpl>(
      other.decorators, DecoratorImpl
    );
    clone.typeParameters = TypeParameterDeclarationImpl.cloneArray(other);
    clone.docs = JSDocImpl.cloneArray(other);

    clone.isAbstract = other.isAbstract ?? false;
    clone.hasDeclareKeyword = other.hasDeclareKeyword ?? false;
    clone.isExported = other.isExported ?? false;
    clone.isDefaultExport = other.isDefaultExport ?? false;

    return clone;
  }

  public static fromMethodsOnly(
    methods: readonly OptionalKind<MethodSignatureStructure>[]
  ): ClassDeclarationImpl
  {
    const classImpl = new ClassDeclarationImpl;

    classImpl.methods = methods.map(
      (methodSignature: TS_Method) => MethodDeclarationImpl.fromSignature(methodSignature)
    );

    return classImpl;
  }
}
ClassDeclarationImpl satisfies CloneableStructure<ClassDeclarationStructure>;
