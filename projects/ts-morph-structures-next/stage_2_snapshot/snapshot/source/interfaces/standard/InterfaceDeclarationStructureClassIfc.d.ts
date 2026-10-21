import type {
  CallSignatureDeclarationImpl,
  ConstructSignatureDeclarationImpl,
  GetAccessorDeclarationImpl,
  IndexSignatureDeclarationImpl,
  MethodSignatureImpl,
  PropertySignatureImpl,
  SetAccessorDeclarationImpl,
  stringOrWriterFunction,
  TypeStructures,
} from "../../exports.js";
import type { StructureKind } from "ts-morph";

export interface InterfaceDeclarationStructureClassIfc {
  readonly kind: StructureKind.Interface;
  readonly callSignatures: CallSignatureDeclarationImpl[];
  readonly constructSignatures: ConstructSignatureDeclarationImpl[];
  readonly extends: stringOrWriterFunction[];
  readonly extendsSequence: TypeStructures[];
  readonly getAccessors: GetAccessorDeclarationImpl[];
  readonly indexSignatures: IndexSignatureDeclarationImpl[];
  readonly methods: MethodSignatureImpl[];
  readonly properties: PropertySignatureImpl[];
  readonly setAccessors: SetAccessorDeclarationImpl[];
}
