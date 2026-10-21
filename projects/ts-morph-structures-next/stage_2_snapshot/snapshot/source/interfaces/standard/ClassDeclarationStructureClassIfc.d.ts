import type {
  ClassStaticBlockDeclarationImpl,
  ConstructorDeclarationImpl,
  GetAccessorDeclarationImpl,
  MethodDeclarationImpl,
  PropertyDeclarationImpl,
  SetAccessorDeclarationImpl,
  stringOrWriterFunction,
  TypeStructures,
} from "../../exports.js";
import type { StructureKind } from "ts-morph";

export interface ClassDeclarationStructureClassIfc {
  readonly kind: StructureKind.Class;
  readonly ctors: ConstructorDeclarationImpl[];
  extends?: stringOrWriterFunction;
  extendsStructure: TypeStructures | undefined;
  readonly getAccessors: GetAccessorDeclarationImpl[];
  readonly implements: stringOrWriterFunction[];
  readonly implementsSequence: TypeStructures[];
  readonly methods: MethodDeclarationImpl[];
  readonly properties: PropertyDeclarationImpl[];
  readonly setAccessors: SetAccessorDeclarationImpl[];
  readonly staticBlocks: ClassStaticBlockDeclarationImpl[];
}
