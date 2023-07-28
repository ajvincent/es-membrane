import {
  type OptionalKind,
  StructureKind,
  EnumDeclarationStructure,
  EnumMemberStructure,
} from "ts-morph";

import type {
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";

import {
  cloneArrayOrUndefined,
  stringOrWriterFunctionArray
} from "./utilities.mjs";
import { CloneableStructure } from "../types/CloneableStructure.mjs";
import JSDocImpl from "./JSDocImpl.mjs";

import cloneableStatementsMap from "./cloneableStatements.mjs";
import EnumMemberImpl from "./EnumMemberImpl.mjs";

export default class EnumDeclarationImpl implements EnumDeclarationStructure
{
  leadingTrivia: stringOrWriterFunction[] = [];
  trailingTrivia: stringOrWriterFunction[] = [];
  name: string;
  isConst = false;
  members: EnumMemberImpl[] = [];
  readonly kind: StructureKind.Enum = StructureKind.Enum;
  docs: (string | JSDocImpl)[] = [];
  hasDeclareKeyword = false;
  isExported = false;
  isDefaultExport = false;

  constructor(
    name: string
  )
  {
    this.name = name;
  }

  public static clone(
    other: EnumDeclarationStructure
  ): EnumDeclarationImpl
  {
    const clone = new EnumDeclarationImpl(other.name);

    clone.leadingTrivia = stringOrWriterFunctionArray(other.leadingTrivia);
    clone.trailingTrivia = stringOrWriterFunctionArray(other.trailingTrivia);
    clone.isConst = other.isConst ?? false;
    clone.members = cloneArrayOrUndefined<OptionalKind<EnumMemberStructure>, typeof EnumMemberImpl>(
      other.members, EnumMemberImpl
    );
    clone.docs = JSDocImpl.cloneArray(other);
    clone.hasDeclareKeyword = other.hasDeclareKeyword ?? false;
    clone.isExported = other.isExported ?? false;
    clone.isDefaultExport = other.isDefaultExport ?? false;

    return clone;
  }
}
EnumDeclarationImpl satisfies CloneableStructure<EnumDeclarationStructure>;

cloneableStatementsMap.set(StructureKind.Enum, EnumDeclarationImpl);
