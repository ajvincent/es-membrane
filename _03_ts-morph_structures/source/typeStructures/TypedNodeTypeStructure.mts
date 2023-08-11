import type {
  WriterFunction,
} from "ts-morph";

import type {
  TypeStructure
} from "./TypeStructure.mjs";

import TypeWriterSet from "../array-utilities/TypeWriterSet.mjs";

import type {
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";

export interface TypedNodeTypeStructure
{
  typeStructure: TypeStructure | undefined;
  type: string | WriterFunction | undefined;
}

export interface ReturnTypedNodeTypeStructure
{
  returnTypeStructure: TypeStructure | undefined;
  returnType: stringOrWriterFunction | undefined;
}

export interface TypeParameterWithTypeStructures
{
  constraintStructure: TypeStructure | undefined;
  constraint: stringOrWriterFunction | undefined;

  defaultStructure: TypeStructure | undefined;
  default: stringOrWriterFunction | undefined;
}

export interface ClassDeclarationWithImplementsTypeStructures
{
  implementsSet: TypeWriterSet;
  implements: stringOrWriterFunction[];
}
