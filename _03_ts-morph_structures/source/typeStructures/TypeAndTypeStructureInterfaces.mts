import {
  CodeBlockWriter
} from "ts-morph";

import type {
  TypeStructures
} from "./TypeStructures.mjs";

import TypeStructureSet from "../base/TypeStructureSet.mjs";

import type {
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";

import {
   TypeParameterConstraintMode
} from "../../exports.mjs";

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
