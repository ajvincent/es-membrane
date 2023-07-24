import {
  InterfaceDeclarationStructure,
  OptionalKind,
  StructureKind,
} from "ts-morph";

import {
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";

import {
  CloneableStructure
} from "../types/CloneableStructure.mjs";
import TypeParameterDeclarationImpl from "./TypeParameterDeclarationImpl.mjs";
import { stringOrWriterFunctionArray } from "./utilities.mjs";
import MethodSignatureImpl from "./MethodSignatureImpl.mjs";
import JSDocImpl from "./JSDocImpl.mjs";
import CallSignatureDeclarationImpl from "./CallSignatureDeclarationImpl.mjs";
import ConstructSignatureDeclarationImpl from "./ConstructSignatureDeclarationImpl.mjs";
import IndexSignatureDeclarationImpl from "./IndexSignatureDeclarationImpl.mjs";
import PropertySignatureImpl from "./PropertySignatureImpl.mjs";

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
    if (other.typeParameters) {
      declaration.typeParameters = other.typeParameters.map(typeParam => {
        if (typeof typeParam === "string")
          return typeParam;
        return TypeParameterDeclarationImpl.clone(typeParam);
      })
    }

    if (other.docs) {
      declaration.docs = other.docs.map(doc => {
        if (typeof doc === "string")
          return doc;
        return JSDocImpl.clone(doc);
      })
    }

    declaration.hasDeclareKeyword = other.hasDeclareKeyword ?? false;
    declaration.isExported = other.isExported ?? false;
    declaration.isDefaultExport = other.isDefaultExport ?? false;

    if (other.callSignatures) {
      declaration.callSignatures = other.callSignatures.map(signature => CallSignatureDeclarationImpl.clone(signature));
    }
    if (other.constructSignatures) {
      declaration.constructSignatures = other.constructSignatures.map(signature => ConstructSignatureDeclarationImpl.clone(signature));
    }
    if (other.indexSignatures) {
      declaration.indexSignatures = other.indexSignatures.map(signature => IndexSignatureDeclarationImpl.clone(signature));
    }
    if (other.methods) {
      declaration.methods = other.methods.map(method => MethodSignatureImpl.clone(method));
    }
    if (other.properties) {
      declaration.properties = other.properties.map(prop => PropertySignatureImpl.clone(prop));
    }

    return declaration;
  }
}
InterfaceDeclarationImpl satisfies CloneableStructure<InterfaceDeclarationStructure>;
