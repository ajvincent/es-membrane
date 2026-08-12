import type {
  CallSignatureDeclarationImpl,
  ConstructSignatureDeclarationImpl,
  GetAccessorDeclarationImpl,
  IndexSignatureDeclarationImpl,
  MethodSignatureImpl,
  PropertySignatureImpl,
  SetAccessorDeclarationImpl,
  stringOrWriterFunction,
  TypeStructureSet,
} from "../../exports.js";
import type { StructureKind } from "ts-morph";

export interface InterfaceDeclarationStructureClassIfc {
  readonly kind: StructureKind.Interface;
  readonly callSignatures: CallSignatureDeclarationImpl[];
  readonly constructSignatures: ConstructSignatureDeclarationImpl[];
  /** Treat this as a read-only array.  Use `.extendsSet` to modify this. */
  readonly extends: stringOrWriterFunction[];
  readonly extendsSet: TypeStructureSet;
  readonly getAccessors: GetAccessorDeclarationImpl[];
  readonly indexSignatures: IndexSignatureDeclarationImpl[];
  readonly methods: MethodSignatureImpl[];
  readonly properties: PropertySignatureImpl[];
  readonly setAccessors: SetAccessorDeclarationImpl[];
}
