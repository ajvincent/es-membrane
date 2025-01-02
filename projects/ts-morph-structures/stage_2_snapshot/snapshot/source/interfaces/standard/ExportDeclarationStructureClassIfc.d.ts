import type {
  ExportSpecifierImpl,
  ImportAttributeImpl,
  stringOrWriterFunction,
} from "../../exports.js";
import type { StructureKind } from "ts-morph";

export interface ExportDeclarationStructureClassIfc {
  readonly kind: StructureKind.ExportDeclaration;
  attributes?: ImportAttributeImpl[];
  isTypeOnly: boolean;
  moduleSpecifier?: string;
  readonly namedExports: (ExportSpecifierImpl | stringOrWriterFunction)[];
  namespaceExport?: string;
}
