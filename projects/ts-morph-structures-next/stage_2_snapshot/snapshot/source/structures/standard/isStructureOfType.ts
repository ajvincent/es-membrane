import type {
  ClassMemberStructureImpls,
  JsxStructureImpls,
  ObjectLiteralExpressionPropertyStructureImpls,
  StatementStructureImpls,
  StructureImpls,
  TypeElementMemberStructureImpls,
} from "../../exports.js";
import { StructureKind } from "ts-morph";

export function isClassMemberStructure(
  structure: StructureImpls,
): structure is ClassMemberStructureImpls {
  switch (structure.kind) {
    case StructureKind.ClassStaticBlock:
    case StructureKind.Constructor:
    case StructureKind.GetAccessor:
    case StructureKind.Method:
    case StructureKind.Property:
    case StructureKind.SetAccessor:
      return true;
  }

  return false;
}

export function isJsxStructure(
  structure: StructureImpls,
): structure is JsxStructureImpls {
  switch (structure.kind) {
    case StructureKind.JsxAttribute:
    case StructureKind.JsxElement:
    case StructureKind.JsxSelfClosingElement:
    case StructureKind.JsxSpreadAttribute:
      return true;
  }

  return false;
}

export function isObjectLiteralExpressionPropertyStructure(
  structure: StructureImpls,
): structure is ObjectLiteralExpressionPropertyStructureImpls {
  switch (structure.kind) {
    case StructureKind.GetAccessor:
    case StructureKind.Method:
    case StructureKind.PropertyAssignment:
    case StructureKind.SetAccessor:
    case StructureKind.ShorthandPropertyAssignment:
    case StructureKind.SpreadAssignment:
      return true;
  }

  return false;
}

export function isStatementStructure(
  structure: StructureImpls,
): structure is StatementStructureImpls {
  switch (structure.kind) {
    case StructureKind.Class:
    case StructureKind.Enum:
    case StructureKind.ExportAssignment:
    case StructureKind.ExportDeclaration:
    case StructureKind.Function:
    case StructureKind.ImportDeclaration:
    case StructureKind.Interface:
    case StructureKind.Module:
    case StructureKind.TypeAlias:
    case StructureKind.VariableStatement:
      return true;
  }

  return false;
}

export function isTypeElementMemberStructure(
  structure: StructureImpls,
): structure is TypeElementMemberStructureImpls {
  switch (structure.kind) {
    case StructureKind.CallSignature:
    case StructureKind.ConstructSignature:
    case StructureKind.IndexSignature:
    case StructureKind.MethodSignature:
    case StructureKind.PropertySignature:
      return true;
  }

  return false;
}
