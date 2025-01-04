import type {
  ClassStaticBlockDeclarationImpl,
  ConstructorDeclarationImpl,
  GetAccessorDeclarationImpl,
  MethodDeclarationImpl,
  PropertyDeclarationImpl,
  SetAccessorDeclarationImpl,
  stringOrWriterFunction,
  TypeStructures,
  TypeStructureSet,
} from "../../exports.js";
import type { StructureKind } from "ts-morph";

export interface ClassDeclarationStructureClassIfc {
  readonly kind: StructureKind.Class;
  readonly ctors: ConstructorDeclarationImpl[];
  extends?: stringOrWriterFunction;
  extendsStructure: TypeStructures | undefined;
  readonly getAccessors: GetAccessorDeclarationImpl[];
  /** Treat this as a read-only array.  Use `.implementsSet` to modify this. */
  readonly implements: stringOrWriterFunction[];
  readonly implementsSet: TypeStructureSet;
  readonly methods: MethodDeclarationImpl[];
  readonly properties: PropertyDeclarationImpl[];
  readonly setAccessors: SetAccessorDeclarationImpl[];
  readonly staticBlocks: ClassStaticBlockDeclarationImpl[];
}
