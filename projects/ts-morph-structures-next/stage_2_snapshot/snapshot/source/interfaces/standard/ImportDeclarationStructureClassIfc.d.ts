import type {
  ImportAttributeImpl,
  ImportSpecifierImpl,
  stringOrWriterFunction,
} from "../../exports.js";
import type { StructureKind } from "ts-morph";

export interface ImportDeclarationStructureClassIfc {
  readonly kind: StructureKind.ImportDeclaration;
  attributes?: ImportAttributeImpl[];
  defaultImport?: string;
  isTypeOnly: boolean;
  moduleSpecifier: string;
  readonly namedImports: (ImportSpecifierImpl | stringOrWriterFunction)[];
  namespaceImport?: string;
}
