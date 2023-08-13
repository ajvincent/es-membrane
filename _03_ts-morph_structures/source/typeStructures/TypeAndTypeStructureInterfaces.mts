import type {
  TypeStructures
} from "./TypeStructures.mjs";

import TypeWriterSet from "../base/TypeWriterSet.mjs";

import type {
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";

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
  implementsSet: TypeWriterSet;
  implements: stringOrWriterFunction[];
}
