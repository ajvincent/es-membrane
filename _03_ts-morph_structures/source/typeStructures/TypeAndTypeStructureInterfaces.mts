import type {
  TypeStructure
} from "./TypeStructure.mjs";

import TypeWriterSet from "../base/TypeWriterSet.mjs";

import type {
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";

export interface TypedNodeTypeStructure
{
  typeStructure: TypeStructure | undefined;
  type: stringOrWriterFunction | undefined;
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
