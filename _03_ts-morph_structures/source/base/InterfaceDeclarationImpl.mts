import {
  CallSignatureDeclarationStructure,
  ConstructSignatureDeclarationStructure,
  IndexSignatureDeclarationStructure,
  InterfaceDeclarationStructure,
  OptionalKind,
  PropertySignatureStructure,
  StructureKind,
} from "ts-morph";

import {
  TS_Method,
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";

import {
  CloneableStructure
} from "../types/CloneableStructure.mjs";
import TypeParameterDeclarationImpl from "./TypeParameterDeclarationImpl.mjs";
import { cloneArrayOrUndefined, stringOrWriterFunctionArray } from "./utilities.mjs";
import MethodSignatureImpl from "./MethodSignatureImpl.mjs";
import JSDocImpl from "./JSDocImpl.mjs";
import CallSignatureDeclarationImpl from "./CallSignatureDeclarationImpl.mjs";
import ConstructSignatureDeclarationImpl from "./ConstructSignatureDeclarationImpl.mjs";
import IndexSignatureDeclarationImpl from "./IndexSignatureDeclarationImpl.mjs";
import PropertySignatureImpl from "./PropertySignatureImpl.mjs";
import cloneableStatementsMap from "./cloneableStatements.mjs";

export default class InterfaceDeclarationImpl
implements InterfaceDeclarationStructure
{
  leadingTrivia: stringOrWriterFunction[] = [];
  trailingTrivia: stringOrWriterFunction[] = [];
  name: string;
  readonly kind: StructureKind.Interface = StructureKind.Interface;
  extends: stringOrWriterFunction[] = [];
  typeParameters: (string | TypeParameterDeclarationImpl)[] = [];
  docs: (string | JSDocImpl)[] = [];
  hasDeclareKeyword = false;
  isExported = false;
  isDefaultExport = false;
  callSignatures: CallSignatureDeclarationImpl[] = [];
  constructSignatures: ConstructSignatureDeclarationImpl[] = [];
  indexSignatures: IndexSignatureDeclarationImpl[] = [];
  methods: MethodSignatureImpl[] = [];
  properties: PropertySignatureImpl[] = [];

  constructor(
    name: string
  )
  {
    this.name = name;
  }

  public static clone(
    other: OptionalKind<InterfaceDeclarationStructure>
  ): InterfaceDeclarationImpl
  {
    const declaration = new InterfaceDeclarationImpl(other.name);

    declaration.leadingTrivia = stringOrWriterFunctionArray(other.leadingTrivia);
    declaration.trailingTrivia = stringOrWriterFunctionArray(other.trailingTrivia);
    declaration.extends = stringOrWriterFunctionArray(other.extends);
    declaration.typeParameters = TypeParameterDeclarationImpl.cloneArray(other);
    declaration.docs = JSDocImpl.cloneArray(other);
    declaration.hasDeclareKeyword = other.hasDeclareKeyword ?? false;
    declaration.isExported = other.isExported ?? false;
    declaration.isDefaultExport = other.isDefaultExport ?? false;

    declaration.callSignatures = cloneArrayOrUndefined<OptionalKind<CallSignatureDeclarationStructure>, typeof CallSignatureDeclarationImpl>(
      other.callSignatures, CallSignatureDeclarationImpl
    );
    declaration.constructSignatures = cloneArrayOrUndefined<OptionalKind<ConstructSignatureDeclarationStructure>, typeof ConstructSignatureDeclarationImpl>(
      other.constructSignatures, ConstructSignatureDeclarationImpl
    );
    declaration.indexSignatures = cloneArrayOrUndefined<OptionalKind<IndexSignatureDeclarationStructure>, typeof IndexSignatureDeclarationImpl>(
      other.indexSignatures, IndexSignatureDeclarationImpl
    );
    declaration.methods = cloneArrayOrUndefined<TS_Method, typeof MethodSignatureImpl>(
      other.methods, MethodSignatureImpl
    );
    declaration.properties = cloneArrayOrUndefined<OptionalKind<PropertySignatureStructure>, typeof PropertySignatureImpl>(
      other.properties, PropertySignatureImpl
    );

    return declaration;
  }
}
InterfaceDeclarationImpl satisfies CloneableStructure<InterfaceDeclarationStructure>;

cloneableStatementsMap.set(StructureKind.Interface, InterfaceDeclarationImpl);
