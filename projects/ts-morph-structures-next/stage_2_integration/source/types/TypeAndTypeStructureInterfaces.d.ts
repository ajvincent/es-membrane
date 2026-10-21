import type {
  TypeStructures,
  stringOrWriterFunction,
} from "../../snapshot/source/exports.js";

import type {
  TypeStructureSequence
} from "../../snapshot/source/internal-exports.ts";

export interface TypedNodeTypeStructure
{
  typeStructure: TypeStructures | undefined;
  type: stringOrWriterFunction | undefined;
}

export interface ReturnTypedNodeTypeStructure
{
  returnTypeStructure: TypeStructures | undefined;
  returnType: stringOrWriterFunction | undefined;
}

export interface TypeParameterWithTypeStructures
{
  constraintStructure: TypeStructures | undefined;
  constraint: stringOrWriterFunction | undefined;

  defaultStructure: TypeStructures | undefined;
  default: stringOrWriterFunction | undefined;
}

export interface ClassDeclarationWithImplementsTypeStructures
{
  implementsSequence: TypeStructureSequence;
  implements: stringOrWriterFunction[];
}

export interface InterfaceDeclarationWithExtendsTypeStructures
{
  extendsSequence: TypeStructureSequence;
  extends: stringOrWriterFunction[];
}
