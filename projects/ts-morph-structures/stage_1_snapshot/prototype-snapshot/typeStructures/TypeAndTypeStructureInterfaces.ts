import {
  CodeBlockWriter
} from "ts-morph";

import type {
  TypeStructures
} from "./TypeStructures.js";

import TypeStructureSet from "../base/TypeStructureSet.js";

import type {
  stringOrWriterFunction
} from "../types/ts-morph-native.js";

import {
   TypeParameterConstraintMode
} from "../exports.js";

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

  constraintWriter(
    writer: CodeBlockWriter,
    constraintMode: TypeParameterConstraintMode
  ): void;

  defaultStructure: TypeStructures | undefined;
  default: stringOrWriterFunction | undefined;
}

export interface ClassDeclarationWithImplementsTypeStructures
{
  implementsSet: TypeStructureSet;
  implements: stringOrWriterFunction[];
}

export interface InterfaceDeclarationWithExtendsTypeStructures
{
  extendsSet: TypeStructureSet;
  extends: stringOrWriterFunction[];
}
