import {
  IndexSignatureDeclarationStructure,
  OptionalKind,
  StructureKind,
} from "ts-morph";
import { CloneableStructure } from "../types/CloneableStructure.mjs";
import JSDocImpl from "./JSDocImpl.mjs";
import ReturnTypeWriterManager from "./ReturnTypeWriterManager.mjs";
import { stringOrWriterFunction } from "../types/ts-morph-native.mjs";
import { stringOrWriterFunctionArray } from "./utilities.mjs";

export default class CallSignatureDeclarationImpl
extends ReturnTypeWriterManager
implements IndexSignatureDeclarationStructure
{
  readonly kind: StructureKind.IndexSignature = StructureKind.IndexSignature;

  leadingTrivia: stringOrWriterFunction[] = [];
  trailingTrivia: stringOrWriterFunction[] = [];
  keyName: string | undefined;
  keyType: string | undefined;
  docs: (string | JSDocImpl)[] = [];
  isReadonly = false;

  public static clone(
    other: OptionalKind<IndexSignatureDeclarationStructure>
  ): CallSignatureDeclarationImpl
  {
    const declaration = new CallSignatureDeclarationImpl;

    declaration.leadingTrivia = stringOrWriterFunctionArray(other.leadingTrivia);
    declaration.trailingTrivia = stringOrWriterFunctionArray(other.trailingTrivia);
    declaration.docs = JSDocImpl.cloneArray(other);
    declaration.keyName = other.keyName;
    declaration.keyType = other.keyType;
    declaration.isReadonly = other.isReadonly ?? false;

    declaration.returnType = other.returnType;

    return declaration;
  }
}
CallSignatureDeclarationImpl satisfies CloneableStructure<IndexSignatureDeclarationStructure>;
